"""
SafeRaste Backend API (Vercel Serverless Version)
Uses lightweight httpx to proxy requests to Cognee Cloud to bypass Vercel's 500MB limit.
"""

import os
import json
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

COGNEE_SERVICE_URL = os.getenv("COGNEE_SERVICE_URL", "https://tenant-e08b41bc-218e-486c-ba68-2e1fc2830092.aws.cognee.ai").rstrip("/")
COGNEE_API_KEY = os.getenv("COGNEE_API_KEY", "")

headers = {
    "X-Api-Key": COGNEE_API_KEY,
    "Content-Type": "application/json"
}

app = FastAPI(title="SafeRaste API (Vercel)")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

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

def build_report_payload(data: RememberRequest) -> str:
    return f"""SafeRaste Report
report_id: {data.report_id}
street_segment: StreetSegment: {data.street_segment}
grid_cell: {data.grid_cell}
time_bucket: TimeOfDayBucket: {data.time_bucket}
timestamp: {data.timestamp}
signal: {data.signal}
severity: {data.severity}
"""

def build_recall_system_prompt(time_bucket: str | None) -> str:
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

@app.get("/api/health")
async def health():
    return {"status": "ok", "mode": "vercel_httpx"}

@app.post("/api/remember")
async def api_remember(data: RememberRequest):
    payload = build_report_payload(data)
    
    # Send custom_prompt explicitly if needed, but standard payload structure
    request_data = {
        "datasetName": DATASET_NAME,
        "data": [payload],
        "custom_prompt": CUSTOM_PROMPT,
        "self_improvement": False
    }
    
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{COGNEE_SERVICE_URL}/api/v1/remember", headers=headers, json=request_data)
        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail=res.text)

    return {
        "status": "remembered",
        "report_id": data.report_id,
        "nodes_created": [{"type": "StreetSegment", "name": data.street_segment}]
    }

@app.post("/api/recall")
async def api_recall(query: RecallRequest):
    request_data = {
        "query": query.query_text,
        "datasets": [DATASET_NAME],
        "top_k": query.top_k,
        "node_name": ["Report", "StreetSegment", "TimeOfDayBucket"],
        "include_references": True,
        "system_prompt": build_recall_system_prompt(query.time_bucket)
    }
    
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{COGNEE_SERVICE_URL}/api/v1/recall", headers=headers, json=request_data)
        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        
        # Parse output similar to SDK
        results = res.json()
    
    parsed_results = []
    # If the response is a list of results with "text" fields
    for result in results if isinstance(results, list) else [results]:
        text = result.get("text", str(result)) if isinstance(result, dict) else str(result)
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
async def api_improve():
    request_data = {
        "dataset": DATASET_NAME,
        "build_global_context_index": True
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{COGNEE_SERVICE_URL}/api/v1/improve", headers=headers, json=request_data)
        if res.status_code == 404:
            return {"status": "skipped", "reason": "improve() not found on tenant"}
        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail=res.text)
            
    return {"status": "improved"}

@app.post("/api/forget")
async def api_forget():
    request_data = {
        "dataset": DATASET_NAME,
        "memory_only": True
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{COGNEE_SERVICE_URL}/api/v1/forget", headers=headers, json=request_data)
        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail=res.text)
            
    return {"status": "forgotten"}
