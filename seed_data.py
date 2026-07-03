import asyncio
import sys
import random
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

load_dotenv()

import cognee


DATASET_NAME = "saferaste_pune_seed_v1"
RANDOM_SEED = 42


SEGMENTS = [
    {
        "name": "StreetSegment: FC Road near Fergusson College gate",
        "grid_cell": "18.5259,73.8415",
    },
    {
        "name": "StreetSegment: JM Road by the Shivaji Nagar crossing",
        "grid_cell": "18.5312,73.8481",
    },
    {
        "name": "StreetSegment: MG Road near the Camp market",
        "grid_cell": "18.5177,73.8782",
    },
    {
        "name": "StreetSegment: Baner Road near Balewadi connector",
        "grid_cell": "18.5635,73.7818",
    },
    {
        "name": "StreetSegment: Koregaon Park Main Avenue",
        "grid_cell": "18.5362,73.8956",
    },
    {
        "name": "StreetSegment: Senapati Bapat Road near university lane",
        "grid_cell": "18.5368,73.8287",
    },
    {
        "name": "StreetSegment: Kalyani Nagar riverside access road",
        "grid_cell": "18.5482,73.9060",
    },
    {
        "name": "StreetSegment: Shivaji Nagar station approach road",
        "grid_cell": "18.5301,73.8517",
    },
    {
        "name": "StreetSegment: Aundh ITI road stretch",
        "grid_cell": "18.5609,73.8085",
    },
    {
        "name": "StreetSegment: Kothrud Paud Road by the bus stop cluster",
        "grid_cell": "18.5074,73.8078",
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


DAY_SIGNALS = [
    ("Safe - high visibility, active pedestrian traffic", "low"),
    ("Felt safe; shops were open and the street was busy", "low"),
    ("Well-lit and calm with lots of people around", "low"),
    ("Clear sight lines and steady foot traffic; comfortable walking", "low"),
]

DAY_CAUTIOUS = [
    ("Mostly safe, but one short blind corner near parked scooters", "medium"),
    ("Generally fine, though traffic was moving quickly at the intersection", "medium"),
]

EVENING_SIGNALS = [
    ("Still okay; several pedestrians and open storefronts", "low"),
    ("A little quieter, but lighting stayed good and I felt fine", "low"),
    ("Some caution near the bus stop, but the block was active", "medium"),
]

NIGHT_SAFE = [
    ("Brighter than expected; security guards and other walkers nearby", "medium"),
    ("Felt okay because the road was lit and there was steady movement", "medium"),
]

NIGHT_CAUTIOUS = [
    ("Unsafe - poor lighting and a dark stretch made the walk uncomfortable", "high"),
    ("Took care crossing because the block was dim and nearly empty", "high"),
    ("Uneasy near the corner; lighting dropped off and traffic felt sparse", "high"),
    ("Caution needed - one shadowed section and fast-moving vehicles", "high"),
]

TIME_BUCKET_PLAN = [
    ("morning", 3),
    ("afternoon", 3),
    ("evening", 2),
    ("night", 4),
]


def make_report_payload(report: dict[str, str]) -> str:
    return f"""SafeRaste Report
report_id: {report['report_id']}
street_segment: {report['street_segment']}
grid_cell: {report['grid_cell']}
time_bucket: {report['time_bucket']}
timestamp: {report['timestamp']}
signal: {report['signal']}
severity: {report['severity']}
"""


def choose_signal(time_bucket: str) -> tuple[str, str]:
    if time_bucket in {"morning", "afternoon"}:
        pool = DAY_SIGNALS + DAY_CAUTIOUS
    elif time_bucket == "evening":
        pool = EVENING_SIGNALS
    else:
        pool = NIGHT_SAFE + NIGHT_CAUTIOUS
    return random.choice(pool)


def build_reports() -> list[dict[str, str]]:
    random.seed(RANDOM_SEED)
    start = datetime(2026, 6, 20, 6, 30, tzinfo=timezone(timedelta(hours=5, minutes=30)))
    reports: list[dict[str, str]] = []

    for segment_index, segment in enumerate(SEGMENTS):
        report_counter = 1
        base_time = start + timedelta(days=segment_index)

        for time_bucket, count in TIME_BUCKET_PLAN:
            for _ in range(count):
                signal, severity = choose_signal(time_bucket)
                if time_bucket == "morning":
                    timestamp = base_time.replace(hour=8, minute=5 + report_counter)
                elif time_bucket == "afternoon":
                    timestamp = base_time.replace(hour=14, minute=10 + report_counter)
                elif time_bucket == "evening":
                    timestamp = base_time.replace(hour=18, minute=20 + report_counter)
                else:
                    timestamp = base_time.replace(hour=21, minute=15 + report_counter)

                reports.append(
                    {
                        "report_id": f"pune_{segment_index + 1:02d}_{report_counter:02d}_{time_bucket}",
                        "street_segment": segment["name"],
                        "grid_cell": segment["grid_cell"],
                        "time_bucket": f"TimeOfDayBucket: {time_bucket}",
                        "timestamp": timestamp.isoformat(),
                        "signal": signal,
                        "severity": severity,
                    }
                )
                report_counter += 1

    if len(reports) != 120:
        raise ValueError(f"Expected 120 reports, generated {len(reports)}")

    return reports


def print_seed_summary(reports: list[dict[str, str]]) -> None:
    segment_counts: dict[str, int] = {}
    bucket_counts: dict[str, int] = {}

    for report in reports:
        segment_counts[report["street_segment"]] = segment_counts.get(report["street_segment"], 0) + 1
        bucket_name = report["time_bucket"].replace("TimeOfDayBucket: ", "")
        bucket_counts[bucket_name] = bucket_counts.get(bucket_name, 0) + 1

    day_count = sum(bucket_counts.get(bucket, 0) for bucket in ["morning", "afternoon", "evening"])
    night_count = bucket_counts.get("night", 0)

    print("Seed summary before upload:")
    print(f"Total reports: {len(reports)}")
    print("Reports per street segment:")
    for segment_name, count in segment_counts.items():
        print(f"- {segment_name}: {count}")
    print("Time bucket split:")
    for bucket_name in ["morning", "afternoon", "evening", "night"]:
        print(f"- {bucket_name}: {bucket_counts.get(bucket_name, 0)}")
    print(f"Day vs night split: day={day_count}, night={night_count}")
    print()


async def main() -> None:
    reports = build_reports()
    payloads = [make_report_payload(report) for report in reports]

    print_seed_summary(reports)

    if "--dry-run" in sys.argv:
        return

    await cognee.serve()
    try:
        await cognee.forget(dataset=DATASET_NAME, memory_only=True)
    except Exception:
        pass

    try:
        for index in range(0, len(payloads), 20):
            batch = payloads[index:index + 20]
            await cognee.remember(batch, dataset_name=DATASET_NAME, custom_prompt=CUSTOM_PROMPT, self_improvement=False)

        print(f"Seeded {len(reports)} reports into dataset: {DATASET_NAME}")
        print("Street segments: 10")
        print("Time buckets: morning, afternoon, evening, night")
        print("Clustered pattern: mostly positive by day, more cautious at night")
    finally:
        await cognee.disconnect()


if __name__ == "__main__":
    asyncio.run(main())