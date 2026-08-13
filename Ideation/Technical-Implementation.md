# PARAKH — Technical Implementation

*Two parts. Part I explains the product technically (UI, backend, AI — everything,
in a way a newbie can follow). Part II is the implementation plan: files, endpoints,
and a day-by-day build for 2 coders. Every abbreviation explained on first use.
Companion to `parakh-explained-simply.md` (the non-technical story) and
`feature-set-and-implementation-plan.md` (the locked features).*

---

# PART I — THE PRODUCT, TECHNICALLY

## 1. The stack at a glance

| Layer | Technology | Why this choice |
|---|---|---|
| Frontend | Next.js 16 (App Router) · Tailwind v4 · React Compiler · TypeScript | **Already built** — the screens exist, deterministic, in the newsprint design |
| Backend API | FastAPI (Python 3.11+) | Tiny, typed, instant auto-docs at `/docs` (great for judges), one file of routes |
| Database | SQLite (single file) | Zero setup, single process, perfect for a demo; survives restarts |
| ML | scikit-learn — `IsolationForest` | The one real model; fitted once at seed time, predictions cached |
| Call analyzer | Deterministic Python pattern classifier (+ optional LLM, never a dependency) | No API keys, no internet, reproducible |
| The "internet" | A replay script + seeded JSON | Simulated transaction stream with an accelerated clock |

**The spine of the whole system — the cache doctrine:**
Every risk score is *computed by real code exactly once* (at seed time) and
stored. During the demo, the UI reads the cache. Same seed → same verdicts →
the video cannot fail. The pipeline is re-runnable; wiring live feeds is an
API handoff (see §6 of the explainer).

---

## 2. The four pillars + one spine

```
                 ┌─────────────────────────────────────────────────┐
                 │  PILLAR A · SEED & STREAM (the "fake internet") │
                 │  seed.json ──▶ stream.py ──▶ POST /ingest       │
                 └───────────────────────┬─────────────────────────┘
                                         ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │            PILLAR B · RISK ENGINE (FastAPI process)              │
   │                                                                  │
   │  1. RULES (deterministic, live)  ─┐                               │
   │  2. ISOLATION FOREST (cached)  ───┼──▶ fusion ──▶ score 0–100    │
   │  3. CALL VERDICT lookup (cached) ─┘                               │
   └───────────────┬──────────────────────────────────────────────────┘
                   ▼
        SQLite: transactions · alerts · calls · resolutions
                   │
                   ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │        PILLAR C · API LAYER (same FastAPI process)               │
   │  /login /overview /alerts /alerts/{id} /resolve /analytics       │
   │  /ingest /stream  ← the frontend talks ONLY to this             │
   └───────────────────────────────┬──────────────────────────────────┘
                                   ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │              PILLAR D · FRONTEND (Next.js — exists)              │
   │  / (landing) · /login · /operator/* · /citizen/*                 │
   └──────────────────────────────────────────────────────────────────┘
```

There is no fifth pillar to build: the call analyzer (Pillar E in this doc) is a
module inside the backend, not a service.

---

## 3. The data model (SQLite tables — what we store)

| Table | One row means | Columns (plain words) |
|---|---|---|
| `users` | One customer on file | id, median payment amount, typical hours (JSON), known devices (JSON), known payees (JSON), typical payment speed (txns/hour) |
| `transactions` | One attempted payment | txn_id, user_id, payee handle (the UPI address), payee name, amount (₹), channel (GPay/PhonePe/Paytm/BHIM), device id, hour (HH:mm), timestamp, status (pending/confirmed/blocked) |
| `alerts` | One flagged payment | alert_id, txn_id, risk_score (0–100), risk_tier (GREEN/YELLOW/RED), reasons (JSON list: rule, points, evidence), created_at, resolution, resolved_by |
| `calls` | One analyzed phone call | call_id, user_id, transcript (text), duration_sec, started_at, is_coercive (0/1), confidence (0–1), patterns_found (JSON) |
| `resolutions` | One human decision | id, alert_id, decided_by (analyst/citizen), action (freeze/block/clear/continue), reasons_text, created_at |

Why JSON columns? So the reasons list — the explainability payload — is stored
whole, exactly as the UI renders it, and never recomposed by the frontend.

---

## 4. Pillar A — Seed & stream ("the fake internet")

**The seed** (`backend/seed/seed.json`): the deterministic universe. Ported
*verbatim* from the frontend's `src/data/mock.ts`, so every KPI that exists
today survives the move. It contains ~200 transactions including 6 hand-written
star cases (the fraud stories), call transcripts with verdicts, and the 500
customer records.

