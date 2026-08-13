'use client'

/**
 * Operator command-centre shell: brand row, nav with inline active state,
 * analyst identity, persona switch, and the live-settlement ticker.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, LogoMark } from '@/components/icons'
import { Avatar } from '@/components/primitives'
import { ThemeSwitch } from '@/components/theme-toggle'
import { CURRENT_ANALYST, TICKER, TIER_COLOR } from '@/data/mock'

const NAV = [
  { href: '/operator/overview', label: 'Overview' },
  { href: '/operator/review', label: 'Review queue' },
  { href: '/operator/analytics', label: 'Analytics' },
]

export function OperatorTopBar() {
  const path = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b border-rule-hard bg-paper">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-3">
        <Link href="/operator/overview" className="flex items-center gap-2.5 text-ink">
          <LogoMark className="h-6 w-6" />
          <span
            className="font-display text-[20px] font-bold uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Parakh<span style={{ color: 'var(--color-vermilion)' }}>.</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((n) => {
            const active = path === n.href || (n.href === '/operator/review' && path.startsWith('/operator/review/'))
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  active ? 'bg-ink text-paper' : 'text-ink-3 hover:bg-paper-2 hover:text-ink'
                }`}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-tier-green md:flex">
            <span className="pulse-dot size-1.5 rounded-full bg-tier-green" />
            Engine live
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-wider text-ink-3 lg:block">
            Fraud ops · Bhubaneswar
          </span>
          <div className="flex items-center gap-2">
            <Avatar name={CURRENT_ANALYST} size={30} />
            <span className="font-mono text-[11px] text-ink">{CURRENT_ANALYST}</span>
          </div>
          <Link
            href="/citizen"
            className="flex items-center gap-1.5 border border-rule px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-3 transition-colors hover:border-ink hover:text-ink"
          >
            <Icon name="users" className="h-3.5 w-3.5" />
            View as citizen
          </Link>
          <ThemeSwitch />
        </div>
      </div>

      <Ticker />
    </header>
  )
}

/* Scrolling settlement feed — two copies for a seamless marquee */
function Ticker() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="overflow-hidden border-t border-rule bg-paper-2">
      <div className="ticker-track flex w-max items-center gap-10 py-1.5 pl-6">
        {items.map((e, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2 font-mono text-[10px] text-ink-3">
            <span className="nums text-ink-2">{e.time}</span>
            <span className="size-1" style={{ background: TIER_COLOR[e.tier] }} />
            <span className="whitespace-nowrap">{e.text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}