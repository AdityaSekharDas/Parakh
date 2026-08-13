/**
 * Analytics: the case for the judges. Precision/recall, losses vs
 * interception, the funnel, scam types, and the model lifecycle.
 * Static server component — all figures derive from mock.ts.
 */

import { ANALYTICS, KPI } from '@/data/mock'
import { Card, Chip, Kicker } from '@/components/primitives'
import { Funnel, LossTrend, StatCell } from '@/components/charts'

export default function Analytics() {
  const maxScam = Math.max(...ANALYTICS.scamTypes.map((s) => s.amount))
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>Six-week window · demo ledger · 12 Aug</Kicker>
          <h1 className="mt-2 font-display text-[34px] font-bold leading-none tracking-tight text-ink">
            Analytics — interception, not just detection
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-2">
            Every held payment that a human or a citizen confirms is a rupee that never
            left the network. These are the numbers the settlement guard is measured by.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Chip>{ANALYTICS.model.version}</Chip>
          <Chip className="border-tier-green text-tier-green">trained {ANALYTICS.model.retrained}</Chip>
        </div>
      </header>

      <div className="grid grid-cols-2 divide-x divide-rule border-y border-rule-hard bg-card md:grid-cols-4">
        <div className="px-5 py-4">
          <StatCell label="Precision" value={`${ANALYTICS.precision}%`} />
        </div>
        <div className="px-5 py-4">
          <StatCell label="Recall" value={`${ANALYTICS.recall}%`} />
        </div>
        <div className="px-5 py-4">
          <StatCell label="Cases actioned" value={`${ANALYTICS.actioned}/${ANALYTICS.actionedOf}`} />
        </div>
        <div className="px-5 py-4">
          <StatCell label="Review cost saved" value={String(ANALYTICS.reviewCostSavedLakh)} unit="₹L" accent="var(--color-vermilion)" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <Kicker className="mb-4">Losses vs interception · ₹ lakh</Kicker>
          <LossTrend data={ANALYTICS.lossTrend} />
          <p className="mt-4 border-t border-rule pt-3 font-mono text-[10px] leading-relaxed text-ink-3">
            Intercepted rose 1.2 → 14.7 while realized losses fell 52.1 → 39.9.
            The guard pays for its latency in the first month.
          </p>
        </Card>

        <Card className="p-5">
          <Kicker className="mb-4">Where the fraud hides · confirmed ₹ lakh</Kicker>
          <div className="space-y-3">
            {ANALYTICS.scamTypes.map((s) => (
              <div key={s.type}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-[12px] text-ink">{s.type}</span>
                  <span className="nums text-[12px] text-ink">
                    ₹{s.amount}L <span className="text-ink-3">· {s.confirmed} confirmed</span>
                  </span>
                </div>
                <div className="h-3 w-full bg-rule">
                  <div
                    className="h-full"
                    style={{
                      width: `${(s.amount / maxScam) * 100}%`,
                      background: s.type.startsWith('Digital') ? 'var(--color-vermilion)' : 'var(--color-ink)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-rule pt-3 font-mono text-[10px] leading-relaxed text-ink-3">
            Digital-arrest coercion is the largest bucket and the only one the call
            analyzer sees — which is why it is wired in the demo end-to-end.
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <Kicker className="mb-4">The funnel · last 30 days</Kicker>
        <Funnel data={ANALYTICS.funnel} />
        <p className="mt-4 border-t border-rule pt-3 font-mono text-[10px] leading-relaxed text-ink-3">
          2.4L payments scored before settlement · 86 auto-flagged · 54 needed a human ·
          23.4 ₹L confirmed and intercepted. The rest were released — false positives cost
          a second of latency, not a rupee.
        </p>
      </Card>

      <Card className="p-5">
        <Kicker className="mb-4">Model lifecycle</Kicker>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            ['Version', ANALYTICS.model.version],
            ['Retrained', ANALYTICS.model.retrained],
            ['Next retrain', ANALYTICS.model.nextRetrain],
            ['Training set', `${ANALYTICS.model.trainingTxns} txns`],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="label">{k}</div>
              <div className="nums mt-1 text-[13px] text-ink">{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-rule pt-3 font-mono text-[10px] leading-relaxed text-ink-3">
          Deterministic demo figures — they do not change between screens. Cross-checks:
          average risk {KPI.avgScore}/100, cohort 500, precision/recall as shown above.
        </p>
      </Card>
    </div>
  )
}
