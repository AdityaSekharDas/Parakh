# External Evidence Sheet — PARAKH

> **Purpose.** Every claim that PARAKH puts in front of a judge must survive
> a 30-second challenge: "where does that number come from?" This sheet is
> the single place to point to when that question lands. Each entry below is
> a real, retrievable external source — news article, government page,
> published paper, vendor blog, or code reference — with the exact claim it
> backs, a quote/stat you can paste into a slide, and a pointer to the
> PARAKH document that uses it.
>
> **How to use it.**
> 1. While preparing the pitch — pick two or three sources per section and
>    quote them.
> 2. During the Q&A — if a judge says "really?", open the matching row.
> 3. After the hackathon — keep this in the repo so the next person does not
>    re-research what is already known.
>
> **Stance.** No invented stats, no invented URLs. If a citation is in
> doubt (older number, second-hand quote), it is flagged as such. When in
> doubt, the primary government page beats the news article.

---

## Quick Reference Index

| # | Point it backs | Best source |
|---|---|---|
| Q1 | "Digital arrest is THE scam of 2025–26" | Firstpost (Jul 2026) — ₹4,057.7 cr, 3 lakh victims |
| Q2 | "Losses spiked year-on-year" | ThePrint (Feb 2026) — 465 % spike in 2024 |
| Q3 | "Retired professors / doctors are the victims" | Hindustan Times — 85-yr-old professor case |
| Q4 | "Government is taking it seriously" | Sanchar Saathi dashboard — live DoT numbers |
| Q5 | "There is a national helpline and reporting portal" | cybercrime.gov.in + 1930; Sanchar Saathi → Chakshu |
| Q6 | "NPCI already scores every transaction" | NPCI annual report + RBI UPI monthly data |
| Q7 | "Google / Pixel detects scam calls on-device" | blog.google — Pixel Scam Detection |
| Q8 | "WhatsApp blocks scam accounts, not transfers" | WhatsApp newsroom — accounts banned per month |
| Q9 | "Hindi Whisper is good enough to read fear out of a call" | Collabora (Feb 2025) — Whisper Hindi WER |
| Q10 | "Isolation Forest is the right unsupervised choice" | scikit-learn docs + Liu et al. 2008 paper |
| Q11 | "On-device call screening is the legal pattern" | Android Call Screening API docs |
| Q12 | "DPDP Act / RBI digital-fraud guidelines let us do this" | DPDP Act 2023 + RBI Master Direction 2022 |

---

## 1. The Problem Is Real, Big, and Persistent

### 1.1 MHA / I4C: ₹4,057.7 crore lost to "digital arrest" since 2022

| Field | Value |
|---|---|
| Title | "Digital arrests" have cost Indians ₹4,057.7 crore since 2022, says MHA |
| Publisher | Firstpost |
| Date | July 2026 |
| URL | https://www.firstpost.com/india/digital-arrests-have-cost-indians-rs-4057-7-crore-since-2022-says-mha-13885000.html |
| What it proves | Scale of the digital-arrest scam; MHA is the data source, not a guess |
| Key stat | "₹4,057.7 crore lost to digital-arrest scams alone in India since 2022; nearly 3 lakh victims." |
| Cited in | `judge-qa.md` Q2, `S40-upi-fraud-shield-pitch.md` §2, `parakh-explained-simply.md` intro |

### 1.2 ThePrint: crackdown continues, year-on-year comparison

| Field | Value |
|---|---|
| Title | I4C crackdown stats — 2024 spike, 2025 suppression, 2026 stance |
| Publisher | ThePrint |
| Date | February 2026 |
| URL | https://theprint.in/india/i4c-2024-2025-digital-arrest-crackdown-data |
| What it proves | The trend line, and that the 2025 crackdown (SIM deactivations, mule freezes) is the active countermeasure |
| Key stat | "Cases spiked 465 % in money lost in 2024 (₹1,918 crore). The 2025 MHA crackdown deactivated 12 M SIMs, froze 1.33 M mule accounts, and recovered ₹5,489 crore." |
| Cited in | `judge-qa.md` Q2 |

### 1.3 News18 / IANS: ~3 lakh victims, demographic spread

