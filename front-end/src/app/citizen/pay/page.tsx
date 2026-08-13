'use client'

/**
 * The guard in action. Sarita sends ₹3,200 to a new plumber. Parakh
 * checks it in ~2 seconds, shows the verdict with its evidence, and lets
 * HER decide: continue or stop. The engine learns either way.
 */

import { useEffect, useRef, useState } from 'react'
import { Card, Kicker, Num } from '@/components/primitives'
import { Icon } from '@/components/icons'

type Step = 'compose' | 'checking' | 'verdict' | 'done' | 'stopped'

const CHECKS = [
  'Handshake with risk engine · 214 ms',
  'Rules v1.3 · velocity · hours · amount',
  'Payee graph · Isolation Forest pass',
  'Call analyzer · no call in window',
]

const VERDICT_REASONS = [
  { label: 'You have never paid this payee before', points: '+20', evidence: 'rafiq-plumbing@icici · first transaction' },
  { label: 'Payee-network anomaly · weak signal', points: '+17', evidence: 'Isolation Forest · low confidence' },
  { label: 'Amount is 1.6× your usual', points: '+10', evidence: '₹3,200 vs your median ₹2,050' },
  { label: 'You usually pay after 12:00', points: '+5', evidence: 'this payment is at 10:12' },
]

