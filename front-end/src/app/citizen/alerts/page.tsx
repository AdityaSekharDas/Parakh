'use client'

/**
 * Sarita's alert mailbox. Two entries — the intercepted ₹49,500 and the
 * watched ₹3,200. Each explains the evidence in plain language.
 */

import Link from 'next/link'
import { CITIZEN_ALERTS, TIER_COLOR } from '@/data/mock'
import { Card, Kicker, Label, Num, RuleRow } from '@/components/primitives'
import { Icon } from '@/components/icons'

export default function CitizenAlerts() {
  return (
    <div className="space-y-8">
      <header>
        <Kicker>Your alert mailbox</Kicker>
        <h1 className="mt-2 font-display text-[34px] font-bold leading-none tracking-tight text-ink">
          What Parakh watched for you
        </h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-2">
          Two payments were held this week. One attempt was stopped before a rupee moved —
          the other was checked, explained to you, and let through when you said it was yours.
        </p>
      </header>

      <div className="space-y-6">
        {[...CITIZEN_ALERTS].reverse().map((a) => {
          const c = TIER_COLOR[a.tier]
          const blocked = a.score > 70
          return (
            <Card key={a.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="size-3" style={{ background: c }} />
                  <div>
                    <div className="nums text-[13px] font-medium text-ink">{a.id}</div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-3">
                      {a.generatedAt}
                    </div>
                  </div>
                </div>
                <span
                  className={`border px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-widest ${
                    blocked
                      ? 'border-vermilion text-vermilion'
                      : 'border-tier-yellow text-tier-yellow'
                  }`}
                >
                  {blocked ? 'Intercepted · your money never moved' : 'Checked · you decided'}
                </span>
              </div>

              <div className="mt-5 border-y border-rule py-4">
                <p className="text-[15px] leading-relaxed text-ink">
                  {blocked
                    ? 'A man pretending to be a customs officer told you to transfer ₹49,500 to a "safe account". Parakh flagged his call as coercive, then held the transfer 4 minutes later.'
                    : 'You paid ₹3,200 to a plumber you had never paid before. That alone trips a few rules — so Parakh checked everything else about the payment, found nothing wrong, and showed you this card instead of blocking.'}
                </p>
              </div>

              <div className="mt-4">
                <Label>What Parakh weighed</Label>
                <div className="mt-2 grid grid-cols-1 gap-x-8 md:grid-cols-2">
                  {a.reasons.map((r) => (
                    <RuleRow key={r.label} label={r.label} points={r.points} evidence={r.evidence} accent={c} />
                  ))}
                </div>
              </div>

              {blocked && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-tier-green bg-card p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="shield" className="h-5 w-5 text-tier-green" />
                    <div>
                      <div className="text-[13px] font-medium text-ink">Transfer blocked at the bank · 14:06</div>
                      <div className="mt-0.5 font-mono text-[10px] text-ink-3">
                        Funds held before settlement · flagged for the RBI watch-list · no money left your account
                      </div>
                    </div>
                  </div>
                  <Link href="/citizen/pay" className="border border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink">
                    Try the guard yourself
                  </Link>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-ink-3">
        Only payments that look unusual are shown here. The other 40 transactions this
        month settled in under a second without asking you anything.
      </p>
    </div>
  )
}