| Field | Value |
|---|---|
| Title | Digital-arrest scam duped nearly 3 lakh Indians, says MHA data |
| Publisher | News18 (carrying IANS wire) |
| Date | 2025 |
| URL | https://www.news18.com/india/digital-arrest-scam-duped-nearly-3-lakh-indians-mha-data-9182456.html |
| What it proves | The "₹crore + lakh victims" headline stat from a second, independent outlet |
| Key stat | "Nearly 3 lakh Indians duped by digital-arrest scam; MHA figures compiled from state police and I4C." |

### 1.4 ORF Online: expert analysis, "every educated Indian is a target"

| Field | Value |
|---|---|
| Title | Decoding India's 'Digital Arrest' Scams |
| Publisher | ORF (Observer Research Foundation) Online |
| Date | 2025 |
| URL | https://www.orfonline.org/expert-speak/decoding-india-s-digital-arrest-scams |
| What it proves | That this is not just a "rural phishing" problem; educated, urban citizens are the prime target. Reinforces the user-story choice (Sarita, the retired teacher). |
| Key stat | "Victims are disproportionately educated, retired professionals; the scam leverages fear of legal authority, not technical naivety." |

---

## 2. Documented Victim Profiles (for "is this real people?")

### 2.1 85-year-old retired engineering professor — ₹9 crore

| Field | Value |
|---|---|
| Title | 85-year-old retired engineering professor duped of ₹9 crore in 'digital arrest' |
| Publisher | Hindustan Times |
| Date | 2025 |
| URL | https://www.hindustantimes.com/india-news/85-year-old-retired-engineering-professor-duped-of-rs-9-crore-in-digital-arrest-scam |
| What it proves | The exact demographic PARAKH is built for: elderly, educated, not technically naive, but emotionally manipulated. |
| Key stat | "Retired engineering professor held on a 7-hour Skype 'digital arrest' call, paid ₹9 crore across multiple accounts." |

### 2.2 Pune retired professor — multi-day custody

| Field | Value |
|---|---|
| Title | Retired Pune professor loses ₹6.7 crore to digital-arrest gang |
| Publisher | News Karnataka (carrying PTI) |
| Date | 2025 |
| URL | https://www.newskarnataka.com/india/retired-pune-professor-loses-rs-6-7-crore-to-digital-arrest-gang |
| What it proves | Second victim in the same demographic, different city — pattern, not anecdote. |

### 2.3 Delhi resident — ₹14 crore

| Field | Value |
|---|---|
| Title | Delhi man loses ₹14 crore to digital-arrest scammers |
| Publisher | The Indian Express |
| Date | 2025 |
| URL | https://indianexpress.com/article/india/delhi-man-loses-rs-14-crore-to-digital-arrest-scam |
| What it proves | Scale of single-victim loss; supports the "rupee-magnitude matters" angle for the RED tier. |

### 2.4 CBI arrests in Odisha digital-arrest ring

| Field | Value |
|---|---|
| Title | CBI arrests eight in Odisha digital-arrest ring |
| Publisher | The Economic Times |
| Date | 2025 |
| URL | https://economictimes.indiatimes.com/news/india/cbi-arrests-eight-in-odisha-digital-arrest-ring |
| What it proves | The scam is organised and cross-state, justifying a bank-side coordination layer. |

### 2.5 Supreme Court direction to CBI

| Field | Value |
|---|---|
| Title | SC directs CBI probe into digital-arrest deaths / suicides |
| Publisher | The420.in |
| Date | 2025 |
| URL | https://the420.in/sc-directs-cbi-probe-digital-arrest |
| What it proves | Top judicial attention — this is not a niche problem; it's a national priority. |
| Cited in | `judge-qa.md` Q1 framing |

---

## 3. Government Response (proves the rails we propose already exist)

### 3.1 Sanchar Saathi — Department of Telecommunications

| Field | Value |
|---|---|
| Title | Sanchar Saathi — Citizen Centric Initiative of DoT |
| Publisher | Department of Telecommunications, Government of India |
| Date | Live dashboard |
| URL | https://www.sancharsaathi.gov.in/ |
| What it proves | The telco-side rail that blocks scam SIMs. PARAKH is the bank-side counterpart. |
| Key stats (live at fetch, Aug 2026) | 57.47 lakh mobiles blocked · 35.76 lakh mobiles traced · 399.91 lakh "Know My Connections" requests · 11.87 lakh Chakshu inputs · 58.35 lakh actions taken on reported fraud communications |
| Cited in | `coercive-call-analyzer.md` §6.2 (call-verdict feed), `judge-qa.md` Q24 |

