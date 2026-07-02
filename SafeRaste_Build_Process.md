# SafeRaste — Build Process Document
### Women's Route Safety Memory Platform | The Hangover Part AI (WeMakeDevs x Cognee)

---

## 1. Project Summary

**What it is:** A mobile-first web app (PWA) that lets women log short, quick safety observations about streets they walk ("poorly lit," "felt fine," "someone followed me"), tagged automatically with location and time of day. The app then answers, live, "is this route okay right now?" — with an answer that changes by time of day, not a static safety rating.

**Why it's different:** Existing safety-map apps are static snapshots made once and left to rot. SafeRaste's memory is temporal and self-correcting — a street rated safe at 2pm doesn't inherit that score at 9pm, repeated confirmations strengthen a signal, contradicting reports surface honestly instead of averaging into a false middle, and old reports decay in weight unless re-confirmed.

**Core differentiator for judging:** The `forget()` operation is the strongest story of any idea we considered — stale safety data isn't just inaccurate, it's actively dangerous. This gives a genuinely compelling answer to "why does this need Cognee's full memory lifecycle" rather than just remember/recall.

---

## 2. Judging Criteria Alignment

| Criterion | How SafeRaste Hits It |
|---|---|
| Potential Impact | Real, serious problem (women's safety) affecting daily decisions |
| Creativity & Innovation | Temporal, self-correcting safety data — not another static heatmap |
| Technical Excellence | Time-bucketed graph traversal, decay logic, confidence reweighting |
| Best Use of Cognee | All four ops (remember/recall/improve/forget) do real, non-trivial work |
| User Experience | 2-tap or voice log, under 10 seconds; live map feedback |
| Presentation Quality | Live demo — tap through a simulated walk, watch scores update by time-of-day |

---

## 3. Data Model

**Nodes**
- `StreetSegment` — identified by lat/long grid cell (simple bucketing, no PostGIS needed)
- `Report` — contains: signal/tag or free text, severity (low → high concern), timestamp, time-of-day bucket
- `TimeOfDayBucket` — e.g. morning / afternoon / evening / night

**Edges**
- `Report —about→ StreetSegment`
- `Report —occurred_at→ TimeOfDayBucket`

**Required fields per report**

| Field | Source | Required? |
|---|---|---|
| Location (lat/long) | GPS auto-capture | Yes |
| Time of day | Auto-captured | Yes |
| Safety signal (tag or free text) | Tap-to-tag UI or voice note | Yes |
| Confidence/severity | User-selected scale | Yes |
| Confirmed/echoed by another user | System-tracked | Feeds `improve()` |

---

## 4. Pipeline (Cognee Lifecycle Mapping)

1. **Capture** — user finishes a walk, taps "log this route," selects a quick tag or speaks a note. GPS + time auto-attach.
2. **Ingest — `remember()`** — creates `Report` node, links to `StreetSegment` and `TimeOfDayBucket`.
3. **Judgment — `recall()`** — user asks (or app auto-triggers via GPS) "is this route okay right now?" System traverses reports for nearby segments, filtered by *current* time-of-day bucket, returns a live score.
4. **`improve()`** — repeated similar reports on the same segment/time-bucket increase confidence. Contradicting reports lower confidence and surface both signals rather than falsely averaging.
5. **`forget()`** — reports decay in weight after 60–90 days unless re-confirmed by a newer report. Map reflects current reality, not a frozen snapshot.

**Output**
- Primary: live color-coded map overlay (green/yellow/red), filterable by time-of-day
- Secondary: post-walk log flow, under 10 seconds, voice-first
- Tertiary (demo flourish, cut if short on time): "light left on for you" — a small human note the next woman sees on that segment

---

## 5. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Leaflet.js (free, no API key needed) |
| Geolocation | Browser Geolocation API |
| Voice input | Web Speech API (cut first if time-constrained) |
| Backend | Python + Cognee SDK |
| Data store | Cognee's graph store + simple lat/long grid-cell bucketing |
| LLM provider | OpenRouter (free-tier model, no billing setup required) |

---

## 6. Build Order (MVP-First, Ruthless Scope Cuts)

**Phase 0 — Unblock the LLM connection**
- OpenRouter account → API key → confirm `.env` config → re-run `test_memory.py` successfully

**Phase 1 — Cognee talks to the new data model**
- Rewrite ingestion script around `StreetSegment` / `Report` / `TimeOfDayBucket` instead of syllabus sentence
- One full `remember()` → `recall()` round-trip on fake data, no map yet — prove the graph logic first

**Phase 2 — Time-aware recall (the differentiator — do not skip or rush)**
- Add time-of-day bucketing to reports
- Confirm `recall()` returns *different* results for the same street at different times
- This is the entire pitch — get it airtight before touching UI

**Phase 3 — `improve()` and `forget()` logic**
- Confidence reweighting on repeated/contradicting reports
- Simple linear decay after N days (even a basic version is enough — be ready to explain it clearly live)

**Phase 4 — Seed realistic data**
- ~100–150 synthetic reports across a real, local area so the demo is credible
- Cluster naturally by time of day (e.g., more "poorly lit" tags at night)

**Phase 5 — Minimal UI (cut hardest here if time is short)**
- Leaflet map + hardcoded markers + color coding — get this rendering *first* since it's the one external-dependency risk
- Tap-to-log flow, 2 taps max
- Voice input only if Phases 1–4 finish early — not required for core scoring

**Phase 6 — Demo polish**
- "Light left on for you" flourish, if time allows
- Rehearse the 2–3 minute pitch cold

---

## 7. Division of Labor

**Claude (implementation)**
- All Cognee setup, schema, ingestion pipeline, decay/reweighting logic
- Backend integration, debugging, deployment scripting
- Map/UI code

**You**
- OpenRouter key setup (blocking — do first)
- Local area data for realistic seeding (pick a real neighborhood/route)
- Git/GitHub basics, keep repo updated
- Judge-facing pitch and live demo delivery
- Disclose AI-assistant use in submission (hackathon Rule #8 — required, not optional)

---

## 8. Immediate Next Step

Finish Phase 0 — confirm OpenRouter key is working end-to-end, then move directly into Phase 1: rewriting the ingestion script around the new `StreetSegment`/`Report` schema.
