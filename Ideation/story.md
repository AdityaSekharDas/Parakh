# STORY — The Call at 2 o'Clock

*How a retired teacher almost lost her life savings — and how PARAKH held the
payment before a single rupee moved. Written to be read aloud to professors or
handed to them as a standalone sheet. Plain English; every term explained.*

---

## The ten-second version

A woman is kept on the phone by someone pretending to be Customs. He tells her
she is "under digital arrest" and must transfer her savings to a "safe
account" — now. She does what she is told. **One thing stands between her and
₹48,500 leaving her account forever: an engine that read the fear in the call,
connected it to the payment, and held it before settlement.**

---

## Part 1 — The call

Tuesday, 14:02. Sarita is at home in Bhubaneswar when her phone rings.

> Caller: "This is inspector Sharma from the Customs Department. Your Aadhaar
> is linked to a money-laundering case."
>
> Sarita: "What? I have not done anything. Please check again."
>
> Caller: "There is a warrant out. Do not tell ANYONE about this call — not
> your family, nobody."
>
> Sarita: "But what do I do?"
>
> Caller: "Everything will be clear if you transfer your savings to the safe
> account now. It is urgent. The warrant closes at 2 PM."

She is a retired teacher. She has never dealt with police or customs in her
life. The man knows her name, her city, and sounds official. For seven minutes
she listens: she must sit alone, not hang up, not tell anyone. The warrant
closes at 2 PM.

Every element of that call — the impersonation of authority, the order to
isolate herself, the closing deadline, the instruction to move money — is the
documented "digital arrest" script that Indian banks and the Ministry of Home
Affairs have been warning about for two years.

---

## Part 2 — The transfer

At 14:06 — four minutes after the call ends — Sarita does what she was told.
From her phone, she sends ₹48,500 (~$570) to `safeguard-account@okaxis`, a
UPI handle she has never seen before, on a phone she bought this morning, an
amount that is roughly **twelve times her usual payment**.

Without help, the sequence is: money leaves her account in seconds, moves
through the UPI rail into a money-mule account, is cashed out in minutes, and
is gone forever. UPI is instant by design; that is what makes it wonderful and
what makes it dangerous.

---

## Part 3 — What PARAKH did, minute by minute

| Time | What happened |
|---|---|
| 14:02 | The call ends. The call analyzer reads the transcript and flags it **coercive** — it recognizes four signature patterns (impersonation, isolation, urgency, control) and returns a verdict with 0.93 confidence. |
| 14:02–14:06 | Sarita's account is now marked: *a coercive call just happened to this person.* |
| 14:06 | The payment hits the engine. Six rules fire within milliseconds: |
| | • **+35** — a flagged coercive call happened 4 minutes before this payment *(this is the rule no other product has)* |
| | • **+20** — the payee has never been paid before |
| | • **+15** — the amount is ~12× this person's usual |
| | • **+15** — the device was changed today |
| | • **+10** — sudden velocity: multiple payments in minutes |
| | In parallel, the Isolation Forest — the machine-learning layer that detects payments that are *structurally abnormal* compared to the whole crowd of payments — scores the same payment anomalous: new payee clusters, night-adjacent timing, amount far outside personal history. |
| 14:06 + ε | The two opinions fuse into a single number: **95 / 100 — RED.** |
| 14:06 + ε | The transfer is **held before settlement.** No money moves. |
| 14:07 | A bank analyst opens the case. They see the evidence chain: the seven-minute call, the transcript with the flagged lines, the four patterns, the +35 linkage, the weighted reason list. |
| 14:08 | The analyst freezes the transfer and flags the payee. **Sarita's money never left her account.** |

The ordering matters as much as the detection: the call was judged *before* the
payment arrived. The engine did not need to gamble at the last second — it had
already heard the fear in the voice, minutes earlier.

---

## Part 4 — What happens without PARAKH

- **NPCI** (the rail itself) scores the payment in real time — but has no idea
  a coercive call just happened, and shows the victim no reasons.
- **Google's phone** can flag a scam call on the device — but the transfer
  still goes through; the call alert dies with the call.
- **WhatsApp and anti-scam apps** catch fake accounts — not the moment of
  transfer.

Each existing layer sees *one* end of the chain. PARAKH is the first product
that runs **call → payment → hold → human review** inside one engine, at the
bank, with the evidence shown at every step. That single property is why the
₹48,500 fails to move.

