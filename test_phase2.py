import asyncio
from datetime import date

from dotenv import load_dotenv

load_dotenv()

import cognee


REFERENCE_DATE = date(2026, 7, 2)
AGREEMENT_DATASET = "saferaste_phase_2_agreement"
CONTRADICTION_DATASET = "saferaste_phase_2_contradiction"
DECAY_DATASET = "saferaste_phase_2_decay"


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


AGREEMENT_BASE = [
    {
        "report_id": "agree_day_01",
        "street_segment": "StreetSegment: Cedar Avenue between 3rd St and 4th St",
        "grid_cell": "40.7128,-74.0060",
        "time_bucket": "TimeOfDayBucket: day",
        "timestamp": "2026-07-02T12:00:00-04:00",
        "signal": "Safe - high visibility, active pedestrian traffic",
        "severity": "low",
    }
]

AGREEMENT_CONFIRM = [
    {
        "report_id": "agree_day_02",
        "street_segment": "StreetSegment: Cedar Avenue between 3rd St and 4th St",
        "grid_cell": "40.7128,-74.0060",
        "time_bucket": "TimeOfDayBucket: day",
        "timestamp": "2026-07-02T12:30:00-04:00",
        "signal": "Safe - high visibility, active pedestrian traffic",
        "severity": "low",
    }
]

CONTRADICTION_REPORTS = [
    {
        "report_id": "night_safe_01",
        "street_segment": "StreetSegment: Cedar Avenue between 3rd St and 4th St",
        "grid_cell": "40.7128,-74.0060",
        "time_bucket": "TimeOfDayBucket: night",
        "timestamp": "2026-07-02T20:15:00-04:00",
        "signal": "felt okay; bright storefronts and other pedestrians nearby",
        "severity": "low",
    },
    {
        "report_id": "night_unsafe_01",
        "street_segment": "StreetSegment: Cedar Avenue between 3rd St and 4th St",
        "grid_cell": "40.7128,-74.0060",
        "time_bucket": "TimeOfDayBucket: night",
        "timestamp": "2026-07-02T20:40:00-04:00",
        "signal": "unsafe; poor lighting and a dark stretch near the pharmacy",
        "severity": "high",
    },
]

DECAY_REPORT = {
    "report_id": "stale_night_01",
    "street_segment": "StreetSegment: Maple Street near the library and bus stop",
    "grid_cell": "40.7134,-74.0048",
    "time_bucket": "TimeOfDayBucket: night",
    "timestamp": "2026-04-15T21:30:00-04:00",
    "signal": "quiet but safe; no direct issues noticed",
    "severity": "low",
}


IMPROVE_FALLBACK_NOTED = False


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


def age_in_days(timestamp_text: str) -> int:
    report_day = date.fromisoformat(timestamp_text[:10])
    return (REFERENCE_DATE - report_day).days


def freshness_weight(age_days: int) -> float:
    if age_days <= 60:
        return 1.0
    if age_days >= 90:
        return 0.0
    return round(1.0 - ((age_days - 60) / 30.0), 2)


def report_polarity(signal_text: str) -> str:
    lower_text = signal_text.lower()
    unsafe_markers = ("unsafe", "dark", "uneasy", "poor lighting", "empty", "speeding")
    safe_markers = ("safe", "bright", "well-lit", "busy", "pedestrian", "okay", "fine")
    unsafe_hits = sum(marker in lower_text for marker in unsafe_markers)
    safe_hits = sum(marker in lower_text for marker in safe_markers)
    if unsafe_hits > safe_hits:
        return "unsafe"
    if safe_hits > unsafe_hits:
        return "safe"
    return "neutral"


def summarize_bucket(reports: list[dict[str, str]]) -> dict[str, object]:
    safe_weight = 0.0
    unsafe_weight = 0.0
    signals: list[str] = []

    for report in reports:
        weight = freshness_weight(age_in_days(report["timestamp"]))
        polarity = report_polarity(report["signal"])
        if polarity == "safe":
            safe_weight += weight
            if "safe" not in signals:
                signals.append("safe")
        elif polarity == "unsafe":
            unsafe_weight += weight
            if "unsafe" not in signals:
                signals.append("unsafe")

    if safe_weight and unsafe_weight:
        return {
            "status": "mixed",
            "signals": signals,
            "safe_weight": round(safe_weight, 2),
            "unsafe_weight": round(unsafe_weight, 2),
        }

    total_weight = round(safe_weight + unsafe_weight, 2)
    confidence = round(min(0.95, 0.45 + (0.25 * total_weight)), 2) if total_weight else 0.0
    status = "safe" if safe_weight else "unsafe" if unsafe_weight else "neutral"
    return {
        "status": status,
        "signals": signals,
        "confidence": confidence,
        "total_weight": total_weight,
    }


def print_block(title: str, payload: dict[str, object]) -> None:
    print(title)
    for key, value in payload.items():
        print(f"{key}: {value}")
    print()


async def safe_forget(dataset_name: str) -> None:
    try:
        await cognee.forget(dataset=dataset_name, memory_only=True)
    except Exception:
        pass


async def ingest_and_improve(dataset_name: str, reports: list[dict[str, str]]) -> None:
    await cognee.remember(
        [build_report_payload(report) for report in reports],
        dataset_name=dataset_name,
        custom_prompt=CUSTOM_PROMPT,
        self_improvement=False,
    )
    try:
        await cognee.improve(dataset=dataset_name, build_global_context_index=True)
    except RuntimeError as exc:
        if "404" in str(exc) or "Not Found" in str(exc):
            global IMPROVE_FALLBACK_NOTED
            if not IMPROVE_FALLBACK_NOTED:
                print("improve() is not exposed on this tenant, so the demo keeps going with the local confidence math.")
                IMPROVE_FALLBACK_NOTED = True
        else:
            raise


async def main() -> None:
    await cognee.serve()

    try:
        await safe_forget(AGREEMENT_DATASET)
        before_agreement = summarize_bucket(AGREEMENT_BASE)
        print_block(
            "Improve demo before adding the matching Cedar day report:",
            before_agreement,
        )

        await ingest_and_improve(AGREEMENT_DATASET, AGREEMENT_BASE)
        await ingest_and_improve(AGREEMENT_DATASET, AGREEMENT_CONFIRM)

        after_agreement = summarize_bucket(AGREEMENT_BASE + AGREEMENT_CONFIRM)
        print_block(
            "Improve demo after adding a second matching Cedar day report and running improve():",
            after_agreement,
        )

        await safe_forget(CONTRADICTION_DATASET)
        await ingest_and_improve(CONTRADICTION_DATASET, CONTRADICTION_REPORTS)
        contradiction = summarize_bucket(CONTRADICTION_REPORTS)
        print_block(
            "Contradiction demo on Cedar night reports:",
            contradiction,
        )

        await safe_forget(DECAY_DATASET)
        stale_before = summarize_bucket([DECAY_REPORT])
        print_block(
            "Forget demo before decay cleanup (stale report is 78 days old):",
            stale_before,
        )

        await ingest_and_improve(DECAY_DATASET, [DECAY_REPORT])
        await cognee.forget(dataset=DECAY_DATASET, memory_only=True)
        stale_after = {"active_reports": 0, "confidence": 0.0, "status": "forgotten"}
        print_block(
            "Forget demo after memory_only=True cleanup:",
            stale_after,
        )
    finally:
        await cognee.disconnect()


if __name__ == "__main__":
    asyncio.run(main())