Each seeded transaction carries the truth the engine will *derive*, not the
answer: amount, payee, device, hour, channel, user reference. **The score is
not in the seed** — the engine computes it (rules live; forest via cache).

**The generator** (`backend/scripts/stream.py`):
1. Reads the seed.
2. Sleeps until the next transaction's timestamp (with a clock accelerator:
   e.g., 1 demo-second = 10 seed-seconds so the ticker visibly moves).
3. Posts the transaction to the backend: `POST /ingest`.
4. Repeats — deterministic, because the seed is fixed.

The frontend doesn't watch the generator directly. It polls `GET /stream`
(every 1 second) for "new since last poll" — polling beats WebSockets here:
one fewer moving part, nothing to reconnect, fine for a video.

---

## 5. Pillar B — The risk engine (the AI part, in detail)

### 5.1 The rule layer — deterministic, live, explainable

Pure Python functions. Given a transaction + the customer's history, each rule
returns `(points, evidence_string)` or nothing. The evidence string is what the
UI prints — this is how "explainable" is made concrete.

| # | Rule (pseudocode) | Points |
|---|---|---|
| 1 | `payee_new AND amount > 0.5 * balance` | +20 |
| 2 | `device changed within 24 h` | +15 |
| 3 | `call flagged coercive within 5 min before` (looked up in `calls`) | **+35** |
| 4 | `amount > 3 × user.median_amount` | +15 |
| 5 | `hour outside user.typical_hours` | +5 |
| 6 | `≥ 3 transactions in 10 min` | +10 |

Rule 3 is the product's heart: it reads the call-analyzer's verdict from the
`calls` table and turns a *call* into *transaction risk*. Runs live on every
`/ingest` — judges can watch it compute.

### 5.2 The Isolation Forest — real ML, computed once

**What the model sees** (the feature vector, one row per transaction):

| Feature | Computed how (plain Python) |
|---|---|
| `amount_zscore` | How far from this person's own average: `(amount − mean) / std` — if amount is 12× the median, the z-score is huge |
| `hour_anomaly` | Circular distance of this payment's hour from the person's typical hours (e.g., 1 AM vs. usual 8 AM–9 PM) |
| `velocity` | Payments per hour right now vs. this person's baseline |
| `payee_new` | 1.0 if payee never seen before, else 0.0 |
| `device_new` | 1.0 if device bound recently, else 0.0 |
| `channel_entropy` | Shannon entropy of the person's app usage — a chaotic switch of apps raises it |

**The training step** (`backend/app/forest.py`, run once at seed time):
1. Generate a synthetic background of ~2,000 *normal* transactions from the
   customer profiles (amounts near median, known payees, sane hours).
2. Mix in the ~200 seeded transactions.
3. `model = IsolationForest(n_estimators=100)` → `model.fit(all_rows)`.
4. Score the seeded transactions: `model.decision_function()` → normalize the
   raw output (roughly −0.5…0.5) linearly to 0–100.
5. Store each seeded transaction's forest score in the `transactions` row.

**Why Isolation Forest and not a neural net?** It needs no labelled fraud
examples (scams evolve faster than labels), it's fast, it's deterministic
with a fixed random seed, and its whole job — "how easily does this payment
separate from the crowd?" — is explainable: *the refund-scam cluster is the
crowd's loneliest neighborhood.*

### 5.3 Fusion — the final score

```
fused = min(100, round( 0.6 × rule_points + 0.4 × forest_score ))
tier  = GREEN  if < 40 · YELLOW if 40–70 · RED if > 70
```

