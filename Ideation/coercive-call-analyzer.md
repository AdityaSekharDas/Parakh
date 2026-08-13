# The Coercive-Call Analyzer — How PARAKH Generates the Transcript

*Both product view (what the user, the bank, and the citizen see) and
technical view (the audio → text → verdict pipeline that makes it real). Plain
English; every term explained on first use.*

---

## 1. Why this is the differentiator

Call analysis alone exists (Kavalan, Voice Vigil, SentinelCall; Google Pixel's
on-device Scam Detection). Transaction scoring exists (NPCI runs ~20 ms risk
scoring on every UPI payment). **Nobody links them inside the bank's engine.**
That link is the +35 rule, the only rule in the product nobody else can claim.
This doc explains where the call verdict comes from.

---

# PART I — THE PRODUCT VIEW

## 2. What the person on the call sees

PARAKH is **never** a wiretap. It analyses the call only with the user's
informed consent, on their device, mirroring Google's certified Scam Detection
model on Pixel 9+ (available in India since 2024).

The screen reads, in plain language:

> *"PARAKH is listening to this call locally — only for scam patterns. The
> audio never leaves your phone. You can turn this off at any time."*

When the analyzer fires, the user sees a calm, single-screen verdict — the
same shape Google already ships on Pixels — not a popup storm:

| | |
|---|---|
| Verdict | "This call matches the digital-arrest scam pattern." |
| Confidence | 93% |
| Patterns found | impersonation · isolation · urgency · control |
| Suggestion | "Hang up. If you need help, call **1930** (India's cyber-crime helpline)." |
| Call to action | End call · Continue · Report to 1930 |

No audio stored, no transcript uploaded, no third party hears it.

## 3. What the bank operator sees

The operator never sees audio. They see what reaches the bank's risk engine —
the **verdict** (with patterns + confidence) and the **linkage** to the next
payment from that person:

```
14:02  call verdict: COERCIVE · 0.93
        impersonation · isolation · urgency · control
14:06  ₹49,500 → safeguard-account@okaxis (new device, new payee)
        rules: +35 call · +20 new payee · +15 12× median · +15 new device · +10 velocity
        forest score 78 · fused 95 · RED · transfer HELD
```

That is what crosses the rail — a number, a list of named reasons, and a
timestamped chain. The operator does not listen to the call; the bank does not
record it.

## 4. What the citizen sees (the verdict card)

In the citizen pay flow, if the verdict comes back YELLOW, the citizen sees
their own version: the same four reasons, written for a non-operator, with the
"This is mine — continue / Stop it" choice.

---

# PART II — THE TECHNICAL VIEW

## 5. The pipeline at a glance

```
audio (with consent)
     │
     ▼
[1] VAD (silero-vad) ──── silence → speech segments
     │
     ▼
[2] ASR (Whisper, multilingual) ──── Hindi / English / Hinglish → text + timestamps
     │
     ▼
[3] Speaker diarization ──── caller / citizen tags per line
     │
     ▼
[4] PII redaction ──── names masked, audio dropped, text only
     │
     ▼
[5] Pattern classifier ──── deterministic, strict JSON
     │                       {is_coercive, confidence, patterns_found[], summary}
     ▼
[6] (optional) LLM pass ──── same strict JSON; never the dependency
     │
     ▼
[7] Store: `calls` table ──── transcript + verdict, encrypted at rest
     │
     ▼
[8] Linkage: rule 3 of risk engine fires if next payment within 5 min
```

## 6. Each stage, in real engineering terms

### 6.1 Audio capture — the consent gate, never a tap

Two paths, ranked by privacy:

- **On-device (the path PARAKH recommends, like Google's Pixel Scam Detection
  which uses on-device Gemini Nano on Pixel 9+ and ships in India).** The
  bank's app holds a certified access token for Android's
  `CallScreeningService` API; audio is processed in the OS's secure enclave;
  nothing leaves the phone. The user sees the consent banner every call.
- **Network-side fraud tagging (the public-sector pathway).** India's DoT runs
  **Sanchar Saathi / Chakshu** for citizens to report and tag scam numbers; the
  I4C / Cyber Fraud Mitigation Centre coordinates banks and telcos for
  real-time response — including RBI's mandated enhanced monitoring for scam
  patterns. PARAKH's verdict is the *bank-side* complement to that: it carries
  the call's *content* evidence, not just the number's reputation.

**PARAKH never uses live-call wiretapping.** The legal framing (Indian Telegraph
Act + IT Act + the 2017 privacy ruling) makes an undisclosed bank wiretap
illegal; the consent-gated on-device model sidesteps the problem entirely.

