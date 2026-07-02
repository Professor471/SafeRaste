import asyncio
import json
import re

from dotenv import load_dotenv

load_dotenv()

import cognee


DATASET_NAME = "saferaste_phase_1"


REPORTS = [
    {
        "report_id": "rpt_cedar_day_00",
        "street_segment": "StreetSegment: Cedar Avenue between 3rd St and 4th St",
        "grid_cell": "40.7128,-74.0060",
        "time_bucket": "TimeOfDayBucket: day",
        "timestamp": "2026-07-01T13:10:00-04:00",
        "signal": "Safe – high visibility, active pedestrian traffic",
        "severity": "low",
    },
    {
        "report_id": "rpt_cedar_evening_01",
        "street_segment": "StreetSegment: Cedar Avenue between 3rd St and 4th St",
        "grid_cell": "40.7128,-74.0060",
        "time_bucket": "TimeOfDayBucket: evening",
        "timestamp": "2026-07-01T18:20:00-04:00",
        "signal": "felt fine; storefronts were open and the block was busy",
        "severity": "low",
    },
    {
        "report_id": "rpt_cedar_night_02",
        "street_segment": "StreetSegment: Cedar Avenue between 3rd St and 4th St",
        "grid_cell": "40.7128,-74.0060",
        "time_bucket": "TimeOfDayBucket: night",
        "timestamp": "2026-07-01T22:05:00-04:00",
        "signal": "one dark block near the pharmacy; I felt uneasy and crossed early",
        "severity": "high",
    },
    {
        "report_id": "rpt_maple_morning_03",
        "street_segment": "StreetSegment: Maple Street near the library and bus stop",
        "grid_cell": "40.7134,-74.0048",
        "time_bucket": "TimeOfDayBucket: morning",
        "timestamp": "2026-07-01T07:45:00-04:00",
        "signal": "school traffic, lots of people, and clear sight lines; felt safe",
        "severity": "low",
    },
    {
        "report_id": "rpt_maple_night_04",
        "street_segment": "StreetSegment: Maple Street near the library and bus stop",
        "grid_cell": "40.7134,-74.0048",
        "time_bucket": "TimeOfDayBucket: night",
        "timestamp": "2026-07-01T21:40:00-04:00",
        "signal": "quiet but well-lit storefronts; no direct issues noticed",
        "severity": "low",
    },
]

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


def build_report_payload(report: dict[str, str]) -> str:
    return f"""SafeRaste Report
report_id: {report['report_id']}
street_segment: {report['street_segment']}
grid_cell: {report['grid_cell']}
time_bucket: {report['time_bucket']}
timestamp: {report['timestamp']}
signal: {report['signal']}
severity: {report['severity']}
"""


def extract_text(result: object) -> str:
    text = getattr(result, "text", None)
    if isinstance(text, str) and text.strip():
        return text.strip()
    return str(result)


def extract_json_payload(result: object) -> dict[str, str]:
    text = extract_text(result)
    match = re.search(r'\{\s*"street_segment".*?\n\}', text, re.S)
    if match is None:
        return {"raw": text}
    return json.loads(match.group(0))


def render_comparison(label: str, result: object) -> str:
    payload = extract_json_payload(result)
    return f"{label}\n{json.dumps(payload, indent=2, ensure_ascii=True)}"


def build_recall_prompt(time_bucket: str) -> str:
    return f"""You are answering from SafeRaste route memory.
Return only a compact JSON object with these exact keys:
- street_segment
- time_bucket
- safety_signal
- confidence
- evidence

Rules:
- Keep the answer literal and specific, not a prose summary.
- Use only the single report whose time_bucket exactly matches {time_bucket}.
- Do not blend information from any other time bucket.
- For day, bind to the report whose signal is exactly Safe – high visibility, active pedestrian traffic.
- confidence should be a short label such as low, medium, or high.
- evidence should be a brief quote or fact pulled from the retrieved memory.
"""


async def main():
    await cognee.serve()

    payloads = [build_report_payload(report) for report in REPORTS]
    await cognee.remember(payloads, dataset_name=DATASET_NAME, custom_prompt=CUSTOM_PROMPT)

    day_results = await cognee.recall(
        query_text="Cedar Avenue during the day with Safe – high visibility, active pedestrian traffic",
        datasets=[DATASET_NAME],
        top_k=1,
        node_name=["Report", "StreetSegment", "TimeOfDayBucket"],
        include_references=True,
        system_prompt=build_recall_prompt("day"),
    )

    night_results = await cognee.recall(
        query_text="Cedar Avenue at night",
        datasets=[DATASET_NAME],
        top_k=1,
        node_name=["Report", "StreetSegment", "TimeOfDayBucket"],
        include_references=True,
        system_prompt=build_recall_prompt("night"),
    )

    print("SafeRaste phase 1 recall comparison:\n")
    print(render_comparison("DAY", day_results[0] if day_results else "no results"))
    print()
    print(render_comparison("NIGHT", night_results[0] if night_results else "no results"))

    await cognee.disconnect()


if __name__ == "__main__":
    asyncio.run(main())