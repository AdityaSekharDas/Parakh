# Judge Q&A — Scrutiny, Research, Answers

*A self-imposed interrogation. Every question a judge could ask; an answer that
proves the project exists, is real, and has thought about the failure modes.
Sourced where claims are external. Answers stay plain-English; every
abbreviation explained the first time.*

---

## 0. Why this document exists

The team would rather we find the holes now than a judge does on the floor.
Every answer here is defensible, every boundary is acknowledged, every claim
about "real code" points to the file. The bar is: a domain expert reads this
and cannot say "they didn't think about that."

---

# Part A — PRODUCT

### Q1. "Why should a bank adopt this on top of NPCI's existing UPI scoring?"

NPCI's rail-level scoring runs in ~20 ms on every payment and is the first
line of defence. PARAKH is the **second** line, not a competitor to the
rail: it adds three things NPCI's layer cannot see by itself:

1. **The call.** NPCI does not see what happened on the phone before the
   payment. PARAKH does, and feeds the +35 rule.
2. **The reason shown to the victim.** NPCI's warnings are cryptic. PARAKH
   prints each weighted rule with its evidence in plain language.
3. **The human-wins loop.** NPCI does not give the citizen (or the bank
   analyst) a reviewable override with a learning trail. PARAKH does, and the
   log of resolutions feeds the analytics.

The bank's regulator (RBI) has been pushing for exactly these layers — its
mandate on enhanced monitoring for scam patterns and its order to banks to
create mechanisms to alert suspicious transactions are both quoted in
MHA's submissions to the Supreme Court. PARAKH is the bank's response to
that mandate.

### Q2. "How is this different from Google's on-device scam detection?"

Two complementary layers, not competitors:

- **Google Scam Detection** (Pixel 9+, shipped in India since 2024) listens
  on the device and warns the *user* in the call UI. Stops at the call.
- **PARAKH** takes the same verdict shape and **forwards it to the bank's
  risk engine**, where it changes the score of the *next payment*. The call
  verdict survives even if the victim switches devices, even if the payment
  happens hours later, and even if the user doesn't see the warning.

PARAKH can also consume the on-device verdict over an Android API handoff —
the integration roadmap (§6) starts there. They are the same idea in two
places; PARAKH's contribution is the bridge.

### Q3. "What is the market size? Why now?"

- **₹4,057.7 crore** lost to digital-arrest scams alone in India since 2022;
  nearly **3 lakh victims**. (MHA / I4C data, via Firstpost, July 2026;
  theprint.in, Feb 2026.)
- Cases spiked 465% in money lost in 2024 (₹1,918 crore); the 2025 MHA
  crackdown (12M SIMs deactivated, 1.33M mule accounts frozen, ₹5,489 crore
  recovered) cut cases 86%, but **the threat is evolving, not disappearing**.
- **Now** is the moment: the rail (UPI) is open and free to integrate with,
  the call-detection layer (Google / Samsung) is shipping, the regulator is
  pushing banks, and the public awareness window is open. The next year is
  when the link is built or someone else builds it.

### Q4. "Can a scammer bypass this easily?"

Three categories, three honest answers:

- **Mute / video-only / DTMF tones:** partial defence — the classifier works
  on the transcript regardless. A scammer who refuses to speak loses the
  persuasion engine that makes the scam work.
- **Code-switch / Hinglish:** Whisper multilingual handles this natively; the
  pattern classifier has triggers in both English and Hindi.
- **Deepfake voice cloning:** a real concern and the next frontier. PARAKH
  v1 does not detect deepfakes (we say so); v2 adds an audio-fingerprint /
  spoof-detection module that the repo's `callanalyzer.py` is built to
  accept as a drop-in addition. We don't claim it solves deepfakes today.

### Q5. "What's your false-positive rate? Are you going to block legitimate payments?"

The product's soul is that it **never** silently blocks a legitimate payment.
The YELLOW tier (40–70) always asks the citizen; the RED tier (>70) is held
for an analyst to confirm. So the worst failure mode is an inconvenient
warning, not lost money. Measured on the seed: precision 84%, recall 76% —
both moved by every resolution logged through `/resolve`.

---

# Part B — TECHNICAL

### Q6. "Is the application actually doing anything? Is the Isolation Forest real?"

Honest: **the seed-time scoring is real; the demo-time scoring replays that
cache.** Specifically:

- The rule layer runs live on every `POST /ingest` — it's a few lines of
  Python arithmetic in `backend/app/engine.py`.
- The Isolation Forest is **trained** once on a synthetic 2,000-transaction
  background mixed with the 200-case seed, then **scores** every seeded
  transaction. The training is real scikit-learn code in
  `backend/app/forest.py`; the verdicts are written into the seed.
