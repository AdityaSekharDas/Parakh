import { OperatorTopBar } from '@/components/operator/topbar'

/** Operator command-centre shell: nav, ticker, and the print footnote. */
export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <OperatorTopBar />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      <footer className="mx-auto mt-16 max-w-7xl border-t border-rule px-6 py-4">
        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-ink-3">
          <span>PARAKH · साक्ष्य · SIH-2026 demo build</span>
          <span>Deterministic dataset — every screen cross-checks against the same ledger</span>
        </div>
      </footer>
    </div>
  )
}
