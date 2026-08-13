'use client'

/**
 * Review queue: every open alert is a task. Analysts assign, mark flag
 * cases for the evidence screen, or clear legitimate ones inline.
 * State lives here; the detail route re-derives the same alert from mock.ts.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ALERTS,
  ANALYSTS,
  CURRENT_ANALYST,
  TIER_COLOR,
  type Alert,
  type TaskStatus,
} from '@/data/mock'
import { Card, Kicker, Num, StatusPill, TierPill } from '@/components/primitives'
import { Icon } from '@/components/icons'

type Filter = 'open' | TaskStatus

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'reviewing', label: 'In review' },
  { key: 'fraud', label: 'Fraud' },
  { key: 'legit', label: 'Legitimate' },
]

export default function ReviewQueue() {
  const [tasks, setTasks] = useState<Alert[]>(ALERTS)
  const [filter, setFilter] = useState<Filter>('open')
  const [note, setNote] = useState('')

  const counts = useMemo(() => {
    const c: Record<string, number> = { open: 0 }
    for (const t of tasks) {
      c[t.status] = (c[t.status] ?? 0) + 1
      if (t.status === 'pending' || t.status === 'assigned' || t.status === 'reviewing') c.open++
    }
    return c
  }, [tasks])

  const visible = tasks.filter((t) =>
    filter === 'open'
      ? t.status === 'pending' || t.status === 'assigned' || t.status === 'reviewing'
      : t.status === filter,
  )

  const mark = (id: string, patch: Partial<Alert>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const assign = (id: string) => {
    const idx = tasks.findIndex((t) => t.id === id)
    const analyst = ANALYSTS[(idx + ANALYSTS.indexOf(CURRENT_ANALYST)) % ANALYSTS.length]
    mark(id, { assignee: analyst, status: 'assigned', resolution: undefined })
  }

  const clearLegit = (id: string) =>
    mark(id, {
      status: 'legit',
      assignee: CURRENT_ANALYST,
      resolution: `Marked legitimate by ${CURRENT_ANALYST} · just now · cleared`,
    })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>Fraud ops · analyst {CURRENT_ANALYST}</Kicker>
          <h1 className="mt-2 font-display text-[34px] font-bold leading-none tracking-tight text-ink">
            Review queue
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-rule text-ink-3 hover:border-ink hover:text-ink'
                }`}
              >
                {f.label}
                <Num className="ml-1.5 opacity-70">{counts[f.key] ?? 0}</Num>
              </button>
            )
          })}
        </div>
      </header>

      {note && (
        <div className="border border-vermilion bg-vermilion-2 px-3 py-2 font-mono text-[11px] text-ink">
          {note}
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-rule-hard">
                {['Case', 'Customer', 'Payee', 'Amount', 'Score', 'Age', 'Decision'].map((h) => (
                  <th key={h} className="label px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => {
                const resolved = a.status === 'fraud' || a.status === 'legit'
                const c = TIER_COLOR[a.tier]
                return (
                  <tr key={a.id} className={`border-b border-rule last:border-b-0 ${resolved ? 'opacity-55' : ''}`}>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className="size-2" style={{ background: c }} />
                        <span className="nums text-[11px] font-medium text-ink">{a.id}</span>
                      </div>
                      <div className="mt-1">
                        <StatusPill status={a.status} />
                      </div>
                      {a.assignee && (
                        <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-ink-3">
                          → {a.assignee}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-[12px] text-ink">{a.customerName}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-ink-3">{a.customerId}</div>
                    </td>
                    <td className="max-w-[180px] px-4 py-3 align-top">
                      <div className="truncate text-[12px] text-ink">{a.payeeName}</div>
                      <div className="mt-0.5 truncate font-mono text-[10px] text-ink-3">{a.payee}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Num className="text-[13px] text-ink">₹{a.amount.toLocaleString('en-IN')}</Num>
                      <div className="mt-0.5 font-mono text-[10px] text-ink-3">{a.channel}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <TierPill score={a.score} />
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-[11px] text-ink-2">
                      {a.ageDays === 0 ? 'today' : `${a.ageDays}d`}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col items-start gap-1.5">
                        <Link
                          href={`/operator/review/${a.id}`}
                          className="flex items-center gap-1 border border-ink bg-ink px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-paper transition-opacity hover:opacity-80"
                        >
                          Review
                          <Icon name="chevronRight" className="h-3 w-3" />
                        </Link>
                        {!resolved && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() =>
                                a.status === 'assigned'
                                  ? setNote(`${a.id}: already with ${a.assignee}`)
                                  : assign(a.id)
                              }
                              className="border border-rule px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-ink-3 transition-colors hover:border-ink hover:text-ink"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => clearLegit(a.id)}
                              className="border border-rule px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-ink-3 transition-colors hover:border-tier-green hover:text-tier-green"
                            >
                              Mark legit
                            </button>
                          </div>
                        )}
                      </div>
                      {a.resolution && (
                        <div className="mt-1.5 max-w-[220px] font-mono text-[9px] leading-snug text-ink-3">
                          {a.resolution}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="font-mono text-[10px] text-ink-3">
        Score pill cross-checks the tier rule: GREEN &lt; 40 · YELLOW 40–70 · RED &gt; 70.
        Confirming fraud opens the evidence screen — that is the demo path for T-1421.
      </p>
    </div>
  )
}