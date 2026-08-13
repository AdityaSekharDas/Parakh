# PARAKH — Explained Simply

*Plain English. Every abbreviation explained the first time it appears.
Read this before the pitch, the video, and the code.*

---

## 1. What PARAKH is — in one sentence

**Every UPI payment is scored for fraud *before* it settles — and the biggest
scam of 2026, the "digital arrest" phone call, is wired into that score.**

UPI (Unified Payments Interface) is India's instant money-transfer rail — the
way most people pay a shop, a plumber, or a friend. PARAKH is a layer that sits
between "the customer pressed send" and "the money moved."

---

## 2. The problem — in plain English

**First the call, then the theft.**

The scam that defines this year: a caller pretends to be police or customs and
tells you your Aadhaar (your national ID) is linked to a crime. There is a
"warrant." You must not tell anyone. Pay the penalty *now* — into a "safe
account." People stay on these calls for *hours*. Then they transfer their
savings. By the time anyone discovers it, the money is gone.

The numbers: **₹485 crore (~$57M) lost to UPI fraud in the first half of
FY25 — 6.32 lakh (632,000) incidents.** Most of it is social-engineering:
the fraud happens because a person was *convinced*, not because a system was
hacked.

Here is what nobody does today:

| Player | What they do | What they miss |
|---|---|---|
| NPCI (the rail itself) | Scores every payment in real time | Never sees the phone call behind the payment; shows no reasons to the victim |
| Google (on-phone) | Detects scam *calls* on one device | Stops at the call — the transfer still happens |
| WhatsApp | Blocks fake police accounts | Catches the account, not the coercion or the payment |
| Kavalan / Voice Vigil / SentinelCall | Detect scam *call patterns* | Consumer-only; the bank never hears about it |
| TrueUPI | Lets you *manually* check a UPI ID | Reactive — you must already suspect something |

**The gap:** call analysis exists. Transaction scoring exists. **Nobody links
them inside the bank's engine.** That link is the product.

---

## 3. How the engine works

The flow, in order:

```
Payment arrives ──▶ 1. RULES     ──┐
(call already     ├── 2. ISOLATION FOREST   ──▶ fused score 0–100 ──▶ tier
 analyzed)        └── 3. (optional) LLM on the call transcript
                                                       │
                                       GREEN <40  YELLOW 40–70  RED >70
                                       settles     citizen     held until
                                       untouched   decides      a human acts
```

### 3.1 Layer one — the rules (deterministic, explainable)

Six rules, each with a weight. The number is the *points* it adds to the score.
Every rule can be read out loud and understood (this is "explainable AI" in the
most honest sense — the machine *tells* you why).

| Rule | Points | Plain English |
|---|---|---|
| Call flagged coercive within 5 min | +35 | The scam call just happened — highest weight, by design |
| New payee AND amount > 50% of balance | +20 | Someone you never paid is taking most of your money |
| Device changed in the last 24 h | +15 | The "customer" may not be on their own phone |
| Amount > 3× this person's usual median | +15 | Your normal payment isn't ₹49,500 |
| Outside this person's typical hours | +5 | You usually pay 8 AM–9 PM, not 1:04 AM |
| 3+ payments in 10 minutes | +10 | Panic or scripted speed |

These are *computed live from the payment data* — real numbers, real arithmetic,
zero mystery. A judge can verify: "12× median → +15. Where? In the code."

### 3.2 Layer two — the Isolation Forest (real ML, explained simply)

**What it is.** Imagine throwing every payment into a large space where near
things are similar (close to your usual amount, at your usual hour, to a payee
you know) and far things are strange (₹49,500 from a new phone to a brand-new
account at 2 AM). Now imagine cutting that space with random lines, over and
over, until each payment sits alone in its own little box.

Normal payments are hard to isolate — they live in dense neighborhoods, they
take many cuts to get alone. **Fraudulent payments are easy to isolate** —
they're the loner at the edge; a few cuts carve them out. The Isolation Forest
is literally a forest of such random-cutting trees. It scores each payment by
*how quickly it got isolated.*