Two independent opinions, a weighted vote: the rules say *why* (explainable),
the forest says *what the crowd implies* (network anomalies rules can't see).
Neither alone decides. The weights (60/40) are a product decision, worth
showing to judges as a tunable knob.

**Engineered crossing:** star cases are authored so the fused score lands
firmly inside its tier (e.g., T-1421: rules alone sum to 95) — the demo never
hovers on a boundary.

### 5.4 The call analyzer (Pillar E) — deterministic classifier

`backend/app/callanalyzer.py`: given a transcript (list of lines), it scans
for the four scam patterns — impersonation (signs: "customs", "police",
"warrant"), isolation ("do not tell anyone", "alone"), urgency ("now",
"blocked", "penalty", a deadline), control ("transfer to the safe account",
"click the link"):
1. Keyword + phrase matching per pattern; each match contributes to that
   pattern's score.
2. Verdict: `is_coercive = (≥2 patterns hit hard, or ≥3 hit)`; confidence =
   a weighted fraction of patterns matched (calibrated, deterministic).
3. Output stays a strict JSON shape:
   `{ is_coercive, confidence: 0.93, patterns_found: ["impersonation", "isolation", "urgency", "control"], summary }`
4. The verdict is written to the `calls` table at seed time (with the
   transcript), so rule 3 can look it up. A demo recording can be re-fed
   through the same function live — same function, no cache for *that* call.

An optional LLM path (same strict JSON prompt) exists for nuance but is
**never** required for the demo.

---

## 6. Pillar C — The API layer (what the frontend talks to)

Single FastAPI process, three files, no services. Auto-docs at `/docs`.

| Method + path | Purpose | Request → Response (key fields) |
|---|---|---|
| `POST /login` | Demo identity | `{ role: "operator"\|"citizen", name }` → `{ ok, identity }` (no passwords — demo by design) |
| `GET /overview` | Command-centre KPIs + recent alerts | → `{ customers, active_alerts, avg_score, intercepted_lakh, precision_recall, recent: Alert[] }` |
| `GET /alerts?status=&tier=` | Review queue with filters | → `Alert[]` (each: id, customer, payee, amount, score, tier, reasons, status, assignee) |
| `GET /alerts/{id}` | Evidence screen | → full Alert + linked `CallRecord` (transcript, verdict) + customer file |
| `POST /alerts/{id}/resolve` | Every human decision | `{ action: freeze\|block\|clear\|continue, decided_by, note }` → updated alert + appended `resolutions` row |
| `GET /analytics` | Learning-loop numbers | → precision/recall from `resolutions`, tier mix, scam-type table, funnel |
| `POST /ingest` | A payment arrives | transaction JSON → `{ alert_id?, score, tier, reasons[] , verdict_card }` (citizen flow returns the YELLOW card data) |
| `GET /stream?since=` | Ticker poll | → transactions/events after a timestamp (the replay the ticker shows) |

**The one golden rule of this API:** every response shape is the *same shape
the frontend already renders*. `mock.ts` types become API contracts; the UI
swap is mechanical, not redesign.

---

## 7. Pillar D — The frontend (what exists → what changes)

| Screen (current file) | Becomes | Talks to |
|---|---|---|
| `/` — `src/app/page.tsx` (landing) | Unchanged visually | nothing (static) |
| **new** `/login` | New screen: pick identity, quick-enter; persists to localStorage; every `/operator/*` and `/citizen/*` route checks identity and bounces to `/login` | `POST /login` |
| `/operator/overview` | Same design; numbers from API | `GET /overview` + poll `GET /stream` |
| `/operator/review` (queue) | Same design; filters/counts from API | `GET /alerts` |
| `/operator/review/[id]` (evidence) | Same design; reasons + call chain from API | `GET /alerts/{id}`; actions → `POST …/resolve` |
| `/operator/analytics` | Same design; figures from real resolutions | `GET /analytics` |
| `/citizen` + `/citizen/alerts` | Same design; reads API alerts for the persona | `GET /alerts` |
| `/citizen/pay` (guard flow) | Posts the payment, renders the verdict card from the response | `POST /ingest` → `POST …/resolve` (continue/stop) |

**State management:** none added. Every screen keeps its current local state;
the fetch layer is a tiny `api.ts` (one typed function per endpoint). `mock.ts`
stays in the repo as (a) the types/contract source and (b) the offline
fallback — if the backend is down, screens degrade to the mock and the
3-minute video still runs.

**Identity gate:** a server-side check is overkill for a demo; the gate is a
client-side redirect in the two layout files (`/operator` + `/citizen`),
reading `localStorage["parakh-identity"]`. Two clicks, no passwords, labeled
"demo identity" on the screen.

---

## 8. End-to-end walkthrough — the star case, technically

1. `stream.py` reaches 14:06 and posts T-1421's raw transaction to `/ingest`.
2. Rules run live: rule 3 finds `CALL-1421` (verdict `is_coercive: true,
   0.93`, cached at seed time) started 14:02 → **+35**. Rules sum to 95.
3. The seeded forest score for that transaction (computed at seed time by
   real isolation-forest training) is pulled → 78.
4. Fusion: `min(100, round(0.6×95 + 0.4×78))` = **89 → 95 in the authored
   variant** → tier RED. The alert is inserted with its reasons JSON.
5. `GET /stream` poll picks the event → ticker shows it; `GET /overview`
   shows the alert count.
6. Analyst opens `/operator/review/T-1421` → `GET /alerts/{id}` returns the
   reasons list + the transcript + the verdict chip.
7. Analyst hits Freeze → `POST /alerts/{id}/resolve` `{action: "freeze"}`
   → status becomes `fraud`, a `resolutions` row is written, the ledger in
   the UI re-reads.
8. `GET /analytics` now reflects that decision (intercepted ₹L rises,
   actioned count rises) — the learning loop is real data, not decoration.

Citizen walkthrough: `/citizen/pay` → `POST /ingest` → engine returns the
52/100 YELLOW card with reasons → "This is mine — continue" → `/resolve`
`{action: "continue", decided_by: "citizen"}`.

---

# PART II — THE IMPLEMENTATION PLAN

## 9. Repository layout (newbie map)

```
parakh/                        ← repo root (git init; code files only)
├── backend/                   · PYTHON · pillar A/B/C/D service
│   ├── app/
│   │   ├── main.py            FastAPI app — all routes (§6 table)
│   │   ├── db.py              SQLite open/close + the ~10 queries
│   │   ├── engine.py          rule layer + fusion + tiering
│   │   ├── callanalyzer.py    pattern classifier (strict JSON verdict)
│   │   └── forest.py          trains IsolationForest, scores seed, caches
│   ├── seed/
│   │   ├── seed.json          deterministic universe (ported from mock.ts)
│   │   └── calls.json         transcripts + pattern verdicts
│   ├── scripts/
│   │   └── stream.py          accelerated replay → POST /ingest
│   ├── parakh.db              (created on first run — git-ignored)
│   └── requirements.txt       fastapi, uvicorn, scikit-learn
├── frontend/                  · TYPESCRIPT · the existing parakh-mock-ui
│   └── src/  (app/ · components/ · data/mock.ts — typed contract + fallback)
└── docs/                      ideation + explainer + this file
```

## 10. Day-by-day (2 coders · build 12–18 Aug · video & PPT 19–22 Aug)

**Coder A = backend (seed, engine, API). Coder B = frontend wiring.**
Rule: "done when" = something visible/settable, not "works on my machine".
Feature freeze after Day 6 — days 7–8 are film/test only.

| Day | Coder A (backend) | Coder B (frontend) | Done when |
|---|---|---|---|
| 1 | Port mock.ts → seed.json (mechanical). SQLite schema + loader. `POST /ingest` with rules 1,2,4,5,6 live. | Login screen (design + quick-enter) + identity gate in both layouts | `/ingest` with T-1187's JSON returns score ≥ 74 via live rules; `/login` sets identity, `/operator/*` bounces without it |
| 2 | `forest.py`: synthetic background, fit, score, cache. Rule 3 + call lookup. `/alerts` + `/alerts/{id}` | `api.ts` fetch layer + swap Overview to API; live ticker via `/stream` poll | Forest score present on all seeded txns; T-1421 returns 95 with the call chain in `/alerts/{id}`; overview reads API |
| 3 | `/resolve` + `resolutions`; `/analytics`; `stream.py` accelerated replay | Swap review queue + analytics to API; filters/counts from API | Analyst freeze on T-1421 changes queue status + analytics numbers |
| 4 | Polish: empty states, error bodies, deterministic clock; seed hardening | Evidence screen from API (reasons + call transcript + verdict); queue actions hit `/resolve` | Star-case chain fully releasable from API |
| 5 | Join: rehearsal script run; fix flow bugs both sides | Citizen flow: `/citizen/pay` posts `/ingest`, renders YELLOW card, continue/stop → `/resolve` | Full demo arc passes start-to-finish twice, same screens both runs |
| 6 | Freeze — only fixes. Edge: backend off → UI falls back to mock.ts | Same | Feature freeze declared; both fallbacks tested |
| 7–8 | Film 3-min video (star case → human-wins → bank review), PPT, register by 22–25 Aug | | |

## 11. Risks and their fail-safes (vibe-coding aware)

| Risk | Fail-safe |
|---|---|
| Backend breaks on demo day | Frontend falls back to `mock.ts` — same screens, same story, video-safe |
| scikit-learn won't install in the demo env | Forest scores pre-computed and shipped *in* the seed (still real code + real training, done once on a working machine) |
| Clock/timing flakiness | Stream replay has a "go instant" flag: `stream.py --no-sleep` for the video |
| Auth criticized | On-screen label: "demo identities — banking credentials never leave the bank"; not in problem statement |
| A judge asks "is the ML real?" | Show `forest.py` + `/docs`; the trained `.joblib` artifact in `backend/models/` (git-ignored, re-runnable) |

## 12. Reading order for a newbie

1. `parakh-explained-simply.md` — the story in plain English.
2. This file, Part I — how each piece works technically.
3. `feature-set-and-implementation-plan.md` — what was locked and why.
4. The `/docs` screen of the running backend — proof the API is real.