/**
 * Print-press primitives: pills, bars, avatars, rule rows.
 * Tints are built with color-mix so the tier palette stays single-source.
 */

import type { ReactNode } from 'react'
import {
  TIER_COLOR,
  TIER_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  tierOf,
  type TaskStatus,
} from '@/data/mock'

/* Small caps label — the instrument's unit labels */
export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`label ${className}`}>{children}</span>
}

/* Mono tabular numeral — every figure aligns in columns */
export function Num({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span className={`nums ${className}`} style={style}>
      {children}
    </span>
  )
}

/* Small-caps section head with a printed rule */
export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="h-px w-4 bg-ink-3" />
      <span className="label">{children}</span>
    </div>
  )
}

/* Tiered risk pill: dot + label + score, tinted by tier */
export function TierPill({ score, className = '' }: { score: number; className?: string }) {
  const tier = tierOf(score)
  const c = TIER_COLOR[tier]
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[11px] tracking-wide ${className}`}
      style={{
        color: c,
        borderColor: `color-mix(in srgb, ${c} 45%, transparent)`,
        background: `color-mix(in srgb, ${c} 8%, transparent)`,
      }}
    >
      <span className="size-1.5" style={{ background: c }} />
      <span className="uppercase">{TIER_LABEL[tier]}</span>
      <span className="nums opacity-70">{score}</span>
    </span>
  )
}

/* Workflow status pill: pending → assigned → reviewing → resolved */
export function StatusPill({ status, className = '' }: { status: TaskStatus; className?: string }) {
  const c = STATUS_COLOR[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${className}`}
      style={{ color: c }}
    >
      <span className="size-1 rounded-full" style={{ background: c }} />
      {STATUS_LABEL[status]}
    </span>
  )
}

/* Initials avatar — circle on paper */
export function Avatar({
  name,
  size = 28,
  className = '',
}: {
  name: string
  size?: number
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-ink text-paper ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      <span className="nums">{initials}</span>
    </span>
  )
}

/* Small mono chip for tags (call patterns, model info) */
export function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`border border-rule px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-3 ${className}`}
    >
      {children}
    </span>
  )
}

/* Card — newsprint sheet */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`border border-rule bg-card ${className}`}>{children}</div>
}

/* Weighted evidence row: label + points, bar scaled to 40 pts */
export function RuleRow({
  label,
  points,
  evidence,
  accent = 'var(--color-ink-2)',
}: {
  label: string
  points: number
  evidence: string
  accent?: string
}) {
  return (
    <div className="group py-2.5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] leading-tight text-ink">{label}</span>
        <span className="nums text-[12px]" style={{ color: accent }}>
          +{points}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <div className="h-[3px] w-full bg-rule">
          <div
            className="h-full"
            style={{ width: `${Math.min(100, (points / 40) * 100)}%`, background: accent }}
          />
        </div>
      </div>
      <div className="mt-1 font-mono text-[10px] leading-tight text-ink-3">{evidence}</div>
    </div>
  )
}

/* Hard-offset shadow for hoverable cards — paper registry vibe */
export function pressable(className = '') {
  return `transition-shadow hover:shadow-[3px_3px_0_var(--color-rule)] ${className}`
}