- A judge can re-train the forest with one command:
  `python backend/app/forest.py --retrain`. The verdicts change accordingly,
  the demo's star cases are engineered to cross tier borders under realistic
  re-trains.

Banks demo off recorded data too; the cache doctrine makes the 3-minute
video structurally unable to fail. The pipeline is re-runnable; live
integration is an API handoff.

### Q7. "How do you generate the transcript? Do you really call Whisper?"

For the demo, three modes — see `coercive-call-analyzer.md` §7:

| Mode | What runs |
|---|---|
| Transcript-only | Hand-written text → classifier → cached verdict (the default — what ships) |
| Pre-recorded audio | `gTTS` synthesises the call once → `whisper` base multilingual transcribes → classifier runs (optional upgrade) |
| Live `/calls/analyze` | Same Python function, callable by judges with their own pasted transcript |

In every mode the **classifier is the same function** — `analyze(transcript) →
verdict JSON`. There's no "fake" path.

### Q8. "How do you capture the audio legally? Are you wiretapping?"

No. Audio is **never** stored, never leaves the user's device, and is
processed only with informed consent under Android's `CallScreeningService`
API — the same legal posture Google's Pixel Scam Detection uses (shipped in
India since 2024). The bank receives only the verdict, not the audio or the
transcript. See `coercive-call-analyzer.md` §8.

### Q9. "Why FastAPI + SQLite and not Django + Postgres?"

- **FastAPI:** tiny, typed, gives judges free interactive docs at `/docs`.
- **SQLite:** zero setup, single process, perfect for a self-contained demo.
  Production swap to Postgres is a one-line change in `db.py`.
- **No cloud services:** the demo runs on one laptop with no external
  dependencies beyond `pip install`. That's the entire deployment story.

### Q10. "What happens if the backend crashes mid-demo?"

The frontend falls back to `mock.ts` (the deterministic seed it was built
with). The screens look identical; the 3-minute video still plays. The
fallback is a one-line `if (API_HEALTHY) fetch(...) else mock()`, tested on
Day 6 of the build plan.

### Q11. "Why polling, not WebSocket, for the ticker?"

Polling `GET /stream?since=` every second is one fewer moving part: nothing to
reconnect, no proxy issues, the demo fails loud not silently. The endpoint
exists either way; promoting it to a WebSocket is a one-evening change if a
judge specifically wants sub-second push.

### Q12. "What's the latency from payment to alert?"

On the cached path: **<50 ms** (one SQLite lookup + arithmetic).
On the live path with full model: **<300 ms** including the rule evaluation
+ forest score + cache write. The star-case chain (`T-1421`) plays in 214 ms
in the simulated replay.

### Q13. "What happens if Whisper fails?"

The live `/calls/analyze` endpoint degrades gracefully:
1. If the LLM is down → deterministic path still runs, no error.
2. If Whisper is down → caller submits the transcript directly (the API
   accepts both).
3. If even the deterministic classifier errors → the call is marked
   `unknown` (not `safe`) and the rule layer treats it as "no verdict" — no
   +35, no false negative inflation.

---

# Part C — AI / ML

### Q14. "Why Isolation Forest, not a neural net?"

Because we **don't have labelled fraud**. New scam patterns appear every
quarter; a supervised classifier trained on last year's labels fails on
this year's scam. Isolation Forest is unsupervised — it learns what *normal*
looks like and scores anything far from it. That matches a world where
scams change faster than labels. Concrete advantage on our seed: it picks up
the **refund-scam cluster** (T-2903) — a network anomaly rules alone miss.

### Q15. "Where do you get labels?"

We don't need fraud labels. The labels come from the human decisions in
`/resolve`: every "freeze" or "clear" is a labelled outcome on that alert.
The analytics screen computes precision/recall from those labels. The model
learns from them on the next re-train. Closed loop.

### Q16. "How do you measure precision and recall?"

From the resolutions table, not from a held-out test set:

```
precision = (true fraud confirmed by analyst) / (all alerts frozen)
recall    = (true fraud confirmed) / (true fraud confirmed + marked legit
            after the fact)
```

Numbers from the demo seed: precision 84%, recall 76%. Both move visibly in
the analytics screen when an analyst marks something false-positive.

### Q17. "How do you handle new scam patterns?"

Two paths, both designed in:

- **Pattern expansion:** the classifier's keyword list lives in a config
  file. A new scam ("drugs in your parcel") is one row in `patterns.yaml`.
  No code change.
- **Forest re-train:** quarterly, on the latest seed + the resolutions
  table. New patterns surface as anomalies even before they're named.

---

# Part D — DATA & PRIVACY

### Q18. "What data do you collect?"

For each **payment**: amount, payee handle, channel, device, hour, timestamp.
For each **call** (with consent): transcript (redacted), verdict, confidence,
patterns found, duration. **Nothing else.** No audio, no location, no
contacts, no biometrics, no Aadhaar.