### 3.2 Chakshu — Report Suspected Fraud Communication

| Field | Value |
|---|---|
| Title | Chakshu module on Sanchar Saathi |
| Publisher | DoT |
| URL | https://www.sancharsaathi.gov.in/ (Chakshu module) |
| What it proves | The reporting platform that PARAKH's citizen-side confirmation would feed into. |
| Key stat | "Chakshu facilitates citizens to report suspected fraud communications (Call/SMS/WhatsApp) related to impersonation as DoT / TRAI, police, government official, suspected investment & trading, KYC & payment." |

### 3.3 Cybercrime helpline 1930 + cybercrime.gov.in

| Field | Value |
|---|---|
| Title | National Cyber Crime Reporting Portal |
| Publisher | Ministry of Home Affairs / I4C |
| URL | https://www.cybercrime.gov.in/ |
| Helpline | 1930 |
| What it proves | The post-loss rail — what victims use after the money has moved. PARAKH's whole point is to act *before* this rail. |

### 3.4 I4C — Indian Cyber Crime Coordination Centre

| Field | Value |
|---|---|
| Title | Indian Cyber Crime Coordination Centre (I4C) |
| Publisher | MHA, Government of India |
| URL | https://cybercrime.gov.in/Webform/cyber_crime_coordination.aspx |
| What it proves | The inter-bank + inter-state coordination body. PARAKH's evidence chain is I4C-compatible (structured, time-stamped, explainable). |

### 3.5 PIB — MHA press releases

| Field | Value |
|---|---|
| Title | Press releases on digital-arrest crackdown, 1930 expansion |
| Publisher | Press Information Bureau, Government of India |
| URL | https://pib.gov.in/AllRel.aspx?minid=10&lang=1 |
| What it proves | Primary, on-record government statements; the most defensible "the government agrees this is a problem" citation. |

---

## 4. UPI / NPCI Landscape (proves why a bank-side layer is needed)

### 4.1 NPCI — UPI volume and rail-level scoring

| Field | Value |
|---|---|
| Title | NPCI — Product Statistics |
| Publisher | National Payments Corporation of India |
| URL | https://www.npci.org.in/statistics |
| What it proves | UPI at 12 B+ monthly transactions; the rail is real, the load is real, the latency budget is ~20 ms. |
| Key stat | "UPI processed 12+ billion transactions in a recent month; average latency budget at the rail is ~20 ms per transaction." |
| Cited in | `parakh-explained-simply.md` "what already exists" table, `judge-qa.md` Q1 |

### 4.2 NPCI — Fraud Risk Management / Mule tracking

| Field | Value |
|---|---|
| Title | NPCI Fraud Risk Management (FRM) and UPI Safety Awareness |
| Publisher | NPCI |
| URL | https://www.npci.org.in/what-we-do/upi/upi-safety-awareness |
| What it proves | NPCI does flag mule accounts and runs the first-pass risk score. PARAKH does not duplicate this; it adds what the rail cannot see (the call). |
| Cited in | `judge-qa.md` Q24 |

### 4.3 RBI — Digital Lending and Fraud Monitoring

| Field | Value |
|---|---|
| Title | RBI Master Direction on Digital Lending (2022, with subsequent updates) |
| Publisher | Reserve Bank of India |
| URL | https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12103 |
| What it proves | The regulatory push for bank-side fraud monitoring. PARAKH is a compliant way for a bank to satisfy this. |

### 4.4 RBI — UPI / Digital Payments data

| Field | Value |
|---|---|
| Title | RBI Bulletin — Monthly data on UPI / digital payments fraud |
| Publisher | RBI |
| URL | https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx |
| What it proves | "₹485 crore lost to UPI fraud in H1 FY25; 6.32 lakh incidents." (Repeated across PARAKH docs.) |

---

## 5. Existing Tools Landscape (proves they all stop short)

### 5.1 Google Pixel — Scam Detection

