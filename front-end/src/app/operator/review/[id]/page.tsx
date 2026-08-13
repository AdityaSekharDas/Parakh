'use client'

/**
 * The evidence screen. Left: why the engine scored the case — weighted
 * rules, the risk trajectory, the transfer that almost settled.
 * Middle: the coercive-call analyzer (star case only).
 * Right: the citizen's file. Bottom: the analyst's actions and the
 * resolution ledger.
 */

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CALLS, CURRENT_ANALYST, alertById, customerById, TIER_COLOR } from '@/data/mock'
import type { Alert, TaskStatus } from '@/data/mock'
import { Card, Chip, Kicker, Num, RuleRow, StatusPill, TierPill, Avatar } from '@/components/primitives'
import { Sparkline } from '@/components/charts'
import { Icon } from '@/components/icons'

interface LedgerEntry {
  at: string
  text: string
}

const OPEN_STATUSES: TaskStatus[] = ['pending', 'assigned', 'reviewing']

export default function ReviewDetail() {
  const params = useParams<{ id: string }>()
  const alert = alertById(params.id)
  const [status, setStatus] = useState<TaskStatus | null>(alert?.status ?? null)
  const [action, setAction] = useState<null | 'freeze' | 'legit' | 'block'>(null)
  const [ledger, setLedger] = useState<LedgerEntry[]>([
    { at: alert?.generatedAt ?? '', text: 'Auto-flagged · engine verdict scored and held for review' },
  ])
  const [done, setDone] = useState(false)

  if (!alert) {
    return (
      <div className="py-20 text-center">
        <p className="font-mono text-[12px] uppercase tracking-widest text-ink-3">
          Case {params.id} not found in the demo ledger
        </p>
        <Link href="/operator/review" className="mt-4 inline-block border border-ink px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink">
          ← Back to queue
        </Link>
      </div>
    )
  }

  const customer = customerById(alert.customerId)
  const call = alert.callId ? CALLS[alert.callId] : undefined
  const open = status === null || OPEN_STATUSES.includes(status)
  const accent = TIER_COLOR[alert.tier]
  const callMarks = [alert.callAt, alert.txnAt]
    .filter((v): v is number => v !== undefined)
    .map((at) => ({ at, tier: alert.tier }))

  const resolve = (s: TaskStatus, text: string) => {
    setStatus(s)
    setAction(null)
    setLedger((l) => [
      { at: 'now', text: `${text} · by ${CURRENT_ANALYST}` },
      ...l,
    ])
    setDone(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/operator/review"
            className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-ink-3 transition-colors hover:text-ink"
          >
            <Icon name="arrowRight" className="h-3.5 w-3.5 rotate-180" />
            Queue
          </Link>
          <span className="text-ink-3">/</span>
          <span className="nums text-[14px] font-medium text-ink">{alert.id}</span>
          <TierPill score={alert.score} />
          <StatusPill status={status ?? alert.status} />
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-ink-3">
          <span>Generated {alert.generatedAt}</span>
          <span className="border border-rule px-1.5 py-0.5">{alert.confidence}</span>
        </div>
      </div>

      {done && (
        <div className="alert-enter flex items-center justify-between border border-tier-green bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Icon name="check" className="h-4 w-4 text-tier-green" />
            <span className="text-[13px] text-ink">
              Case resolved — {status === 'fraud' ? 'funds were never released; payee frozen' : 'payment cleared; engine logs the decision'}.
            </span>
          </div>
          <Link
            href="/operator/review"
            className="border border-ink bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-paper"
          >
            Back to queue
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Evidence */}
        <section className="lg:col-span-2">
          <Card className="h-full p-5">
            <Kicker className="mb-4">Why {alert.score} · weighted evidence</Kicker>

            <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-2.5 border-b border-rule pb-5">
              <KV k="Amount" v={`₹${alert.amount.toLocaleString('en-IN')}`} big accent={accent} />
              <KV k="Payee" v={alert.payeeName} sub={alert.payee} />
              <KV k="Channel · device" v={alert.channel} sub={alert.device} />
              <KV k="Attempted at" v={alert.hour} sub={`${alert.ageDays === 0 ? 'today' : `${alert.ageDays}d ago`}`} />
            </div>

            <div className="mb-2 flex items-baseline justify-between">
              <Label>Risk trajectory · 20-min window</Label>
              <span className="font-mono text-[9px] text-ink-3">— txn · ┄ call</span>
            </div>
            <Sparkline series={alert.series} color={accent} tierMarks={callMarks} height={64} />

            <p className="mt-4 text-[13px] leading-relaxed text-ink-2">{alert.narrative}</p>

            <div className="mt-5 border-t border-rule pt-4">
              {alert.reasons.map((r) => (
                <RuleRow key={r.label} label={r.label} points={r.points} evidence={r.evidence} accent={accent} />
              ))}
            </div>
          </Card>
        </section>

        {/* Call analyzer */}
        <section className="lg:col-span-2">
          <Card className="flex h-full flex-col p-5">
            <div className="mb-4 flex items-center justify-between">
              <Kicker>Coercive-call analyzer</Kicker>
              {call ? (
                <span className="flex items-center gap-1.5 border border-vermilion px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-vermilion">
                  <span className="pulse-dot size-1.5 rounded-full bg-vermilion" />
                  Coercive · {call.confidence}
                </span>
              ) : (
                <Chip>No call in window</Chip>
              )}
            </div>

            {call ? (
              <>
                <Waveform flaggedLineCount={call.flaggedLines.length} />

                <div className="mt-4 space-y-1.5">
                  {call.transcript.map((line, i) => {
                    const flagged = call.flaggedLines.includes(i)
                    const caller = line.startsWith('Caller')
                    return (
                      <div
                        key={i}
                        className={`flex gap-3 border-l-2 px-2.5 py-1.5 ${
                          flagged
                            ? 'border-vermilion bg-vermilion-2'
                            : 'border-transparent'
                        }`}
                      >
                        <span className="nums w-5 shrink-0 text-[9px] pt-0.5 text-ink-3">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider text-ink-3">
                            {caller ? 'Caller' : 'Citizen'}
                          </div>
                          <p className="text-[12px] leading-relaxed text-ink">{line}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {call.patterns.map((p) => (
                    <Chip key={p} className="border-vermilion/40 text-vermilion">
                      {p}
                    </Chip>
                  ))}
                  <span className="ml-auto font-mono text-[9px] text-ink-3">
                    {call.id} · {Math.floor(call.durationSec / 60)}m {call.durationSec % 60}s · {call.at}
                  </span>
                </div>

                <div className="mt-4 border border-rule bg-paper p-3">
                  <p className="font-mono text-[10px] leading-relaxed text-ink-2">
                    Linkage: call flagged COERCIVE at 14:02 · transfer attempted at 14:06 ·
                    <span className="text-vermilion"> +35 points</span> applied the moment the
                    payee and device checks fired. Four minutes of exposure, zero settlement.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-14 text-center">
                <Icon name="phone" className="h-8 w-8 text-ink-4" />
                <p className="max-w-xs text-[12px] leading-relaxed text-ink-3">
                  No inbound call was detected in the window before this transfer.
                  Scoring here leans on velocity, device, and payee-graph evidence.
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* Customer context */}
        <section className="space-y-6">
          <Card className="p-5">
            <Kicker className="mb-4">Citizen file</Kicker>
            {customer && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar name={customer.name} size={40} />
                  <div>
                    <div className="text-[14px] font-medium text-ink">{customer.name}</div>
                    <div className="font-mono text-[10px] text-ink-3">{customer.id}</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 font-mono text-[11px]">
                  <KV k="Phone" v={customer.phone} />
                  <KV k="Branch" v={customer.bank} />
                  <KV k="Median amount" v={`₹${customer.medianAmount.toLocaleString('en-IN')}`} />
                  <KV k="Typical hours" v={customer.typicalHours} />
                  <KV k="Known devices" v={`${customer.knownDevices}`} />
                  <KV k="Known payees" v={`${customer.knownPayees}`} />
                  <KV k="Typical velocity" v={customer.typicalVelocity} />
                </div>
                <div className="mt-4 border-t border-rule pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Chip className="text-vermilion">payee unseen</Chip>
                    <Chip className="text-vermilion">device new</Chip>
                    <Chip>call in window</Chip>
                  </div>
                </div>
              </>
            )}
          </Card>

          <Card className="p-5">
            <Kicker className="mb-3">Resolution ledger</Kicker>
            <ol className="space-y-2.5">
              {ledger.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span className="nums w-12 shrink-0 pt-px text-[9px] text-ink-3">{e.at}</span>
                  <span className={`text-[11px] leading-snug ${i === 0 ? 'text-ink' : 'text-ink-3'}`}>{e.text}</span>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      </div>

      {/* Actions */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <span className="label mr-2">Actions · {open ? 'transfer is HELD' : 'case closed'}</span>
        {open && action !== 'freeze' && action !== 'legit' && (
          <>
            <button
              onClick={() => setAction('freeze')}
              className="flex items-center gap-2 bg-vermilion px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wider text-paper transition-opacity hover:opacity-85"
            >
              <Icon name="lock" className="h-3.5 w-3.5" />
              Freeze transfer
            </button>
            <button
              onClick={() => setAction('block')}
              className="flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <Icon name="ban" className="h-3.5 w-3.5" />
              Block payee
            </button>
            <button
              onClick={() => setAction('legit')}
              className="border border-rule px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-ink-3 transition-colors hover:border-tier-green hover:text-tier-green"
            >
              Mark legitimate
            </button>
          </>
        )}

        {action === 'freeze' && (
          <div className="alert-enter flex w-full flex-wrap items-center gap-3 border border-vermilion bg-vermilion-2 p-3">
            <Icon name="alert" className="h-4 w-4 text-vermilion" />
            <span className="text-[13px] text-ink">
              Freeze <Num>₹{alert.amount.toLocaleString('en-IN')}</Num> to {alert.payee} and
              flag for the RBI watch-list?
            </span>
            <button
              onClick={() => resolve('fraud', `Funds frozen at ${alert.hour} · before settlement · payee blacklisted`)}
              className="bg-vermilion px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-paper"
            >
              Confirm freeze
            </button>
            <button
              onClick={() => setAction(null)}
              className="border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-3"
            >
              Cancel
            </button>
          </div>
        )}
        {action === 'block' && (
          <div className="alert-enter flex w-full flex-wrap items-center gap-3 border border-ink bg-paper p-3">
            <Icon name="ban" className="h-4 w-4 text-ink" />
            <span className="text-[13px] text-ink">
              Block {alert.payee} across the network? Transfer stays held either way.
            </span>
            <button
              onClick={() => resolve('reviewing', 'Payee blocked network-wide · refund initiated')}
              className="bg-ink px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-paper"
            >
              Confirm block
            </button>
            <button
              onClick={() => setAction(null)}
              className="border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-3"
            >
              Cancel
            </button>
          </div>
        )}
        {action === 'legit' && (
          <div className="alert-enter flex w-full flex-wrap items-center gap-3 border border-tier-green bg-card p-3">
            <Icon name="check" className="h-4 w-4 text-tier-green" />
            <span className="text-[13px] text-ink">
              Release ₹{alert.amount.toLocaleString('en-IN')} and log the reasons as a false positive?
            </span>
            <button
              onClick={() => resolve('legit', 'Released · logged as false positive · engine feedback')}
              className="bg-tier-green px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-paper"
            >
              Confirm release
            </button>
            <button
              onClick={() => setAction(null)}
              className="border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-3"
            >
              Cancel
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

function KV({ k, v, sub, big, accent }: { k: string; v: string; sub?: string; big?: boolean; accent?: string }) {
  return (
    <div>
      <div className="label">{k}</div>
      <div className="mt-0.5">
        <Num className={big ? 'text-[22px] font-medium' : 'text-[12px]'} style={accent ? { color: accent } : undefined}>
          {v}
        </Num>
        {sub && <div className="mt-0.5 truncate font-mono text-[10px] text-ink-3">{sub}</div>}
      </div>
    </div>
  )
}

function Label({ children }: { children: string }) {
  return <span className="label">{children}</span>
}

/* Deterministic waveform — same bars every render, CSS pulse only */
const WAVE_BARS = [42, 58, 31, 66, 24, 71, 38, 55, 19, 63, 45, 72, 28, 59, 33, 67, 22, 48, 64, 30, 56, 39, 70, 26]

function Waveform({ flaggedLineCount }: { flaggedLineCount: number }) {
  return (
    <div>
      <style>{`
        @keyframes wave { 0%,100% { transform: scaleY(0.35);} 50% { transform: scaleY(1);} }
        .wave-bar { animation: wave 1.4s ease-in-out infinite; transform-origin: center; }
      `}</style>
      <div className="flex h-16 items-center gap-[3px]">
        {WAVE_BARS.map((h, i) => {
          const flagged = i < flaggedLineCount * 6
          return (
            <div
              key={i}
              className={`wave-bar flex-1 ${flagged ? 'bg-vermilion' : 'bg-ink-3'}`}
              style={{
                height: `${h}%`,
                animationDelay: `${(i % 8) * 0.18}s`,
                opacity: flagged ? 1 : 0.45,
              }}
            />
          )
        })}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-wider text-ink-3">
        <span>recording · inbound</span>
        <span>flagged segments in vermilion</span>
      </div>
    </div>
  )
}