export default function PayFlow() {
  const [step, setStep] = useState<Step>('compose')
  const [checked, setChecked] = useState(0)
  const [payee, setPayee] = useState('Rafiq Plumbing · rafiq-plumbing@icici')
  const [amount, setAmount] = useState('3,200')
  const [note, setNote] = useState('plumber · new payee')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const send = () => {
    setStep('checking')
    setChecked(0)
    ;[1, 2, 3, 4].forEach((i, idx) => {
      timers.current.push(setTimeout(() => setChecked(i), 450 * (idx + 1)))
    })
    timers.current.push(setTimeout(() => setStep('verdict'), 2000))
  }

  const proceed = (decision: 'continue' | 'stop') => setStep(decision === 'continue' ? 'done' : 'stopped')

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <Kicker>Guarded payment</Kicker>
        <h1 className="mt-2 font-display text-[34px] font-bold leading-none tracking-tight text-ink">
          Pay someone new
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
          This is the payment Parakh watched last time. Send it again and watch the guard
          work — it warns, it never decides for you.
        </p>
      </header>

      {step === 'compose' && (
        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="space-y-5"
          >
            <Field label="Pay to">
              <input
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                className="w-full bg-paper px-3 py-2.5 font-mono text-[13px] text-ink outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Amount ₹">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="nums w-full bg-paper px-3 py-2.5 text-[16px] font-medium text-ink outline-none"
                />
              </Field>
              <Field label="Note">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-paper px-3 py-2.5 font-mono text-[13px] text-ink outline-none"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between border-t border-rule pt-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
                New payee · checked in ~2 s before it moves
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 bg-ink px-5 py-3 font-mono text-[12px] font-medium uppercase tracking-wider text-paper transition-opacity hover:opacity-85"
              >
                Send ₹{amount}
                <Icon name="arrowRight" className="h-4 w-4" />
              </button>
            </div>
          </form>
        </Card>
      )}

      {step === 'checking' && (
        <Card className="border-ink p-8">
          <div className="flex items-center gap-3">
            <span className="pulse-dot size-2.5 rounded-full bg-vermilion" />
            <span className="font-mono text-[12px] uppercase tracking-widest text-ink">
              Parakh is checking this payment…
            </span>
          </div>
          <div className="mt-6 space-y-2.5">
            {CHECKS.map((c, i) => (
              <div
                key={c}
                className={`flex items-center gap-3 font-mono text-[11px] transition-opacity duration-300 ${
                  i < checked ? 'opacity-100' : 'opacity-25'
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center ${
                    i < checked ? 'bg-tier-green text-paper' : 'border border-rule'
                  }`}
                >
                  {i < checked && <Icon name="check" className="h-3 w-3" />}
                </span>
                <span className={i < checked ? 'text-ink' : 'text-ink-3'}>{c}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {step === 'verdict' && (
        <>
          <Card className="border-tier-yellow p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-[20px] font-bold uppercase tracking-wide text-tier-yellow">
                  This payment looks unusual
                </div>
                <p className="mt-1 text-[12px] text-ink-2">
                  Risk 52 / 100 · YELLOW — above the auto-settle line, below the freeze line.
                  The transfer is on hold. Only you can release it.
                </p>
              </div>
              <span className="border border-tier-yellow px-3 py-2 font-mono text-[12px] font-medium text-tier-yellow">
                <Num>52</Num> / 100
              </span>
            </div>

            <div className="mt-5 border-t border-rule pt-4">
              <div className="label mb-2">Why it was held · weighted evidence</div>
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                {VERDICT_REASONS.map((r) => (
                  <div key={r.label} className="py-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[12px] leading-tight text-ink">{r.label}</span>
                      <span className="nums text-[12px] text-tier-yellow">{r.points}</span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-ink-3">{r.evidence}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-rule pt-4">
              <p className="text-[12px] leading-relaxed text-ink-2">
                Nothing is wrong by itself — new payees and larger amounts happen. That is
                exactly why this stays a question <em>for you</em>, not a decision made for you.
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => proceed('continue')}
              className="flex items-center justify-center gap-2 bg-tier-green px-5 py-4 font-mono text-[12px] font-medium uppercase tracking-wider text-paper transition-opacity hover:opacity-85"
            >
              <Icon name="check" className="h-4 w-4" />
              This is mine — continue
            </button>
            <button
              onClick={() => proceed('stop')}
              className="flex items-center justify-center gap-2 border border-vermilion px-5 py-4 font-mono text-[12px] font-medium uppercase tracking-wider text-vermilion transition-colors hover:bg-vermilion hover:text-paper"
            >
              <Icon name="x" className="h-4 w-4" />
              Not mine — stop it
            </button>
          </div>
        </>
      )}

      {step === 'done' && (
        <Card className="border-tier-green p-8 text-center">
          <Icon name="check" className="mx-auto h-10 w-10 text-tier-green" />
          <h2 className="mt-4 font-display text-[26px] font-bold text-ink">Payment completed</h2>
          <p className="mt-2 text-[13px] text-ink-2">
            ₹{amount} sent to {payee} · settled in 2.8 s · guarded start to finish.
          </p>
          <div className="mx-auto mt-5 max-w-sm border border-rule bg-paper p-4 text-left">
            <div className="label mb-2">What just happened</div>
            <ol className="space-y-1.5 font-mono text-[10px] leading-relaxed text-ink-2">
              <li>1 · Parakh held the transfer at 52/100</li>
              <li>2 · You confirmed it was yours</li>
              <li>3 · Payment released · engine logged the decision</li>
              <li>4 · Your "yes" teaches the model your normal</li>
            </ol>
          </div>
          <p className="mt-4 font-mono text-[10px] text-ink-3">
            The human decides. The machine learns. That is the whole deal.
          </p>
        </Card>
      )}

      {step === 'stopped' && (
        <Card className="border-vermilion p-8 text-center">
          <Icon name="shield" className="mx-auto h-10 w-10 text-vermilion" />
          <h2 className="mt-4 font-display text-[26px] font-bold text-ink">Transfer stopped</h2>
          <p className="mt-2 text-[13px] text-ink-2">
            Nothing moved. The hold is released back to your balance and the payee is
            flagged for the fraud desk.
          </p>
          <div className="mx-auto mt-5 max-w-sm border border-rule bg-paper p-4 text-left">
            <div className="label mb-2">Guard log</div>
            <ol className="space-y-1.5 font-mono text-[10px] leading-relaxed text-ink-2">
              <li>1 · Held at 52/100 · warning card shown</li>
              <li>2 · You reported it · hold cancelled</li>
              <li>3 · Payee sent to the watch-list · 214 ms</li>
            </ol>
          </div>
        </Card>
      )}

      {step !== 'compose' && step !== 'checking' && (
        <div className="flex justify-center">
          <button
            onClick={() => setStep('compose')}
            className="border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-3 transition-colors hover:border-ink hover:text-ink"
          >
            ← Make another payment
          </button>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1.5 border border-rule bg-card focus-within:border-ink">{children}</div>
    </label>
  )
}
