"""
SafeRaste Backend API
Thin FastAPI layer that exposes Cognee's memory lifecycle APIs as HTTP endpoints.
The frontend calls these instead of simulating the lifecycle in JavaScript.
"""

import asyncio
import json
import re
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

import cognee
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


DATASET_NAME = "saferaste_pune_seed_v1"

CUSTOM_PROMPT = """You are ingesting SafeRaste route-safety memory.
Create and preserve these node types exactly: StreetSegment, Report, TimeOfDayBucket.
For each report:
- create one StreetSegment node from the street_segment and grid_cell fields
- create one TimeOfDayBucket node from the time_bucket field
- create one Report node with report_id, timestamp, signal, and severity
- connect Report -> StreetSegment with an about relationship
- connect Report -> TimeOfDayBucket with an occurred_at relationship
Merge identical StreetSegment and TimeOfDayBucket values across reports so the graph can answer time-aware questions later.
"""


# ---------------------------------------------------------------------------
# Cognee lifecycle management — serve() on startup, disconnect() on shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app):
    await cognee.serve()
    yield
    await cognee.disconnect()


app = FastAPI(
    title="SafeRaste API",
    description="Cognee-backed memory lifecycle for women's route safety",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------
class RememberRequest(BaseModel):
    report_id: str
    street_segment: str
    grid_cell: str
    time_bucket: str
    timestamp: str
    signal: str
    severity: str
    note: str | None = None
    left_light: str | None = None


class RecallRequest(BaseModel):
    query_text: str
    time_bucket: str | None = None
    top_k: int = 3


class ForgetRequest(BaseModel):
    dataset: str | None = None


class ImproveRequest(BaseModel):
    dataset: str | None = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def build_report_payload(data: RememberRequest) -> str:
    """Format a report into the same structured text used by seed_data.py."""
    return f"""SafeRaste Report
report_id: {data.report_id}
street_segment: StreetSegment: {data.street_segment}
grid_cell: {data.grid_cell}
time_bucket: TimeOfDayBucket: {data.time_bucket}
timestamp: {data.timestamp}
signal: {data.signal}
severity: {data.severity}
"""


def extract_text(result: object) -> str:
    """Pull a readable string from a Cognee recall result."""
    text = getattr(result, "text", None)
    if isinstance(text, str) and text.strip():
        return text.strip()
    return str(result)


def build_recall_system_prompt(time_bucket: str | None) -> str:
    """Build a system prompt that keeps recall answers structured."""
    bucket_clause = f"Filter results to time_bucket matching {time_bucket}." if time_bucket else ""
    return f"""You are answering from SafeRaste route memory.
Return only a compact JSON object with these exact keys:
- street_segment
- time_bucket
- safety_signal
- confidence
- evidence

Rules:
- Keep the answer literal and specific, not a prose summary.
{bucket_clause}
- confidence should be a short label such as low, medium, or high.
- evidence should be a brief quote or fact pulled from the retrieved memory.
"""


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    return {"status": "ok", "dataset": DATASET_NAME}


@app.post("/api/remember")
async def api_remember(data: RememberRequest):
    """Ingest a new safety report into the Cognee knowledge graph."""
    payload = build_report_payload(data)
    try:
        await cognee.remember(
            [payload],
            dataset_name=DATASET_NAME,
            custom_prompt=CUSTOM_PROMPT,
            self_improvement=False,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"remember() failed: {exc}")

    return {
        "status": "remembered",
        "report_id": data.report_id,
        "nodes_created": [
            {"type": "StreetSegment", "name": data.street_segment, "grid_cell": data.grid_cell},
            {"type": "Report", "report_id": data.report_id, "signal": data.signal, "severity": data.severity},
            {"type": "TimeOfDayBucket", "value": data.time_bucket},
        ],
        "edges_created": [
            {"from": data.report_id, "to": data.street_segment, "type": "about"},
            {"from": data.report_id, "to": data.time_bucket, "type": "occurred_at"},
        ],
    }


@app.post("/api/recall")
async def api_recall(query: RecallRequest):
    """Query the Cognee knowledge graph for safety reports."""
    try:
        results = await cognee.recall(
            query_text=query.query_text,
            datasets=[DATASET_NAME],
            top_k=query.top_k,
            node_name=["Report", "StreetSegment", "TimeOfDayBucket"],
            include_references=True,
            system_prompt=build_recall_system_prompt(query.time_bucket),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"recall() failed: {exc}")

    parsed_results = []
    for result in results:
        text = extract_text(result)
        # Try to parse JSON from the response
        json_match = re.search(r'\{[^{}]*"street_segment"[^{}]*\}', text, re.S)
        if json_match:
            try:
                parsed_results.append(json.loads(json_match.group(0)))
            except json.JSONDecodeError:
                parsed_results.append({"raw": text})
        else:
            parsed_results.append({"raw": text})

    return {"results": parsed_results, "count": len(parsed_results)}


@app.post("/api/improve")
async def api_improve(data: ImproveRequest):
    """Run Cognee's improve() for post-ingestion enrichment."""
    dataset = data.dataset or DATASET_NAME
    try:
        await cognee.improve(dataset=dataset, build_global_context_index=True)
        return {"status": "improved", "dataset": dataset}
    except RuntimeError as exc:
        # improve() may not be exposed on all Cognee Cloud tenants (returns 404)
        if "404" in str(exc) or "Not Found" in str(exc):
            return {
                "status": "skipped",
                "reason": "improve() is not exposed on this Cognee Cloud tenant. Local confidence math is used as fallback.",
                "dataset": dataset,
            }
        raise HTTPException(status_code=500, detail=f"improve() failed: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"improve() failed: {exc}")


@app.post("/api/forget")
async def api_forget(data: ForgetRequest):
    """Prune stale memory from the Cognee knowledge graph."""
    dataset = data.dataset or DATASET_NAME
    try:
        await cognee.forget(dataset=dataset, memory_only=True)
        return {"status": "forgotten", "dataset": dataset}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"forget() failed: {exc}")
