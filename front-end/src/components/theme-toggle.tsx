'use client'

/**
 * Three-way stock switcher: Paper · Auto · Espresso.
 *
 * - Paper / Espresso pin the theme and persist to localStorage.
 * - Auto follows prefers-color-scheme LIVE — a change in the OS theme
 *   (or DevTools emulation) flips the app without a reload.
 * - The same state is read by the pre-paint script in the root layout,
 *   so there is never a flash of the wrong stock. Old 'dark'/'light'
 *   values stored by the previous two-state toggle are migrated.
 */

import { useEffect, useState } from 'react'
import { Icon } from '@/components/icons'

export type Mode = 'paper' | 'auto' | 'espresso'

const KEY = 'parakh-theme'
const MODES: Mode[] = ['paper', 'auto', 'espresso']
const LABEL: Record<Mode, string> = { paper: 'Paper', auto: 'Auto', espresso: 'Espresso' }

function systemPrefersEspresso(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** The theme a mode should render, resolving 'auto' against the OS. */
export function effectiveTheme(mode: Mode): 'espresso' | 'paper' {
  if (mode === 'auto') return systemPrefersEspresso() ? 'espresso' : 'paper'
  return mode
}

/** Apply a mode to the document — the single place the class flips. */
export function applyMode(mode: Mode) {
  document.documentElement.classList.toggle('dark', effectiveTheme(mode) === 'espresso')
}

/** Current mode: stored value, or 'auto' by default. Migrates old keys. */
export function storedMode(): Mode {
  if (typeof document === 'undefined') return 'auto'
  const t = localStorage.getItem(KEY)
  if (t === 'espresso' || t === 'paper' || t === 'auto') return t
  if (t === 'dark') return 'espresso'
  if (t === 'light') return 'paper'
  return 'auto'
}

export function ThemeSwitch({ className = '' }: { className?: string }) {
  const [mode, setMode] = useState<Mode>('auto')

  useEffect(() => {
    const m = storedMode()
    setMode(m)
    applyMode(m)
    // Track the OS live; re-read storage so a stale closure can't bite.
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyMode(storedMode())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const pick = (m: Mode) => {
    setMode(m)
    localStorage.setItem(KEY, m)
    applyMode(m)
  }

  return (
    <div role="group" aria-label="Theme" className={`flex border border-rule ${className}`}>
      {MODES.map((m) => {
        const active = mode === m
        return (
          <button
            key={m}
            onClick={() => pick(m)}
            title={m === 'auto' ? 'Follow the system colour scheme' : `${LABEL[m]} theme`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              active ? 'bg-ink text-paper' : 'text-ink-3 hover:bg-paper-2 hover:text-ink'
            }`}
          >
            {m === 'auto' ? (
              <Icon name="monitor" className="h-3.5 w-3.5" />
            ) : m === 'espresso' ? (
              <Icon name="moon" className="h-3.5 w-3.5" />
            ) : (
              <Icon name="sun" className="h-3.5 w-3.5" />
            )}
            {LABEL[m]}
          </button>
        )
      })}
    </div>
  )
}