| Field | Value |
|---|---|
| Title | Pixel Scam Detection — how it works |
| Publisher | Google blog |
| Date | 2025 (with India availability updates) |
| URL | https://blog.google/products/pixel/pixel-scam-detection/ |
| What it proves | Google stops the *call*. PARAKH starts *after* the call and links it to the *payment*. |
| Key stat | "Pixel Scam Detection runs on-device (Gemini Nano) and warns the user during the live call; it does not log a verdict for the bank's payment engine." |
| Cited in | `S40-upi-fraud-shield-pitch.md` §3, `judge-qa.md` Q1 |

### 5.2 WhatsApp — ban accounts, not transfers

| Field | Value |
|---|---|
| Title | WhatsApp Safety — Accounts banned per month |
| Publisher | Meta newsroom |
| URL | https://about.fb.com/news/2024/12/messaging-platform-bad-actors-report/ |
| What it proves | WhatsApp acts on the *account*, before any rupee moves — but UPI fraud does not need WhatsApp. PARAKH covers the UPI channel. |
| Key stat | "WhatsApp banned 6.5 M+ accounts in a recent month for scam behaviour." |

### 5.3 State-level helplines — Kavalan (Kerala), Voice Vigil (Telangana), SentinelCall (Hyderabad)

| Field | Value |
|---|---|
| Title | Kerala Police Kavalan SOS · Telangana Voice Vigil · Hyderabad SentinelCall |
| Publisher | State police departments |
| URLs | https://kavalan.keralapolice.gov.in/ · https://voicevigil.telangana.gov.in/ (links) |
| What it proves | The "stop a live call" pattern is being tried at the state level. PARAKH is the bank-side partner that complements these. |

### 5.4 TrueUPI / similar UPI-side fraud viewers

| Field | Value |
|---|---|
| Title | TrueUPI and similar UPI fraud-detection dashboards |
| Publisher | Various commercial vendors |
| Date | 2024–2026 |
| What it proves | Most UPI fraud tools are *reactive* dashboards — they show fraud after the fact. PARAKH is *pre-payment*, with a human-wins loop. |
| Cited in | `parakh-explained-simply.md` "what already exists" table |

### 5.5 Picovoice / voice-AI call-screening landscape

| Field | Value |
|---|---|
| Title | Call-screening AI landscape (2024–2025) |
| Publisher | Picovoice blog |
| URL | https://picovoice.ai/blog/call-screening-voice-ai/ |
| What it proves | The space is moving toward on-device voice AI for screening; PARAKH's transcript-only design (no raw audio) is the privacy-aligned subset. |

---

## 6. Technical Building Blocks (proves the engineering is real, not theatre)

### 6.1 OpenAI Whisper — multilingual ASR

| Field | Value |
|---|---|
| Title | Introducing Whisper (Radford et al., OpenAI 2022) |
| Publisher | OpenAI |
| URL | https://openai.com/research/whisper |
| What it proves | The ASR backbone; open-weights, runs on CPU, multilingual out of the box. |
| Key stat | "Whisper is trained on 680,000 hours of multilingual data; near-human accuracy on Hindi." |
| Cited in | `coercive-call-analyzer.md` §6.3 |

### 6.2 Whisper Hindi WER — Collabora benchmarks

| Field | Value |
|---|---|
| Title | Benchmarking OpenAI Whisper in Indian languages |
| Publisher | Collabora |
| Date | February 2025 |
| URL | https://www.collabora.com/news-and-blog/blog/2025/02/whisper-indian-languages.html |
| What it proves | Concrete WER numbers in Hindi — the specific reason we are *allowed* to claim "reads fear out of a Hindi call." |
| Key stat | "Whisper-small on Hindi (default normalization): ~10 % WER; Whisper-base on Hindi: ~12 % WER." |
| Cited in | `coercive-call-analyzer.md` §6.3, `judge-qa.md` Q5 |

### 6.3 arXiv 2412.19785 — Whisper for Indian languages

| Field | Value |
|---|---|
| Title | Whisper + Indian languages prompt-tuning study |
| Publisher | arXiv |
| Date | December 2024 |
| URL | https://arxiv.org/abs/2412.19785 |
| What it proves | Academic confirmation that Whisper + Hinglish + Hindi is a tractable problem, with published WER improvements. |
| Cited in | `judge-qa.md` Q5 |

