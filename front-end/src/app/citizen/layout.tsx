import Link from 'next/link'
import { LogoMark } from '@/components/icons'
import { Avatar, Num } from '@/components/primitives'
import { ThemeSwitch } from '@/components/theme-toggle'
import { CURRENT_CUSTOMER, CITIZEN_BALANCE, CITIZEN_ALERTS } from '@/data/mock'

/** Citizen app shell — Sarita's own view of Parakh. */
export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-rule-hard bg-paper">
        <div className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-3">
          <Link href="/citizen" className="flex items-center gap-2.5 text-ink">
            <LogoMark className="h-5 w-5" />
            <span className="font-display text-[18px] font-bold uppercase tracking-[0.18em]">
              Parakh<span style={{ color: 'var(--color-vermilion)' }}>.</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {(
              [
                { href: '/citizen', label: 'Transactions', dot: 0 },
                { href: '/citizen/alerts', label: 'Alerts', dot: CITIZEN_ALERTS.filter((a) => a.status === 'pending' || a.status === 'assigned' || a.status === 'reviewing').length },
                { href: '/citizen/pay', label: 'Make payment', dot: 0 },
              ] as Array<{ href: string; label: string; dot: number }>
            ).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
              >
                {n.label}
                {n.dot > 0 && (
                  <span className="bg-vermilion px-1 font-mono text-[9px] font-medium text-paper">{n.dot}</span>
                )}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <div className="label">Balance</div>
              <Num className="text-[15px] font-medium text-ink">
                ₹{CITIZEN_BALANCE.toLocaleString('en-IN')}
              </Num>
            </div>
            <div className="flex items-center gap-2 border-l border-rule pl-4">
              <Avatar name={CURRENT_CUSTOMER.name} size={30} />
              <div>
                <div className="text-[12px] leading-none text-ink">{CURRENT_CUSTOMER.name}</div>
                <div className="mt-0.5 font-mono text-[9px] text-ink-3">{CURRENT_CUSTOMER.id}</div>
              </div>
            </div>
            <Link
              href="/operator/overview"
              className="flex items-center gap-1.5 border border-rule px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-3 transition-colors hover:border-ink hover:text-ink"
            >
              Operator view
            </Link>
            <ThemeSwitch />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>

      <footer className="mx-auto mt-12 max-w-4xl border-t border-rule px-6 py-4">
        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-ink-3">
          <span>Your money is guarded by PARAKH before it moves</span>
          <span>Call 1930 · cybercrime helpline</span>
        </div>
      </footer>
    </div>
  )
}
