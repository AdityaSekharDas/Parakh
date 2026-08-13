'use client'

/**
 * Sarita's statement of account. Two rows carry the demo:
 * T-1421 — intercepted before settlement (the digital-arrest case).
 * T-1422 — watched, allowed, human in control.
 */

import Link from 'next/link'
import {
  CITIZEN_BALANCE,
  CITIZEN_TRANSACTIONS,
  CURRENT_CUSTOMER,
} from '@/data/mock'
import { Card, Kicker, Num, TierPill } from '@/components/primitives'
import { Icon } from '@/components/icons'

const STATUS_NOTE = {
  intercepted: {
    label: 'Blocked before settlement',
    chip: 'bg-vermilion text-paper',
  },
  watched: {
    label: 'Completed · watched by Parakh',
    chip: 'bg-paper-2 text-ink-3',
  },
  clear: { label: 'Completed', chip: 'bg-paper-2 text-ink-3' },
  credit: { label: 'Credit', chip: 'bg-paper-2 text-ink-3' },
} as const

export default function CitizenHome() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>{CURRENT_CUSTOMER.name} · {CURRENT_CUSTOMER.id} · SBI</Kicker>
          <h1 className="mt-2 font-display text-[34px] font-bold leading-none tracking-tight text-ink">
            Your account, guarded
          </h1>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-2">
            Every payment is checked by Parakh before it moves. Nothing leaves your
            account until the risk is resolved — by you, not by an algorithm alone.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-tier-green px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-tier-green">
          <Icon name="shield" className="h-4 w-4" />
          Protected since 12 Aug · 14:06
        </div>
      </header>

      {/* Guard summary strip */}
      <div className="grid grid-cols-3 divide-x divide-rule border-y border-rule-hard bg-card">
        <div className="px-5 py-4">
          <div className="label">Balance</div>
          <Num className="mt-1 text-[22px] font-medium text-ink">₹{CITIZEN_BALANCE.toLocaleString('en-IN')}</Num>
        </div>
        <div className="px-5 py-4">
          <div className="label">Intercepted this week</div>
          <Num className="mt-1 text-[22px] font-medium text-vermilion">₹49,500</Num>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">1 attempt · stopped before settlement</div>
        </div>
        <div className="px-5 py-4">
          <div className="label">Payments watched</div>
          <Num className="mt-1 text-[22px] font-medium text-ink">1</Num>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">released — you stayed in control</div>
        </div>
      </div>

      {/* Statement */}
      <section>
        <Kicker className="mb-3">Statement · 12 Aug</Kicker>
        <Card>
          {CITIZEN_TRANSACTIONS.map((t, i) => {
            const note = STATUS_NOTE[t.status]
            const isStar = t.status === 'intercepted' || t.status === 'watched'
            return (
              <div
                key={t.id}
                className={`flex items-center gap-4 border-b border-rule px-4 py-3.5 last:border-b-0 ${
                  isStar ? 'bg-vermilion-2/50' : ''
                }`}
              >
                <div className="w-32 shrink-0">
                  <div className="nums text-[11px] text-ink-2">{t.at}</div>
                  <div className="mt-0.5 font-mono text-[9px] text-ink-3">{t.id}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-ink">{t.to}</div>
                  <div className="truncate font-mono text-[10px] text-ink-3">{t.note}</div>
                </div>
                <Num
                  className={`text-[14px] ${t.amount > 0 ? 'text-tier-green' : 'text-ink'}`}
                >
                  {t.amount > 0 ? '+' : '−'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                </Num>
                <span className={`w-40 shrink-0 px-2 py-1 text-center font-mono text-[9px] uppercase tracking-wider ${note.chip}`}>
                  {note.label}
                </span>
              </div>
            )
          })}
        </Card>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-3">
          Open T-1422's row in the alert screen to see what Parakh watched — and why it let it through.
        </p>
      </section>

      {/* The two-star callout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link href="/citizen/alerts" className="group">
          <Card className="h-full border-vermilion/40 p-5 transition-shadow group-hover:shadow-[3px_3px_0_var(--color-rule)]">
            <div className="flex items-center justify-between">
              <Kicker>The call you never made</Kicker>
              <TierPill score={95} />
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
              A "customs officer" spent 7 minutes on the phone with you. The transfer he
              demanded — ₹49,500 — was frozen at the bank before it could move.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-vermilion">
              Read what Parakh saw
              <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Card>
        </Link>
        <Link href="/citizen/pay" className="group">
          <Card className="h-full p-5 transition-shadow group-hover:shadow-[3px_3px_0_var(--color-rule)]">
            <div className="flex items-center justify-between">
              <Kicker>Test it yourself</Kicker>
              <TierPill score={52} />
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
              Pay ₹3,200 to a new plumber and watch Parakh warn instead of block —
              then decide for yourself. The engine learns either way.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink">
              Make a guarded payment
              <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Card>
        </Link>
      </div>
    </div>
  )
}