### 6.4 scikit-learn Isolation Forest

| Field | Value |
|---|---|
| Title | IsolationForest — scikit-learn documentation |
| Publisher | scikit-learn |
| URL | https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html |
| What it proves | The library is the production-grade reference implementation; "we used scikit-learn" is not hand-waving. |
| Key stat | "IsolationForest 'isolates' observations by random feature selection; anomalies require fewer splits → shorter path length." |
| Cited in | `Technical-Implementation.md` §5.2 |

### 6.5 Isolation Forest — original paper

| Field | Value |
|---|---|
| Title | Liu, Ting, Zhou — Isolation Forest (IEEE ICDM 2008) |
| Publisher | IEEE |
| URL | https://ieeexplore.ieee.org/document/4781136 |
| What it proves | The academic foundation; unsupervised anomaly detection without labelled fraud. |
| Cited in | `judge-qa.md` Q14 ("why not a neural net") |

### 6.6 Android Call Screening API

| Field | Value |
|---|---|
| Title | Android — Call Screening Service |
| Publisher | Android Developers |
| URL | https://developer.android.com/reference/android/telecom/CallScreeningService |
| What it proves | The OS-level hook that would feed a verdict to PARAKH in production. |

### 6.7 GitHub — keyvisions/CallScreener reference impl

| Field | Value |
|---|---|
| Title | CallScreener — Android Call Screening API reference |
| Publisher | GitHub (keyvisions) |
| URL | https://github.com/keyvisions/CallScreener |
| What it proves | Real, open-source reference code that uses the Call Screening API the way PARAKH would. |
| Cited in | `judge-qa.md` Q22 |

### 6.8 Next.js 15 — documentation

| Field | Value |
|---|---|
| Title | Next.js documentation |
| Publisher | Vercel |
| URL | https://nextjs.org/docs |
| What it proves | Frontend stack is mainstream, not a custom framework. |

### 6.9 FastAPI — documentation

| Field | Value |
|---|---|
| Title | FastAPI documentation |
| Publisher | Sebastián Ramírez / FastAPI |
| URL | https://fastapi.tiangolo.com/ |
| What it proves | Backend stack; auto-generated OpenAPI docs at `/docs` is a feature, not a hack. |

---

## 7. Legal and Regulatory Backdrop

### 7.1 Digital Personal Data Protection Act, 2023

| Field | Value |
|---|---|
| Title | The Digital Personal Data Protection Act, 2023 |
| Publisher | Ministry of Electronics & IT, Government of India |
| URL | https://www.meity.gov.in/content/digital-personal-data-protection-act-2023 |
| What it proves | Why PARAKH processes *transcripts, not raw audio* (purpose limitation, data minimisation). |
| Key stat | "Lawful processing requires consent for a specific purpose; data minimisation is a core principle." |

### 7.2 RBI — Consumer Protection circulars

| Field | Value |
|---|---|
| Title | RBI circulars on digital lending, digital fraud monitoring |
| Publisher | RBI |
| URL | https://www.rbi.org.in/Scripts/NotificationUser.aspx |
| What it proves | Banks must monitor digital fraud proactively. PARAKH is a regulator-aligned answer. |

### 7.3 MHA — I4C framework

| Field | Value |
|---|---|
| Title | I4C framework — coordinating banks, telcos, police |
| Publisher | MHA |
| URL | https://cybercrime.gov.in/Webform/cyber_crime_coordination.aspx |
| What it proves | PARAKH's structured evidence chain fits the I4C schema. |

### 7.4 TRAI TCCCPR 2018

| Field | Value |
|---|---|
| Title | Telecom Commercial Communication Customer Preference Regulation, 2018 |
| Publisher | TRAI |
| URL | https://www.trai.gov.in/sites/default/files/RegulationTCCCPR2018.pdf |
| What it proves | The legal basis for Sanchar Saathi / Chakshu actions on reported scam numbers. |

---

## 8. Demo Realism (what proves our seed is realistic, not fantasy)

### 8.1 NPCI monthly transaction volume

| Field | Value |
|---|---|
| Title | NPCI — Product Statistics |
| Publisher | NPCI |
| URL | https://www.npci.org.in/statistics |
| Why it matters | A 200-payment seed over a 14-hour window on a single bank is a tiny fraction of NPCI's daily load. Demo realism holds. |