**What goes in (the feature vector):** how unusual the amount is (compared to
the person's own history), how unusual the hour, how fast payments are coming,
whether the payee and device are new, and how "scattered" the choice of payment
app is.

**What comes out:** an anomaly score, normalized to 0–100. Then it is fused
with the rule score — the system takes the shape of both signals (about 60%
rules, 40% forest) so one false alarm in either layer can't decide alone.

**Concrete example from our seed data:** the refund scam case (T-2903). A
cluster of brand-new "refund-desk" payees being paid by *several different
customers* is structurally weird — the forest groups them, notices the
cluster, and the whole neighborhood scores high. Rules alone would only see
"one new payee". The forest sees the *network* of fraud.

**Honest mechanics:** the forest is trained once, at seed time, on the
simulated universe of transactions (2,000+), then scores every case and the
verdicts are cached (see §5). Training and scoring are real scikit-learn code;
the demo replays the cached results so it cannot fail.

### 3.3 Layer three — the coercive-call analyzer

A scammers' call follows a script. PARAKH checks a call transcript for the
four signature patterns:

| Pattern | What it looks like | Example (from our star case) |
|---|---|---|
| **Impersonation** | Claiming to be official | "This is inspector Sharma from the Customs Department." |
| **Isolation** | Forbidding contact with others | "Do not tell ANYONE about this call." |
| **Urgency** | A deadline, fear, penalty | "The warrant closes at 2 PM." |
| **Control** | Ordering a specific action | "Transfer to the safe account now." |

The analyzer is a pattern classifier: deterministic, needs no internet, needs
no API keys — it matches these patterns in the transcript and returns
`coercive (yes/no) · confidence · patterns found`. (An LLM — a large language
model — can run on the same transcript for extra nuance, but it is never a
demo dependency. The deterministic path always works.)

**Output:** a verdict. A verdict of *coercive* is what feeds the +35 rule.

### 3.4 The linkage — why this is different

The call verdict doesn't just inform the victim's phone. It lands **in the
bank's risk engine**, changing the score of the *next payment* from that
person, anywhere, even hours later, even on a different device:

```
14:02  call flagged COERCIVE (confidence 0.93)
14:06  transfer attempted to "safe account"
       → rules fire: +35 call-linkage · +20 new payee · +15 amount · +15 device · +10 velocity
       → score 95 · RED · transfer HELD before settlement
```

**Every player in §2 stops at one end of that chain. PARAKH is the first
product that runs the whole chain end to end — and shows it.**

### 3.5 The tiers — and who decides

| Tier | Score | What happens | Who decides |
|---|---|---|---|
| GREEN | < 40 | Settles untouched, no human involved | nobody — that is the point |
| YELLOW | 40–70 | Payment held; warning card with *each reason and its evidence* | **the citizen** ("This is mine — continue" / "Stop it") |
| RED | > 70 | Payment held; operator sees the evidence chain | **the bank analyst** (freeze / block / clear) |

The problem statement demands it: *"support user confirmation without blocking
legitimate urgent payments."* YELLOW is the product's soul — the machine never
silently decides against a real person. A ₹3,200 payment to a new plumber at
52/100 still goes through, in seconds, because Sarita says it's hers.

---

## 4. The learning loop

Every decision — citizen "continue", analyst "false positive" — is logged with
its reasons. The analytics screen shows the engine's mistakes being corrected:
what fraction of alerts were false positives, which rules cried wolf, and the
review queue where analysts clear them. The claim is never "we catch 100%".
The claim is: **explainable interception before money moves, with humans
always in charge and the machine demonstrably learning.**

---

## 5. What is real vs. simulated — honest boundaries

| Part | Real | Simulated |
|---|---|---|
| Rule layer | Real weighted code, computed live on each payment | — |
| Isolation Forest | Actually trained & scored (scikit-learn) at seed time | The demo *replays* the cached scores |
| Call analyzer | Real deterministic classifier on real transcripts | Call audio is a pre-recorded demo clip; transcripts are real text |
| Data store | SQLite, one process, real APIs | — |
| Transaction stream | Replay of a pre-authored seed (200+ payments) | Not live NPCI traffic |
| Identities & login | — | Demo-only identities (no passwords; by design) |

**Why replay?** A 3-minute video cannot tolerate a slow model load or a
one-off anomaly. Banks themselves demo on recorded data. Our cache makes the
demo structurally unable to fail; the pipeline that produced the cache is real
and re-runnable — live integration is an API handoff, which is exactly how
banks would consume it.

---

## 6. What's different from others — the honest table

| | Detects the call | Scores the payment | Links call → payment inside the engine | Shows the victim *why* | Lets the human override | Bank reviews false positives |
|---|---|---|---|---|---|---|
| NPCI | ✗ | ✓ | ✗ | ✗ | ✗ | partial |
| Google on-device | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| WhatsApp | partial | ✗ | ✗ | ✗ | ✗ | ✗ |
| Kavalan/Voice Vigil/SentinelCall | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| TrueUPI | ✗ | manual | ✗ | ✗ | ✗ | ✗ |
| **PARAKH** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** |

---

## 7. The pitch lines

**The master one-liner**
> Everyone watches the call or the payment. PARAKH watches both — and connects them.

**The human story (for judges)**
> "A retired teacher gets a call: 'You're under digital arrest — pay now.' PARAKH
> is the engine that hears the fear in that call and holds the transfer before a
> rupee moves — while a real ₹3,200 payment to a plumber still goes through in
> 2.8 seconds, because the human decides."

**The numbers**
> ₹485 crore lost to UPI fraud in six months. 6.32 lakh incidents. PARAKH
> intercepts the payment the scammer asks for — before it settles.

**The differentiator, in one breath**
> Call analysis exists. Transaction scoring exists. Nobody links them inside
> the bank's engine. That link is PARAKH — explainable, human-first, and built
> to never stop a real payment.

---

## 8. Glossary (first-mention expansions)

- **UPI** — Unified Payments Interface; India's instant money-transfer rail.
- **ML / model** — machine learning; a program that finds patterns in data instead of following hand-written rules.
- **Isolation Forest** — an ML method that scores how *abnormally different* a payment is by how easily it separates from the crowd.
- **Feature vector** — the list of numbers describing one payment (amount vs. history, hour, speed, payee, device, app).
- **Confidence** — how sure the classifier is, 0–1; 0.93 means "very sure."
- **LLM** — large language model (e.g., the kind behind modern AI chat); reads the transcript for extra nuance.
- **NPCI** — National Payments Corporation of India; the body that runs UPI.
- **Aadhaar** — India's national biometric ID, central to the "digital arrest" script.
- **coercive** — forced, pressured; the signature of scam calls.
- **z-score** — how many "usual steps" a number is away from that person's own average.