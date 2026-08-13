'use client'

/**
 * Command centre: KPIs, the live alert feed, risk distribution, the most
 * at-risk customers, and the model card. Everything reads mock.ts.
 */

import Link from 'next/link'
import {
  ACTIVE_ALERTS,
  ALERTS,
  ANALYTICS,
  COHORT,
  KPI,
  SCORE_HISTOGRAM,
  SCRIPTED_ALERTS,
  TIER_COLOR,
  tierOf,
} from '@/data/mock'
import { Card, Kicker, Label, Num, StatusPill, TierPill } from '@/components/primitives'
import { Histogram, StatCell } from '@/components/charts'
import { Icon } from '@/components/icons'

const NEW_IDS = new Set(SCRIPTED_ALERTS.map((s) => s.id))

export default function Overview() {
  const ranked = [...COHORT].sort((a, b) => b.score - a.score).slice(0, 5)
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>Fraud command centre · 12 Aug 2026 · 14:09 IST</Kicker>
          <h1 className="mt-2 font-display text-[40px] font-bold leading-none tracking-tight text-ink">
            Every payment, scored{' '}
            <span style={{ color: 'var(--color-vermilion)' }}>before</span> it settles
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-2">
            PARAKH fuses a rules layer, an Isolation Forest on the payee graph, and a
            coercive-call analyzer. Risk below 40 settles untouched — anything above is
            held until a human or a citizen decides.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 border border-rule bg-card px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-2 transition-colors hover:border-ink hover:text-ink"
          >
            <Icon name="file" className="h-3.5 w-3.5" />
            Export case log
          </button>
          <span className="flex items-center gap-2 border border-tier-green px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-tier-green">
            <span className="pulse-dot size-1.5 rounded-full bg-tier-green" />
            Engine live
          </span>
        </div>
      </header>

      {/* KPI strip — a printed ledger line */}
      <div className="grid grid-cols-2 divide-x divide-rule border-y border-rule-hard bg-card md:grid-cols-5">
        <div className="px-5 py-4">
          <StatCell label="Customers on file" value={String(KPI.customers)} />
        </div>
        <div className="px-5 py-4">
          <StatCell label="Active alerts" value={String(ACTIVE_ALERTS.length)} accent="var(--color-vermilion)" />
        </div>
        <div className="px-5 py-4">
          <StatCell label="Avg risk score" value={String(KPI.avgScore)} unit="/100" />
        </div>
        <div className="px-5 py-4">
          <StatCell label="Intercepted" value={String(KPI.interceptedLakh)} unit="₹L" />
        </div>
        <div className="px-5 py-4">
          <StatCell label="Precision · Recall" value={`${KPI.precision}% · ${KPI.recall}%`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live alerts feed */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <Kicker>
              Live alerts · {ALERTS.filter((a) => a.status !== 'fraud' && a.status !== 'legit').length} open
            </Kicker>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
              auto-scored · 214 ms
            </span>
          </div>
          <Card>
            {ALERTS.map((a) => {
              const isNew = NEW_IDS.has(a.id)
              const resolved = a.status === 'fraud' || a.status === 'legit'
              const c = TIER_COLOR[a.tier]
              return (
                <Link
                  key={a.id}
                  href={`/operator/review/${a.id}`}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-rule px-4 py-3 transition-colors last:border-b-0 hover:bg-paper-2 ${
                    isNew ? 'alert-enter' : ''
                  } ${resolved ? 'opacity-55' : ''}`}
                >
                  <span className="size-2.5" style={{ background: c }} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="nums text-[11px] font-medium text-ink">{a.id}</span>
                      {isNew && (
                        <span className="bg-vermilion px-1 py-0.5 font-mono text-[8px] font-medium uppercase tracking-widest text-paper">
                          New
                        </span>
                      )}
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
                        {a.customerName} · {a.ageDays === 0 ? 'today' : `${a.ageDays}d ago`}
                      </span>
                      {resolved && <StatusPill status={a.status} />}
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-ink-2">{a.reason}</p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-ink-3">
                      {a.payee} · {a.channel} · {a.hour}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="nums text-[15px] font-medium leading-none text-ink">
                        ₹{a.amount.toLocaleString('en-IN')}
                      </div>
                      <TierPill score={a.score} className="mt-1.5" />
                    </div>
                    <Icon name="chevronRight" className="h-4 w-4 text-ink-3" />
                  </div>
                </Link>
              )
            })}
          </Card>
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-3">
            T-1421 → T-1187 → T-2903 are scripted for the demo: call linkage, velocity,
            and a refund-spike cluster respectively. All values are deterministic.
          </p>
        </section>

        {/* Right rail */}
        <div className="space-y-6">
          <Card className="p-4">
            <Kicker className="mb-4">Risk distribution</Kicker>
            <Histogram data={SCORE_HISTOGRAM} />
          </Card>

          <Card className="p-4">
            <Kicker className="mb-4">Most at risk now</Kicker>
            <div className="space-y-3">
              {ranked.map((c, i) => {
                const t = tierOf(c.score)
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <Num className="w-4 text-[10px] text-ink-3">{i + 1}</Num>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[12px] text-ink">{c.name}</span>
                        <Num className="text-[11px]" style={{ color: TIER_COLOR[t] }}>
                          {c.score}
                        </Num>
                      </div>
                      <div className="mt-1 h-[3px] w-full bg-rule">
                        <div className="h-full" style={{ width: `${c.score}%`, background: TIER_COLOR[t] }} />
                      </div>
                      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">
                        {c.id} · {c.bank}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-4">
            <Kicker className="mb-4">Model on duty</Kicker>
            <div className="space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-ink-3">Version</span>
                <span className="nums text-ink">{ANALYTICS.model.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3">Retrained</span>
                <span className="nums text-ink">{ANALYTICS.model.retrained}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3">Training set</span>
                <span className="nums text-ink">{ANALYTICS.model.trainingTxns} txns</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3">Next retrain</span>
                <span className="nums text-ink">{ANALYTICS.model.nextRetrain}</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="border border-rule px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">
                Rules v1.3
              </span>
              <span className="border border-rule px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">
                Isolation Forest
              </span>
              <span className="border border-rule px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">
                Call analyzer
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