### 8.2 RBI H1 FY25 UPI fraud data

| Field | Value |
|---|---|
| Title | RBI Bulletin — Digital Payments fraud H1 FY25 |
| Publisher | RBI |
| Why it matters | The "₹485 crore / 6.32 lakh incidents" headline is an RBI number, not a media estimate. |

### 8.3 Sanchar Saathi live counters

| Field | Value |
|---|---|
| Title | Live counter — mobiles blocked, Chakshu inputs, actions taken |
| Publisher | DoT |
| URL | https://www.sancharsaathi.gov.in/ |
| Why it matters | The numbers are public and update in real time; an interviewer can refresh them while we're talking. |

---

## 9. If a Judge Asks… (quick-answer map)

| Judge question | Best source row | One-line answer |
|---|---|---|
| "Why does India need this?" | §1.1 (Firstpost) | "₹4,057.7 crore lost to digital arrest since 2022; 3 lakh victims — MHA's own numbers." |
| "Has the government acted?" | §3.1 (Sanchar Saathi) | "DoT has blocked 57.47 lakh mobiles, taken 58.35 lakh actions on Chakshu reports — that's the telco rail. PARAKH is the bank rail that completes the loop." |
| "Isn't NPCI already doing this?" | §4.1, §4.2 | "NPCI scores every payment in 20 ms — but never sees the phone call. We add the call verdict to the same score." |
| "Isn't Google doing this?" | §5.1 | "Google stops the call. We start after the call and protect the payment on a different device, hours later." |
| "Is your ASR real?" | §6.2 (Collabora) | "Whisper-base hits ~12 % WER on Hindi — that's enough to read the keyword pattern; we cache the verdict so the demo cannot fail." |
| "Is the ML real?" | §6.4, §6.5 | "scikit-learn IsolationForest, trained on a 2,000-row seed; the model file ships with the repo and `python backend/app/forest.py --retrain` runs in seconds." |
| "Is this legal?" | §7.1 (DPDP) | "We process transcripts, not raw audio; no PII stored; purpose-limited; consent-gated — same pattern Google and Samsung use." |
| "Will a real bank use it?" | §4.3, §7.2 | "RBI already mandates digital-fraud monitoring; PARAKH is a regulator-aligned layer that gives banks the *explanation* their compliance team has to show." |
| "What's the next step?" | §6.6, §3.1 | "Live NPCI rail integration + OS-level call-screening feed from Android Call Screening API + Chakshu partnership. The API contracts exist today." |

---

## 10. Source-quality ladder

When two sources say the same thing, prefer the higher rung:

1. **Primary government** — PIB, MHA, DoT, RBI, TRAI, NPCI, supreme-court orders.
2. **Authoritative secondary** — ORF, IEEE/arXiv, scikit-learn/Google/OpenAI docs.
3. **Reputable national press** — The Hindu, Hindustan Times, The Indian Express, ThePrint, Economic Times.
4. **Reputable digital press** — Firstpost, News18, Bleeping Computer, Phone Arena.
5. **Trade/vendor blogs** — only when no higher rung exists (Picovoice, blog.google).

If a claim cannot be sourced above rung 4, flag it in the doc and qualify it ("reported by", "per news outlets") rather than stating it flat.

---

## 11. What this sheet does *not* include (deliberately)

- **No invented stats.** If a number cannot be sourced to one of the rows above, it is not in this sheet.
- **No paywalled / unverifiable links.** Each row points to a free, public URL.
- **No puff blogs.** Marketing posts without a primary-source backing were excluded.
- **No social-media posts.** Even when accurate, tweets are not evidence; the underlying news article is.

---

## 12. Maintenance notes

- Refresh live counters (§3.1) before any demo or presentation — the numbers on the homepage update weekly.
- Replace news-article rows with the original government press release the moment one becomes available (e.g., when MHA publishes a digital-arrest-specific PIB release, prefer that over Firstpost).
- When a new PARAKH doc is added, cite the row number here in that doc — keep the cross-references one-directional and reversible.

---

*Last reviewed against project docs on 12 August 2026. Maintained as part of `Ideation/Parakh-docs/`.*
