# PARAKH Mock UI — build log

Single deterministic mock universe (`src/data/mock.ts`) powers every screen.
All figures cross-check: Overview KPIs == ReviewQueue counts == Analytics.
No `Math.random` anywhere; the demo cannot flake.

## Screens (App Router, Next 16.3, Tailwind v4)

| Route | What it serves | Client state |
|---|---|---|
| `/` | Landing (front page): masthead pitch, persona doors (Operator / Citizen), today's wire, guard rules, **backstage 5-min demo path** | none |
| `/operator/overview` | Command centre: KPI strip, live alert feed, risk histogram, most-at-risk, model card | none (static read) |
| `/operator/review` | Queue: filters, assign / mark-legit inline, links to evidence screen | tasks + filter (local) |
| `/operator/review/[id]` | Evidence screen: weighted reasons, risk trajectory sparkline, **coercive-call analyzer** (T-1421), citizen file, resolution ledger, freeze/block/release actions | status + ledger + confirm panel |
| `/operator/analytics` | Precision/recall, losses-vs-interception, funnel, scam types, model lifecycle | none |
| `/citizen` | Sarita's statement; the two-star callout (₹49,500 intercepted, ₹3,200 watched) | none |
| `/citizen/alerts` | Plain-language alert mailbox with weighted evidence | none |
| `/citizen/pay` | The guard live: compose → staged checks → 52/100 verdict → "continue / stop" | 5-step state machine |

## The three demo features (all work)

1. **Intercept before settlement** — operator path: `/operator/review/T-1421`; call transcript, waveform, patterns, +35 call-linkage, freeze flow. Judge-facing.
2. **The coercive-call analyzer** — voiced demo of the digital-arrest case; verdict chip, transcript flagged lines, watch-list linkage.
3. **Citizen-in-control** — `/citizen/pay`: a new-payee ₹3,200 transfer trips YELLOW (52/100), shown to *her*, released or stopped by *her*. Human overturns machine; machine learns.

## Conventions

- Print aesthetic: paper/ink/vermilion, halftone fills, mono tabular numerals (`nums`), small-caps labels (`label`), hard-offset hover shadows.
- **Dark mode — "Espresso"**: class-based (`html.dark`, `@custom-variant dark`), same token names re-tinted (roasted-brown stock `#241c15`, cream ink, lifted vermilion/amber/sage for dark legibility). **Three-way switch** (Paper · Auto · Espresso) in both topbars (`src/components/theme-toggle.tsx`): Auto follows `prefers-color-scheme` live via a matchMedia listener; state persists in `localStorage['parakh-theme']` (old 'dark'/'light' values migrate). The pre-paint inline script in the root layout applies the class before first paint; `<html>` carries `suppressHydrationWarning` because that script mutates the class before React hydrates — without it React flags the attribute and strips the theme class. Since every color is a `var(--color-*)`, the whole app flips — no component changes.
- Risk tiers: GREEN < 40 · YELLOW 40–70 · RED > 70 · single accent (vermilion) reserved for evidence/verdicts.
- No chart library: hand-rolled SVG in `src/components/charts.tsx` (non-scaling strokes).
- Icons hand-drawn in `src/components/icons.tsx`; icon names typed via `satisfies`.
- React Compiler on (`reactCompiler: true` in `next.config.ts`); no memoization needed.

## Next-up

- [ ] `git init` + branch `feature/operator` (current build) — isolate citizen additions on their own branch once stable. Only code files tracked; ignore `Ideation/`, PDF/PPT/docx.
- [ ] Reconcile with pitch §5.3 wording (tier thresholds) before PPT round; extend demo script to ~5 min with the citizen walk-off.
- [ ] Optional: replace `/operator/review` state with a shared store (zustand/useReducer) so queue status persists across routes; fine to defer — detail page derives from ledger on reload.
- [ ] Optional: real routes for call analyzer segment replay (waves per flagged timestamp) if judges probe.
- [ ] Delete scaffold boilerplate `public/` SVGs once clean.

## Notes / may change

- Planning docs live in `../../Ideation/Parakh-docs/`: `parakh-explained-simply.md` (story for professors), `Technical-Implementation.md` (Part I product-tech / Part II day-by-day plan), `coercive-call-analyzer.md` (product + technical pipeline for the call transcript), `judge-qa.md` (research-backed Q&A; documents every boundary), `story.md` (the 2:07 narrative), plus `../../Ideation/Goal/feature-set-and-implementation-plan.md` (locked features). The plan ports `mock.ts` verbatim into `backend/seed/seed.json` — mock stays as typed contract + fallback.
- Locked decision: frontend polls `GET /stream` (no WebSocket). `mock.ts` remains the offline fallback if the backend is absent.

- ~16 alert rows live (7 star cases incl. T-1422 persona case + 9 deterministic generated). 14 open, 1 seeded legit (T-1187), 1 fraud (T-3376) for queue body.
- Ticker sequence is a replay script in `mock.ts` — update `TICKER` if the demo script changes.
- Latency numbers (214 ms, 2.8 s) are styling, not implementation.
- `window.print()` on Export emits the newsprint case log (print CSS in globals).