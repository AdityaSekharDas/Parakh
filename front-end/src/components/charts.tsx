/**
 * Hand-rolled SVG charts — no chart library, no canvas, nothing to break.
 * Everything is deterministic data from the mock universe.
 */

import { TIER_COLOR, type Tier } from '@/data/mock'
import { Label, Num } from '@/components/primitives'

/* Risk trajectory across a 20-minute window; the txn and call moments
 * are marked with ticks. Non-scaling strokes keep lines hairline. */
export function Sparkline({
  series,
  color,
  tierMarks,
  width = '100%',
  height = 56,
}: {
  series: number[]
  color: string
  tierMarks?: Array<{ at: number; tier: Tier }>
  width?: string | number
  height?: number
}) {
  const n = series.length - 1
  const x = (i: number) => (i / n) * 100
  const y = (v: number) => 27 - (v / 100) * 24
  const line = series.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')
  const area = `${line} L100,30 L0,30 Z`
  const last = series[series.length - 1]
  return (
    <svg viewBox="0 0 100 30" width={width} height={height} preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={color} opacity="0.12" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={x(n)}
        cy={y(last)}
        r="3"
        fill={color}
        stroke="var(--color-paper)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      {/* grid ticks at 0 / 50 / 100 */}
      <path d="M0,3 L100,3 M0,15 L100,15 M0,27 L100,27" stroke="var(--color-rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      {tierMarks?.map((m, i) => (
        <path
          key={i}
          d={`M${x(m.at).toFixed(2)},3 L${x(m.at).toFixed(2)},30`}
          stroke={TIER_COLOR[m.tier]}
          strokeWidth="1.5"
          strokeDasharray="3 2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

/* Risk distribution across the whole cohort, colored by tier */
export function Histogram({
  data,
  height = 110,
}: {
  data: Array<{ bucket: string; count: number; tier: Tier }>
  height?: number
}) {
  const max = Math.max(...data.map((d) => d.count))
  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((d) => {
          const h = Math.max(3, (d.count / max) * height)
          const silent = d.tier === 'green'
          return (
            <div
              key={d.bucket}
              className="group relative flex-1"
              title={`${d.bucket} · ${d.count} customers`}
            >
              <div
                className="w-full transition-all"
                style={{
                  height: h,
                  background: silent ? 'var(--color-ink-4)' : TIER_COLOR[d.tier],
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-[3px]">
        {data.map((d) => (
          <span key={d.bucket} className="nums flex-1 text-center text-[8px] text-ink-3">
            {d.bucket.split('–')[0]}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="label">Risk score · all customers</span>
        <span className="font-mono text-[9px] text-ink-3">0 → 100 RED</span>
      </div>
    </div>
  )
}

/* Losses vs intercepted, Mar–Aug. Losses fall, interception rises. */
export function LossTrend({
  data,
  height = 130,
}: {
  data: Array<{ month: string; losses: number; intercepted: number }>
  height?: number
}) {
  const max = Math.max(...data.map((d) => Math.max(d.losses, d.intercepted))) * 1.15
  return (
    <div>
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((d) => {
          const lh = (d.losses / max) * height
          const ih = (d.intercepted / max) * height
          return (
            <div key={d.month} className="flex flex-1 flex-col items-center justify-end gap-0.5">
              <span className="nums text-[8px] text-ink-3">{d.losses.toFixed(1)}</span>
              <div className="flex w-full items-end justify-center gap-1">
                <div className="w-[38%]" style={{ height: lh, background: 'var(--color-ink)' }} />
                <div className="w-[38%]" style={{ height: ih, background: 'var(--color-vermilion)' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">
            <span className="size-1.5 bg-ink" /> Loss ₹ L
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-3">
            <span className="size-1.5 bg-vermilion" /> Intercepted ₹ L
          </span>
        </div>
        <span className="label">monthly, demo window</span>
      </div>
    </div>
  )
}

/* Funnel — payments → auto-flag → human review → intercepted */
export function Funnel({
  data,
}: {
  data: Array<{ label: string; value: number; unit: string }>
}) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[12px] text-ink-2">{d.label}</span>
            <span className="nums text-[12px] text-ink">
              {d.value}
              {d.unit}
            </span>
          </div>
          <div className="h-3 w-full bg-rule">
            <div
              className="h-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: i === data.length - 1 ? 'var(--color-vermilion)' : 'var(--color-ink)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* Stat cell — label over numeral, used in KPI rows and tables */
export function StatCell({
  label,
  value,
  unit,
  accent,
}: {
  label: string
  value: string
  unit?: string
  accent?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex items-baseline gap-1" style={{ color: accent }}>
        <Num className="text-[26px] leading-none font-medium text-ink">{value}</Num>
        {unit && <span className="text-[11px] text-ink-3">{unit}</span>}
      </div>
    </div>
  )
}