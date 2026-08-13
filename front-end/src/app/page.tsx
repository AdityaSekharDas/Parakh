/**
 * Landing — the newsprint front page. Pitch in three lines, today's wire,
 * and a door into each persona. Also the presenter's backstage map:
 * the numbered strips below each card are exactly the 5-minute demo path.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ANALYTICS, KPI, TICKER, TIER_COLOR } from '@/data/mock'
import { Card, Kicker, Num } from '@/components/primitives'
import { Icon, LogoMark } from '@/components/icons'
import { ThemeSwitch, applyMode, storedMode } from '@/components/theme-toggle'

const PERSONAS = [
  {
    href: '/operator/overview',
    role: 'Operator',
    who: 'Fraud ops · R. Das',
    lines: [
      'Every payment scored before settlement',
      '12 alerts open · engine live · 214 ms median',
      'Open T-1421: the digital-arrest case, end to end',
    ],
    cta: 'Enter command centre',
    accent: 'var(--color-vermilion)',
  },
  {
    href: '/citizen',
    role: 'Citizen',
    who: 'Sarita Verma · C-4421',
    lines: [
      'Your account, guarded — nothing moves unseen',
      '₹49,500 intercepted before it left you',
      'Make a guarded payment and decide for yourself',
    ],
    cta: 'Open your account',
    accent: 'var(--color-tier-green)',
  },
]

const GUARD_STEPS = [
  { n: '01', label: 'Below 40', text: 'settles untouched — rules + forest pass, human out of the loop' },
  { n: '02', label: '40 – 70', text: 'a warning card with weighted evidence — a human or citizen decides' },
  { n: '03', label: 'Above 70', text: 'held before settlement — freeze, block, resolve, learn' },
]

const DEMO_PATH = [
  { n: '01', title: 'Operator — the intercept', href: '/operator/review/T-1421', text: 'call linkage · weighted evidence · freeze flow' },
  { n: '02', title: 'The queue — triage', href: '/operator/review', text: '16 cases, tiers, filters, inline clears' },
  { n: '03', title: 'Citizen — you decide', href: '/citizen/pay', text: '52/100 verdict — continue or stop, the engine learns' },
]

export default function Landing() {
  // Landing is the fresh front door: reset to Auto so it follows the OS
  // preference (default dark when prefers-color-scheme is unavailable).
  // Operator / citizen keep their pinned choice — only this entry point resets.
  useEffect(() => {
    try {
      localStorage.setItem('parakh-theme', 'auto')
      applyMode(storedMode())
    } catch {}
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-rule-hard bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 text-ink">
            <LogoMark className="h-6 w-6" />
            <span className="label">साक्ष्य · evidence, on the ledger before the money moves</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-ink-3">
            <span>SIH-2026 demo</span>
            <span className="hidden md:inline">build v0.1</span>
            <Link href="/operator/overview" className="transition-colors hover:text-ink">
              Skip to app →
            </Link>
            <ThemeSwitch />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14">
        {/* Masthead */}
        <section className="border-b border-rule-hard pb-10">
          <h1
            className="font-display text-[72px] font-bold uppercase leading-[0.85] tracking-[0.06em] text-ink md:text-[110px]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Parakh<span style={{ color: 'var(--color-vermilion)' }}>.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-2">
            Every UPI payment is scored <span className="text-ink">before it settles</span> —
            a rules layer, an Isolation Forest on the payee graph, and a coercive-call
            analyzer, fused into one risk figure the bank acts on and the citizen can read.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-ink-3">
            <span>
              <Num className="text-ink">{KPI.customers}</Num> customers scored
            </span>
            <span>
              <Num className="text-ink">214</Num> ms median verdict
            </span>
            <span>
              <Num className="text-ink">{ANALYTICS.interceptedLakh}</Num> ₹L intercepted · <Num className="text-ink">{ANALYTICS.precision}%</Num> precision
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-3">
          {/* Persona doors */}
          <section className="space-y-6 lg:col-span-2">
            <Kicker>Choose who you are in this story</Kicker>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {PERSONAS.map((p) => (
                <Link key={p.role} href={p.href} className="group flex flex-col">
                  <Card className="flex h-full flex-col p-6 transition-all group-hover:shadow-[4px_4px_0_var(--color-rule-hard)]">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-[26px] font-bold uppercase tracking-wide" style={{ color: p.accent }}>
                        {p.role}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">{p.who}</span>
                    </div>
                    <ul className="mt-5 space-y-2.5 border-t border-rule pt-5">
                      {p.lines.map((l) => (
                        <li key={l} className="flex gap-2.5 text-[13px] leading-snug text-ink-2">
                          <span className="mt-[7px] size-1 shrink-0" style={{ background: p.accent }} />
                          {l}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto flex items-center gap-2 pt-6 font-mono text-[11px] font-medium uppercase tracking-widest text-ink">
                      {p.cta}
                      <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Presenter's backstage map */}
            <Kicker className="pt-2">The 5-minute demo path — works, no mocks</Kicker>
            <div className="space-y-1">
              {DEMO_PATH.map((d) => (
                <Link key={d.n} href={d.href} className="group flex items-baseline gap-4 border-b border-rule px-2 py-2.5 transition-colors last:border-b-0 hover:bg-paper-2">
                  <Num className="text-[11px] text-vermilion">{d.n}</Num>
                  <span className="text-[13px] font-medium text-ink">{d.title}</span>
                  <span className="ml-auto hidden font-mono text-[10px] text-ink-3 sm:inline">{d.text}</span>
                  <Icon name="chevronRight" className="h-3.5 w-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>

          {/* Today's wire + guard rules */}
          <section className="space-y-6">
            <Card className="p-5">
              <Kicker className="mb-4">Today's wire · deterministic</Kicker>
              <div className="space-y-2">
                {TICKER.slice(0, 7).map((e, i) => (
                  <div key={i} className="flex items-start gap-2.5 font-mono text-[11px] leading-snug">
                    <Num className="w-9 shrink-0 pt-px text-[10px] text-ink-3">{e.time}</Num>
                    <span className="mt-[5px] size-1 shrink-0" style={{ background: TIER_COLOR[e.tier] }} />
                    <span className="text-ink-2">{e.text}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <Kicker className="mb-4">How the guard settles</Kicker>
              <div className="space-y-4">
                {GUARD_STEPS.map((s) => (
                  <div key={s.n} className="flex gap-3">
                    <Num className="pt-0.5 text-[10px] text-ink-3">{s.n}</Num>
                    <div>
                      <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink">{s.label}</div>
                      <p className="mt-0.5 text-[12px] leading-snug text-ink-2">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-rule pt-4">
                {['Rules v1.3', 'Isolation Forest', 'Call analyzer'].map((m) => (
                  <span key={m} className="border border-rule px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">
                    {m}
                  </span>
                ))}
              </div>
            </Card>
          </section>
        </div>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 font-mono text-[9px] uppercase tracking-widest text-ink-3">
          <span>PARAKH · साक्ष्य · SIH-2026 demo build</span>
          <span>Deterministic dataset — every screen cross-checks the same ledger</span>
        </div>
      </footer>
    </div>
  )
}