---

## Part 5 — The other side of the story

PARAKH does not block people from their own money. The same account, the same
week:

> Sarita pays **Rafiq Plumbing** ₹3,200 — a brand-new payee, an amount above
> her usual. The engine raises a **YELLOW** card (52/100) and shows her why:
> *new payee (+20), payee-network anomaly (+17), amount 1.6× your median
> (+10), unusual hour (+5).* The payment is held — and the card asks *her*:
> **"This is mine — continue"** or **"Not mine — stop it."**

She taps continue. The payment settles in 2.8 seconds. And the engine logs the
decision as learning — next time Rafiq Plumbing is paid, it is no longer "new."

This is the requirement the problem statement names explicitly: *support user
confirmation without blocking legitimate urgent payments.* A fraud engine that
stops honest people from paying a plumber, a hospital, or a daughter's school
fee is not a shield, it is another attacker. PARAKH's decisions are always
explained, always reviewable, and never final on their own.

---

## Part 6 — Why this is systemic

- **₹485 crore (~$57M) lost to UPI fraud in the first half of FY25** — 6.32
  lakh (632,000) incidents.
- Digital arrest is *the* scam of 2025–26: victims are disproportionately
  educated, older, and trusting of authority — documented targets include
  retired professors and doctors.
- The fraud is not a hack: it is a *performance*. A person is convinced, in
  real time, on a live call. Only a system that watches *both* the call and the
  payment can meet the attack where it actually happens.
- The banking regulator's own guidance pushes banks toward pre-transaction
  risk scoring and scam-call advisories — the two halves of this problem.
  PARAKH is the part where the halves meet.

---

## Part 7 — What PARAKH is, and is not (honesty box)

| It is | It is not |
|---|---|
| An explainable risk engine: every score decomposes into named rules with evidence | A magic detector that "knows" fraud |
| Call analysis **linked into the bank's pre-transaction scoring** (+35 rule) | A phone app that nags you after the fact |
| Human-first: YELLOW asks the citizen, RED asks the analyst, nothing is final without them | A firewall that silently stops payments |
| Real code end to end: rule engine is live; the Isolation Forest is genuinely trained and scored at seed time, verdicts cached so the demo cannot fail | A live connection to NPCI — real integration is an API handoff |
| Deterministic, auditable, re-runnable | A black box |

Questions a professor should ask — and the answers:

- **"The ML is cached?"** Yes. Training and scoring run in real code
  (scikit-learn); the demo replays stored verdicts so a 3-minute session can
  never fail. Banks demo on recorded data for the same reason. The pipeline is
  re-runnable end to end.
- **"Can the +35 rule be fooled?"** Any single rule can be; that is why the
  forest scores independently and the fusion is a weighted vote (60% rules /
  40% ML). A scam optimised against one layer still surfaces in the other.
- **"False positives?"** They exist, they are expected, and they are the
  product's review loop: every cleared YELLOW is logged, analytics shows the
  machine's miss rate, and the clearance teaches the next verdict.
- **"Why not just block high amounts?"** Because legitimate large payments
  exist — and because the scam's damage is the *conviction*, not the amount.
  The score explains *why* and the human decides.

---

## The one-liner

> *"A retired teacher gets a call: 'You're under digital arrest — pay now.'
> PARAKH is the engine that hears the fear in that call and holds the transfer
> before a rupee moves — while a real ₹3,200 payment to a plumber still goes
> through in 2.8 seconds, because the human decides."*

---

## Appendix — glossary used in this story

- **UPI** — Unified Payments Interface, India's instant money-transfer rail.
- **Settlement** — the moment money actually moves; PARAKH acts *before* it.
- **Coercive** — forced/ pressured: the signature of a scam call.
- **Isolation Forest** — a machine-learning method that scores how
  *abnormally different* a payment is from the crowd of normal payments.
- **Mule account** — a bank account collecting stolen money, run by the
  scammer's accomplices.
- **Confidence 0.93** — on a 0–1 scale, the analyzer is 93% sure the call
  matches the coercive pattern.
- **Aadhaar** — India's national biometric ID, the prop in the scam script.

*The Sarita narrative is a composite authored for the demo, built line-for-line
on the documented digital-arrest playbook and official fraud statistics; it
represents the pattern, not one identifiable person.*