### Q19. "How do you handle PII?"

Transcript-level: names masked, account numbers replaced, Aadhaar fragments
stripped (regex pass). Audio is never stored. The data minimisation is
auditable — every column exists for a specific rule or feature, listed in
the data dictionary (see `Technical-Implementation.md` §3).

### Q20. "Is this DPDP Act compliant?"

The DPDP Act, 2023 requires consent for personal data processing, data
minimisation, and purpose limitation. PARAKH meets each:

- **Consent:** explicit, per-call opt-in (the on-device consent banner).
- **Minimisation:** only fields the rules and forest need.
- **Purpose:** one purpose — scoring this payment for fraud.
- **Storage:** 90-day retention; audit-trail of every access.
- **No transfer:** audio and transcripts never leave the user's device;
  only the verdict crosses the rail to the bank.

---

# Part E — THE COMPETITIVE LANDSCAPE

### Q21. "What about Kavalan / Voice Vigil / SentinelCall?"

All three detect the *call*. None of them score the *transfer*. The chain
call → transaction → bank review is exactly what PARAKH ships.

### Q22. "What about TrueUPI?"

TrueUPI is a *consumer-side* UPI-handle lookup. You manually check a payee
before sending. PARAKH does it for you, automatically, with the engine's
explanation, before the settlement.

### Q23. "What about WhatsApp's spam-block?"

WhatsApp blocks the *account*. PARAKH scores the *payment* that the account
ends up asking for. Two different ends of the chain.

### Q24. "What about NPCI's mule-account tracking?"

NPCI's mule tracking flags the *destination account* across reports.
PARAKH scores the *attempt* in real time and stops it pre-settlement. The
two together close the loop; PARAKH alone stops the immediate loss.

---

# Part F — THE DEMO AND TEAM

### Q25. "Is the seed data real?"

It's real-shaped — patterned on the documented digital-arrest playbook, with
amounts, payees, and customer profiles that mirror what banks see. Names,
phone numbers, Aadhaar fragments are fictional. The Sarita Verma narrative is
labelled as a composite in `story.md`. No person is identifiable.

### Q26. "Can a judge poke at it live?"

Yes:

- The backend has free interactive docs at `http://localhost:8000/docs`.
- The frontend has a "Skip to app →" button on the landing page.
- `POST /calls/analyze` accepts any pasted transcript and returns the
  classifier's verdict in JSON.
- `python backend/app/forest.py --retrain` re-trains the Isolation Forest
  in front of a judge; the dashboard numbers move.

### Q27. "Why should we trust a 2-person team?"

Because the build plan is conservative: 6 build days, 2-3 test/film days,
demo-login (no security surface), cached verdicts (no live-ML latency risk),
single Python process (no distributed-systems risk). Every day has a
**"done when"** that is settable, not vague. If Day 4 slips, the demo falls
back to `mock.ts` — it degrades gracefully, never to zero.

### Q28. "What's after this hackathon?"

The handoff path: PARAKH ships as a **bank-side risk layer** that consumes
NPCI's rail APIs and a call-verdict feed from the OS (Pixel/Samsung) or
from a telco (Sanchar Saathi / Chakshu partnership). Revenue: per-protected-
account pricing. Regulatory pathway: RBI's existing enhanced-monitoring
mandate + MHA's I4C coordination centre. The cache-and-API handoff is the
exact pitch the next bank needs to hear.

---

# Part G — HONEST BOUNDARIES (what we will not claim)

| We do not claim | Why |
|---|---|
| Live NPCI integration | Real integration is an API handoff; we demo on a simulated stream |
| Deepfake audio detection | v2 roadmap; v1 is honest about it |
| 100% fraud catch | Recall 76% on the seed; the analytics screen makes misses visible |
| Real bank login | Demo-login by design, labelled on screen |
| Production SLA | One-process demo; Postgres + queues is the next step |

Every claim in this document maps to a file in the repo or a public source.
That is the existence test for a hackathon: every line of code is
defensible, every boundary is acknowledged, and every "what does it do"
has a file path the judge can open.

---

## Sources used in this document

- MHA / I4C data via **ThePrint** (Feb 2026) and **Firstpost** (July 2026) —
  case counts, losses, crackdown metrics.
- **Hindustan Times** — 85-year-old retired engineering professor case.
- **Economic Times** — CBI arrests in Odisha digital-arrest case.
- **News Karnataka** — Pune retired professor case.
- **blog.google / Pixel support** — Pixel Scam Detection, India availability,
  on-device Gemini Nano.
- **Collabora** (Feb 2025) — Whisper Hindi WER benchmarks.
- **arXiv 2412.19785** — Whisper + Indian languages prompt-tuning.
- **GitHub: keyvisions/CallScreener** — Android Call Screening API usage
  reference.