### 6.2 Voice activity detection — `silero-vad`

A tiny, fast model that turns raw audio into "speech here, silence here."
Why it matters: most of a 7-minute scam call is silence, background noise, or
the victim saying "okay… okay…"; we only want to feed ASR the parts that
actually carry words. `silero-vad` is a few MB and runs in milliseconds.

### 6.3 Speech-to-text — Whisper (small/base, multilingual)

Whisper is OpenAI's open-weights ASR (automatic speech recognition — speech
to text) model. The pipeline uses the **multilingual** variant (not
`.en-only`) because scam calls in India are routinely Hindi, English, or
Hinglish. Concrete numbers from public evaluation:

- Whisper-small on Hindi (default normalization): **~10% WER** (Word Error
  Rate — fraction of words transcribed incorrectly)
- Whisper-base on Hindi: ~12% WER
- Fine-tuned Hindi variants (e.g., `vasista22/whisper-hindi-small`,
  `collabora/whisper-small-hindi`, `sanchit-gandhi/whisper-small-hi`) push
  semantic accuracy further, especially with Indic normalization (which keeps
  Devanagari diacritics and word boundaries — critical for "CBI" / "cyber
  cell" style named-entity matches in scam transcripts)

For the demo we use the **base** multilingual Whisper offline; the cache
doctrine (see explainer doc) means the *demo* runs on pre-computed
transcripts, while the *code* runs the real model when given audio.

### 6.4 Speaker diarization — "who said this"

We label each transcript line as **caller** or **citizen**. Two ways:

- **Heuristic (free, deterministic):** lines that begin with capitalized
  addresses ("Inspector," "Ma'am," "Sir"), imperatives ("transfer," "send"),
  or institutional phrases are tagged caller; back-channels ("yes," "okay,"
  "what?") are citizen. Works surprisingly well on the digital-arrest script.
- **`pyannote-audio`** (optional, ~50 MB model): proper speaker diarization
  with embeddings; useful for the live path where generalisation matters more
  than on the demo seed.

### 6.5 PII redaction — what we keep, what we drop

**Drop:** raw audio (always, immediately), audio features, voice embeddings,
caller phone number.
**Mask:** real names of the citizen, account numbers, Aadhaar fragments, the
victim's bank.
**Keep:** the text of the transcript (with names replaced by `[NAME]`),
the speaker tag, the pattern verdict, the confidence, the timestamp.

Result: even if the `calls` table leaks, the row is a script of *behaviour*,
not a recording of a *person*.

### 6.6 The pattern classifier — strict JSON, never ambiguous

Four patterns, each with deterministic keyword + phrase matches, weighted by
how uniquely coercive they are:

| Pattern | Weight | Trigger examples (English / Hindi) |
|---|---|---|
| **Impersonation** | 0.30 | "CBI," "customs," "cyber cell," "warrant," "case number," / "CBI है," "वारंट" |
| **Isolation** | 0.25 | "don't tell anyone," "sit alone," "do not disconnect," / "किसी को मत बताना," "अकेले बैठो" |
| **Urgency** | 0.25 | "now," "deadline," "blocked," "penalty," "within hours," / "अभी," "आज ही," "जुर्माना" |
| **Control** | 0.20 | "transfer," "safe account," "click this link," "send the OTP," / "ट्रांसफर करो," "सेफ अकाउंट" |

**`is_coercive`** = ≥2 patterns matched with combined weight ≥ 0.50, OR ≥3
patterns matched at any weight.
**`confidence`** = normalised weighted sum (calibrated against 4 held-out
scripts at seed time; deterministic).

**Output (strict JSON, every field required):**

```json
{
  "is_coercive": true,
  "confidence": 0.93,
  "patterns_found": ["impersonation", "isolation", "urgency", "control"],
  "summary": "Caller impersonates Customs; orders isolation; sets a 2 PM deadline; demands a transfer to a 'safe account'."
}
```

This shape is what the rule layer looks up. No free text, no ambiguity.

### 6.7 Optional LLM pass — never the dependency

An LLM (large language model — a generative AI that reads and writes text)
can run on the same redacted transcript with the same strict JSON prompt. It
adds nuance ("caller references a fake FIR number" — a sub-pattern not in the
keyword list) but is **never on the critical path**. The deterministic
classifier alone meets the demo. If the LLM is up, it's a second opinion; if
it's down, nothing changes.

### 6.8 Storage

The `calls` table stores: `call_id`, `user_id`, `started_at`,
`duration_sec`, `transcript` (redacted text), `is_coercive`, `confidence`,
`patterns_found`, `summary`. No audio bytes. No raw embeddings. Encrypted at
rest (SQLite + SQLCipher optional). Retention policy: 90 days, then deleted
(configurable).

### 6.9 Linkage — how the verdict reaches the bank engine

The verdict is *pushed* to the bank's risk engine over a consent-gated API.
Inside the engine it lives in the `calls` table and is looked up on every
`/ingest`:

```
if recent_call_for(user_id) within 5 min and recent_call.is_coercive:
    apply rule 3: +35
    evidence = f"call {call_id} · {confidence} · {patterns_found}"
```

The bank never receives the transcript — only `{verdict, confidence,
patterns}` — unless the analyst explicitly opens the case (with audit trail).

---

## 7. The demo implementation — what the team actually ships

Three modes, increasing in realism:

| Mode | What runs | When |
|---|---|---|
| **Transcript-only** | A JSON file with pre-written lines (the `calls` table in seed). Classifier runs at seed time, verdict cached. | **Round 1 (PPT + video) — this is what ships.** No new deps, deterministic, the demo cannot fail. |
| **Pre-recorded audio + offline Whisper** | A `.wav` file of the call (synthesised via gTTS Hindi/English or recorded once) → Whisper base multilingual transcribes → classifier runs → verdict cached. | Optional upgrade; ~30 min to add. Pure offline, no API keys. |
| **Live `/calls/analyze` endpoint** | `POST /calls/analyze {audio_url | transcript}` → runs the classifier → returns the verdict JSON. | Day 5 polish. Lets a judge paste any transcript and see the verdict instantly. |

For the **video**, mode 1 with a tiny overlay ("verdict recomputed in 0.4 s
from the same classifier a live call would hit") is enough — the code that
runs the live path is the same Python function.

### 7.1 Synthesising a demo audio clip (optional)

```python
# backend/scripts/make_demo_call.py — runs once, output goes in seed/demo/
from gtts import gTTS            # free, no API key
lines = [
  "This is inspector Sharma from the Customs Department. "
  "Your Aadhaar is linked to a money laundering case.",
  # ... six lines of the scripted call
]
audio = gTTS(" \n".join(lines), lang="hi")
audio.save("seed/demo/call_1421.mp3")
```

Then `whisper seed/demo/call_1421.mp3 --language hi --model base` produces
the transcript; the classifier produces the verdict; both are cached in
`seed/calls.json`.

### 7.2 Re-running the pipeline at seed time

```bash
# Day 2 of the build plan — one command, deterministic
python backend/app/seed_engine.py \
    --calls backend/seed/demo/*.mp3 \
    --out   backend/seed/calls.json
```

This is what `forest.py` does for the Isolation Forest on Day 2, and what
`callanalyzer.py` does for the call verdicts on Day 2 — same doctrine, one
command, cached results.

---

## 8. The legal and privacy posture (one breath)

- **No raw audio is stored.** Ever. The classifier works on redacted text.
- **No third-party wiretap.** Analysis happens on the user's device with
  their consent, the same proven pattern Google uses for Pixel Scam Detection
  (which has shipped in India since 2024). Where the bank needs the verdict
  (for the +35 rule), only `{verdict, confidence, patterns}` crosses the rail.
- **Compliance tailwind:** RBI has mandated enhanced transaction monitoring
  for scam patterns; MHA's I4C runs the Citizen Financial Cyber Fraud
  Reporting and Management System behind the 1930 helpline; the Cyber Fraud
  Mitigation Centre coordinates banks and telcos in real time. PARAKH is the
  *content-aware* layer that complements these *number-aware* systems.
- **Privacy defaults off.** A user can disable call analysis in their bank
  app at any time. The risk engine still works — it just loses the +35
  linkage for that user.

---

## 9. Where this lives in the repo

```
backend/app/callanalyzer.py   # classifier (deterministic) + optional LLM
backend/app/seed_engine.py    # trains forest + scores calls + writes seeds
backend/seed/calls.json       # transcripts + verdicts (the cache)
backend/seed/demo/*.mp3       # optional synthesized audio
backend/scripts/make_demo_call.py   # gTTS helper
```

The classifier's signature is the same regardless of mode:

```python
analyze(transcript: list[str]) -> {
  "is_coercive": bool,
  "confidence": float,
  "patterns_found": list[str],
  "summary": str,
}
```

One function. Live, replay, and demo all call the same function.

---

## 10. The headline

> *"PARAKH's call analyzer is a deterministic pattern classifier with an
> optional LLM second opinion, run on redacted transcripts, never on stored
> audio, with the user's informed consent on their device — and the verdict
> is what crosses to the bank, so the +35 rule can fire before the money
> moves."*
