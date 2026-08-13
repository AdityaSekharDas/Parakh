/**
 * The Parakh mock universe. Everything on every screen derives from this file
 * so the numbers cross-check: Overview alerts == ReviewQueue tasks ==
 * Analytics counts. Deterministic by construction — no Math.random anywhere,
 * a flaky demo is the documented enemy.
 *
 * Tiers (pitch §5.3): GREEN < 40 · YELLOW 40–70 · RED > 70
 * Roles: Operator (bank command centre) · Citizen (their own payments).
 */

export type Tier = 'green' | 'yellow' | 'red'

export type TaskStatus = 'pending' | 'assigned' | 'reviewing' | 'fraud' | 'legit'

/** One weighted reason on an alert card — the explainability unit. */
export interface Reason {
  label: string
  points: number // positive pushes the score up
  evidence: string
}

/** A analyzed call record; the star case links one to a transaction. */
export interface CallRecord {
  id: string
  transcript: string[]
  flaggedLines: number[] // indices carrying a scam pattern
  patterns: string[] // impersonation / isolation / urgency / control
  isCoercive: boolean
  confidence: number
  durationSec: number
  at: string
}

export interface Alert {
  id: string
  customerId: string
  customerName: string
  payee: string // UPI handle, the payee's address in the network
  payeeName: string
  amount: number // ₹
  channel: string // GPay / PhonePe / Paytm / BHIM
  device: string
  hour: string // HH:mm when the transfer was attempted
  score: number
  tier: Tier
  reason: string // one-liner for tables and cards
  reasons: Reason[] // full weighted evidence
  narrative: string // plain-English explanation for the evidence screen
  callId?: string // linkage to the coercive-call analyzer
  status: TaskStatus
  assignee: string | null
  resolution?: string
  ageDays: number
  generatedAt: string
  confidence: string
  series: number[] // risk score over the 20-minute window as rules fire
  txnAt: number // index in series where the transfer lands
  callAt?: number // index in series where the call was flagged
}

/** Customer file shown in the alert context panel. */
export interface Customer {
  id: string
  name: string
  phone: string
  bank: string
  medianAmount: number
  typicalHours: string
  knownDevices: number
  knownPayees: number
  typicalVelocity: string
}

export const TIER_LABEL: Record<Tier, string> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
}

export const TIER_COLOR: Record<Tier, string> = {
  green: 'var(--color-tier-green)',
  yellow: 'var(--color-tier-yellow)',
  red: 'var(--color-tier-red)',
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  reviewing: 'In review',
  fraud: 'Fraud confirmed',
  legit: 'Legitimate',
}

export const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: 'var(--color-status-pending)',
  assigned: 'var(--color-status-assigned)',
  reviewing: 'var(--color-status-reviewing)',
  fraud: 'var(--color-status-fraud)',
  legit: 'var(--color-status-legit)',
}

export function tierOf(score: number): Tier {
  if (score > 70) return 'red'
  if (score >= 40) return 'yellow'
  return 'green'
}

/** The six hand-authored cases. These carry the demo. */
interface StarSpec {
  id: string
  customerId: string
  customerName: string
  payee: string
  payeeName: string
  amount: number
  channel: string
  device: string
  hour: string
  score: number
  reason: string
  narrative: string
  reasons: Reason[]
  callId?: string
  series: number[]
  txnAt: number
  callAt?: number
  ageDays: number
  generatedAt: string
  confidence: string
}

export const ANALYSTS = [
  'R. Das',
  'P. Nair',
  'S. Kulkarni',
  'A. Bose',
  'V. Reddy',
]

export const CURRENT_ANALYST = 'R. Das'

export const CURRENT_CUSTOMER_ID = 'C-4421'

/** The recorded digital-arrest call that precedes star case 1. */
export const CALLS: Record<string, CallRecord> = {
  'CALL-1421': {
    id: 'CALL-1421',
    transcript: [
      'Caller: This is inspector Sharma from the Customs Department. Your Aadhaar is linked to a money-laundering case.',
      'Sarita: What? I have not done anything. Please check again.',
      'Caller: There is a warrant out. Do not tell ANYONE about this call — not your family, nobody.',
      'Sarita: But what do I do?',
      'Caller: Everything will be clear if you transfer your savings to the safe account now. It is urgent. The warrant closes at 2 PM.',
      'Sarita: Okay… which account do I send it to?',
    ],
    flaggedLines: [0, 2, 4],
    patterns: ['impersonation', 'isolation', 'urgency', 'control'],
    isCoercive: true,
    confidence: 0.93,
    durationSec: 431,
    at: '14:02',
  },
}

const flat = (v: number, n = 20): number[] => Array.from({ length: n }, () => v)

const STARS: StarSpec[] = [
  {
    id: 'T-1421',
    customerId: 'C-4421',
    customerName: 'Sarita Verma',
    payee: 'safeguard-account@okaxis',
    payeeName: 'S. Chaudhary',
    amount: 49500,
    channel: 'PhonePe',
    device: 'OnePlus 12 · new today',
    hour: '14:06',
    score: 95,
    reason: 'Transfer 4 min after a flagged coercive call · 12× usual amount',
    narrative:
      'A call from "Customs" kept Sarita on the line for 7 minutes, forbid contact with family, and demanded an urgent transfer to a "safe account". Four minutes after that call was flagged coercive (0.93 confidence), a ₹49,500 transfer to a never-seen payee from a brand-new device was attempted. Every layer of the engine agrees: call linkage +35, new payee +20, amount 12× median +15, new device +15, velocity +10.',
    reasons: [
      { label: 'Flagged coercive call 4 min before', points: 35, evidence: 'CALL-1421 · 14:02 · confidence 0.93' },
      { label: 'Payee never seen before', points: 20, evidence: 'safeguard-account@okaxis · first txn' },
      { label: 'Amount 12× median', points: 15, evidence: '₹49,500 vs median ₹4,100' },
      { label: 'Device changed today', points: 15, evidence: 'OnePlus 12 · first use 11:04' },
      { label: 'High velocity', points: 10, evidence: '3 txns in 12 min' },
    ],
    callId: 'CALL-1421',
    series: [10, 10, 10, 12, 15, 15, 15, 15, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95],
    txnAt: 8,
    callAt: 2,
    ageDays: 0,
    generatedAt: '12 Aug, 14:06',
    confidence: 'High confidence',
  },
  {
    id: 'T-1187',
    customerId: 'C-1187',
    customerName: 'Ramesh Iyer',
    payee: 'quickcash@ibl',
    payeeName: 'Moneytree Services',
    amount: 32000,
    channel: 'GPay',
    device: 'Samsung M35 · new yesterday',
    hour: '23:12',
    score: 90,
    reason: 'Three transfers in 9 minutes to never-seen payees from a new device',
    narrative:
      'Two days after a new phone was bound to the account, three transfers left in nine minutes — all to payees with no payment history and amounts near the daily ceiling. The rules explain the device change and velocity; the Isolation Forest flags the payee cluster itself as anomalous.',
    reasons: [
      { label: 'Payee-network anomaly', points: 25, evidence: 'Isolation Forest · 3 new payees, 1 cluster' },
      { label: 'Payee never seen before', points: 20, evidence: 'quickcash@ibl · first txn' },
      { label: 'Amount 4× median', points: 15, evidence: '₹32,000 vs median ₹7,900' },
      { label: 'Device changed yesterday', points: 15, evidence: 'Samsung M35 · bound 11 Aug' },
      { label: 'High velocity', points: 10, evidence: '3 txns in 9 min' },
      { label: 'Outside typical hours', points: 5, evidence: 'usual window 07:00–22:00' },
    ],
    series: [12, 12, 18, 18, 24, 30, 36, 44, 52, 58, 64, 70, 76, 82, 86, 90, 90, 90, 90, 90],
    txnAt: 12,
    ageDays: 1,
    generatedAt: '11 Aug, 23:21',
    confidence: 'High confidence',
  },
  {
    id: 'T-2903',
    customerId: 'C-2903',
    customerName: 'K. Singh',
    payee: 'refund-desk@ybl',
    payeeName: 'QuickKart Refunds',
    amount: 21800,
    channel: 'Paytm',
    device: 'Xiaomi Redmi · known',
    hour: '00:03',
    score: 80,
    reason: '"Refund" link opened in a call, amount 8× median at 00:03',
    narrative:
      'A caller posing as QuickKart customer care pushed a "refund" link minutes earlier. The linked UPI handle has no history and the transfer amount is 8× this customer’s median, landing at 00:03 — outside any pattern this account has ever shown.',
    reasons: [
      { label: 'Payee-network anomaly', points: 25, evidence: 'Isolation Forest · refund-spike cluster' },
      { label: 'Payee never seen before', points: 20, evidence: 'refund-desk@ybl · first txn' },
      { label: 'Amount 8× median', points: 15, evidence: '₹21,800 vs median ₹2,700' },
      { label: 'Outside typical hours', points: 5, evidence: 'usual window 06:00–23:00' },
      { label: 'High velocity', points: 10, evidence: '2 txns in 6 min' },
      { label: 'Channel switch', points: 5, evidence: 'first Paytm use in 41 days' },
    ],
    series: [8, 8, 8, 12, 16, 20, 26, 32, 40, 46, 52, 58, 62, 68, 72, 76, 80, 80, 80, 80],
    txnAt: 14,
    ageDays: 2,
    generatedAt: '10 Aug, 00:03',
    confidence: 'Moderate confidence',
  },
  {
    id: 'T-3376',
    customerId: 'C-3376',
    customerName: 'L. Fernandes',
    payee: 'lucky-draw@paytm',
    payeeName: 'MVG Promotions',
    amount: 12300,
    channel: 'Paytm',
    device: 'Samsung A15 · known',
    hour: '19:44',
    score: 66,
    reason: 'First payment to a prize-collection merchant, 3× usual amount',
    narrative:
      'A soft signal: a first-ever payment to a prize-collection handle at 3× this customer’s amount. No device change, no call, normal hours. This is exactly the case the YELLOW tier exists for — warn with reasons, and let the human decide.',
    reasons: [
      { label: 'Payee never seen before', points: 20, evidence: 'lucky-draw@paytm · first txn' },
      { label: 'Payee-network anomaly', points: 16, evidence: 'Isolation Forest · promo cluster' },
      { label: 'Amount 3.1× median', points: 15, evidence: '₹12,300 vs median ₹4,000' },
      { label: 'High velocity', points: 10, evidence: '2 txns in 8 min' },
      { label: 'Outside typical hours', points: 5, evidence: 'usual window 07:00–21:00' },
    ],
    series: [14, 14, 14, 18, 22, 28, 34, 40, 46, 52, 58, 62, 66, 66, 66, 66, 66, 66, 66, 66],
    txnAt: 9,
    ageDays: 3,
    generatedAt: '9 Aug, 19:44',
    confidence: 'Moderate confidence',
  },
  {
    id: 'T-5108',
    customerId: 'C-5108',
    customerName: 'M. Khan',
    payee: 'plumber-khan@icici',
    payeeName: 'Rafiq Plumbing',
    amount: 8600,
    channel: 'GPay',
    device: 'OnePlus Nord · known',
    hour: '20:12',
    score: 58,
    reason: 'New payee, 3× usual amount, Friday evening — soft signal',
    narrative:
      'A watch-list case: a payee added five minutes ago, an amount 3× this customer’s median, on a Friday evening when velocity is historically elevated. On its own this is weak evidence — dispatch would be premature, a warning card is exactly right.',
    reasons: [
      { label: 'Payee never seen before', points: 20, evidence: 'plumber-khan@icici · added 20:07' },
      { label: 'Amount 3× median', points: 15, evidence: '₹8,600 vs median ₹2,900' },
      { label: 'Payee-network anomaly', points: 8, evidence: 'Isolation Forest · weak signal' },
      { label: 'High velocity', points: 10, evidence: '2 txns in 5 min' },
      { label: 'Outside typical hours', points: 5, evidence: 'usual window 08:00–20:00' },
    ],
    series: [10, 10, 10, 14, 18, 24, 30, 36, 42, 48, 54, 58, 58, 58, 58, 58, 58, 58, 58, 58],
    txnAt: 10,
    ageDays: 5,
    generatedAt: '7 Aug, 20:12',
    confidence: 'Low confidence',
  },
  {
    id: 'T-0742',
    customerId: 'C-0742',
    customerName: 'A. Patil',
    payee: 'kraft@okhdfc',
    payeeName: 'Kraft Kirana',
    amount: 2400,
    channel: 'BHIM',
    device: 'Realme 12 · known',
    hour: '09:31',
    score: 46,
    reason: 'New payee at 2.4× usual amount with no history — monitoring',
    narrative:
      'A retained soft signal: a new payee, an amount 2.4× this customer’s median, and a channel (BHIM) not used since June. No call, no device change, normal hours. Kept in YELLOW for trend monitoring rather than review.',
    reasons: [
      { label: 'Payee never seen before', points: 15, evidence: 'kraft@okhdfc · first txn' },
      { label: 'Payee-network anomaly', points: 16, evidence: 'Isolation Forest · weak signal' },
      { label: 'Amount 2.4× median', points: 10, evidence: '₹2,400 vs median ₹1,000' },
      { label: 'Outside typical hours', points: 5, evidence: 'usual window 07:00–22:00' },
    ],
    series: [6, 6, 6, 10, 14, 18, 24, 30, 36, 42, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46],
    txnAt: 9,
    ageDays: 7,
    generatedAt: '5 Aug, 09:31',
    confidence: 'Low confidence',
  },
  /* The citizen persona's second alert — the human-wins moment. */
  {
    id: 'T-1422',
    customerId: 'C-4421',
    customerName: 'Sarita Verma',
    payee: 'rafiq-plumbing@icici',
    payeeName: 'Rafiq Plumbing',
    amount: 3200,
    channel: 'GPay',
    device: 'OnePlus 12 · known',
    hour: '10:12',
    score: 52,
    reason: 'New payee, amount 1.6× usual — warning card only',
    narrative:
      'A normal-ish payment that trips a few rules: the payee has never been paid, and the amount is above this customer’s median. Nothing else is off. This is the payment the demo deliberately lets through — the human presses continue, and the engine learns.',
    reasons: [
      { label: 'Payee never seen before', points: 20, evidence: 'rafiq-plumbing@icici · first txn' },
      { label: 'Payee-network anomaly', points: 17, evidence: 'Isolation Forest · weak signal' },
      { label: 'Amount 1.6× median', points: 10, evidence: '₹3,200 vs median ₹2,050' },
      { label: 'Outside typical hours', points: 5, evidence: 'usually pays after 12:00' },
    ],
    series: [8, 8, 8, 12, 16, 20, 26, 32, 38, 44, 50, 52, 52, 52, 52, 52, 52, 52, 52, 52],
    txnAt: 10,
    ageDays: 1,
    generatedAt: '11 Aug, 10:12',
    confidence: 'Moderate confidence',
  },
]

const GENERIC_REASONS = [
  'New payee at 4× usual amount, 11 minutes before midnight',
  'Device changed within 24 h and amount above daily ceiling',
  'Three payments in 10 minutes to never-seen handles',
  'Night-hour transfer far above median with a new payee',
]

/** Lightweight cohort: 500 customers with a baseline risk score. */
interface CohortCustomer {
  id: string
  name: string
  bank: string
  score: number
}

export function buildCohort(): CohortCustomer[] {
  const out: CohortCustomer[] = []
  const FIRST = [
    'Sarita', 'Ramesh', 'Kavita', 'Anil', 'Meera', 'Rajesh', 'Priya', 'Vikram',
    'Sunita', 'Deepak', 'Lata', 'Manoj', 'Asha', 'Nitin', 'Rekha', 'Suresh',
    'Neha', 'Arun', 'Pooja', 'Sanjay',
  ]
  const LAST = [
    'Verma', 'Iyer', 'Singh', 'Fernandes', 'Khan', 'Patil', 'Sharma', 'Reddy',
    'Nair', 'Joshi', 'Das', 'Gupta', 'Menon', 'Chauhan', 'Bose', 'Kulkarni',
  ]
  const BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Canara']

  for (let i = 0; i < 500; i++) {
    // Left-skewed: ~78% green, ~18% yellow, ~4% red
    const p = ((i * 7919) % 1000) / 1000
    const score = p < 0.78
      ? Math.floor((p / 0.78) * 38)
      : p < 0.96
        ? 40 + Math.floor(((p - 0.78) / 0.18) * 28)
        : 71 + Math.floor(((p - 0.96) / 0.04) * 28)
    out.push({
      id: `C-${String(1000 + i * 7 + (i % 13)).padStart(4, '0')}`,
      name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
      bank: BANKS[i % BANKS.length],
      score,
    })
  }
  return out
}

export const COHORT: CohortCustomer[] = buildCohort()

export const CUSTOMERS: Record<string, Customer> = {
  'C-4421': {
    id: 'C-4421',
    name: 'Sarita Verma',
    phone: '+91 98447 62140',
    bank: 'SBI · Bhubaneswar Main',
    medianAmount: 4100,
    typicalHours: '08:00–21:00',
    knownDevices: 1,
    knownPayees: 14,
    typicalVelocity: '1.2 txns/hr',
  },
  'C-1187': {
    id: 'C-1187',
    name: 'Ramesh Iyer',
    phone: '+91 98220 11473',
    bank: 'HDFC · MG Road',
    medianAmount: 7900,
    typicalHours: '07:00–22:00',
    knownDevices: 2,
    knownPayees: 31,
    typicalVelocity: '0.8 txns/hr',
  },
  'C-2903': {
    id: 'C-2903',
    name: 'K. Singh',
    phone: '+91 98100 55384',
    bank: 'ICICI · Sector 18',
    medianAmount: 2700,
    typicalHours: '06:00–23:00',
    knownDevices: 1,
    knownPayees: 9,
    typicalVelocity: '0.6 txns/hr',
  },
  'C-3376': {
    id: 'C-3376',
    name: 'L. Fernandes',
    phone: '+91 98338 90211',
    bank: 'Axis · Andheri',
    medianAmount: 4000,
    typicalHours: '07:00–21:00',
    knownDevices: 2,
    knownPayees: 22,
    typicalVelocity: '1.1 txns/hr',
  },
  'C-5108': {
    id: 'C-5108',
    name: 'M. Khan',
    phone: '+91 98999 22840',
    bank: 'Kotak · Rohini',
    medianAmount: 2900,
    typicalHours: '08:00–20:00',
    knownDevices: 2,
    knownPayees: 17,
    typicalVelocity: '0.9 txns/hr',
  },
  'C-0742': {
    id: 'C-0742',
    name: 'A. Patil',
    phone: '+91 98220 76180',
    bank: 'Canara · Kothrud',
    medianAmount: 1000,
    typicalHours: '07:00–22:00',
    knownDevices: 1,
    knownPayees: 11,
    typicalVelocity: '0.5 txns/hr',
  },
}

/** Deterministic pad alerts so the review queue has body beyond the stars. */
function generatedAlerts(): Alert[] {
  const out: Alert[] = []
  const pays: Array<[string, string, number, string]> = [
    ['merchant-ex@ybl', 'Ex Trade Hub', 14500, 'GPay'],
    ['quickmart@paytm', 'QuickMart', 9200, 'Paytm'],
    ['techhelp@ibl', 'TechDesk Care', 7300, 'PhonePe'],
    ['courier-desk@icici', 'ShipNow Couriers', 6800, 'GPay'],
    ['invest-guru@ybl', 'WealthGuru', 21950, 'PhonePe'],
    ['secur-kart@okhdfc', 'SecurKart', 5100, 'Paytm'],
  ]
  const names = ['N. Bose', 'P. Menon', 'T. Chauhan', 'R. Kulkarni', 'S. Gupta', 'A. Joshi']
  const banks = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Canara']
  const seriesClimb = (base: number, top: number): number[] => {
    const s: number[] = []
    for (let i = 0; i < 20; i++) s.push(Math.round(base + (top - base) * (i / 19)))
    return s
  }
  for (let i = 0; i < 9; i++) {
    const score = 74 + ((i * 7) % 24)
    const id = `T-2${String(100 + i).slice(1)}0${i}`
    out.push({
      id,
      customerId: `C-${String(2000 + i * 911)}`,
      customerName: names[i % names.length],
      payee: pays[i % pays.length][0],
      payeeName: pays[i % pays.length][1] as string,
      amount: pays[i % pays.length][2] as number,
      channel: pays[i % pays.length][3] as string,
      device: i % 2 === 0 ? `Xiaomi Redmi · new today` : `Vivo V40 · known`,
      hour: ['22:41', '23:05', '21:18', '22:02', '20:47', '23:31'][i % 6],
      score,
      tier: tierOf(score),
      reason: GENERIC_REASONS[i % GENERIC_REASONS.length],
      narrative: GENERIC_REASONS[i % GENERIC_REASONS.length],
      reasons: [
        { label: 'Payee never seen before', points: 20, evidence: 'first txn · clustered' },
        { label: 'Payee-network anomaly', points: score - 40, evidence: 'Isolation Forest' },
        { label: 'Amount above ceiling', points: 10, evidence: `${pays[i % pays.length][2]} vs median` },
        { label: 'High velocity', points: 10, evidence: '2 txns in 8 min' },
      ],
      status: 'pending',
      assignee: null,
      ageDays: 1 + (i % 5),
      generatedAt: '10 Aug, 22:41',
      confidence: i % 2 === 0 ? 'Moderate confidence' : 'Low confidence',
      series: seriesClimb(18, score),
      txnAt: 9,
    })
  }
  return out
}

/** Full alert set: 15 total — 12 open, 3 already resolved. */
export const ALERTS: Alert[] = [
  ...STARS.map((s): Alert => ({
    id: s.id,
    customerId: s.customerId,
    customerName: s.customerName,
    payee: s.payee,
    payeeName: s.payeeName,
    amount: s.amount,
    channel: s.channel,
    device: s.device,
    hour: s.hour,
    score: s.score,
    tier: tierOf(s.score),
    reason: s.reason,
    reasons: s.reasons,
    narrative: s.narrative,
    callId: s.callId,
    status: 'pending',
    assignee: null,
    ageDays: s.ageDays,
    generatedAt: s.generatedAt,
    confidence: s.confidence,
    series: s.series,
    txnAt: s.txnAt,
    callAt: s.callAt,
  })),
  ...generatedAlerts(),
]
  .map((a, i) => {
    // Seed the queue with a deterministic mix of statuses so ReviewQueue has
    // body on first load: one fraud confirmed, one legit, one in review.
    if (i === 1) return { ...a, status: 'legit' as TaskStatus, resolution: 'Marked legitimate by citizen · 11 Aug · cleared' }
    if (i === 2) return { ...a, status: 'reviewing' as TaskStatus, assignee: 'P. Nair' }
    if (i === 3) return { ...a, status: 'fraud' as TaskStatus, assignee: 'R. Das', resolution: 'Confirmed by R. Das · 9 Aug · funds frozen before settlement' }
    return a
  })

export const ACTIVE_ALERTS = ALERTS.filter((a) => a.status === 'pending' || a.status === 'reviewing' || a.status === 'assigned')

export function alertById(id: string): Alert | undefined {
  return ALERTS.find((a) => a.id === id)
}

export function customerById(id: string): Customer | undefined {
  return CUSTOMERS[id]
}

/** Opening review state — every open alert becomes a task. */
export const INITIAL_TASKS = ALERTS

/** The citizen persona the demo signs in as. */
export const CURRENT_CUSTOMER = CUSTOMERS[CURRENT_CUSTOMER_ID]

/* ------------------------------------------------------------------ */
/* Aggregates — every KPI on every screen reads from here.            */
/* ------------------------------------------------------------------ */

export const KPI = {
  customers: COHORT.length,
  activeAlerts: ACTIVE_ALERTS.length,
  alertsToday: 3,
  avgScore: Math.round(COHORT.reduce((s, c) => s + c.score, 0) / COHORT.length),
  interceptedLakh: 11.8,
  interceptedPct: 2.4,
  precision: 82,
  recall: 74,
}

export const SCORE_HISTOGRAM: Array<{ bucket: string; count: number; tier: Tier }> =
  Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10
    return {
      bucket: `${lo}–${lo + 9}`,
      count: COHORT.filter((c) => c.score >= lo && c.score <= lo + 9).length,
      tier: tierOf(lo),
    }
  })

export interface TickerEvent {
  time: string
  text: string
  tier: Tier
}

/** Deterministic replay script for the live ticker and the txn feed. */
export const TICKER: TickerEvent[] = [
  { time: '14:04', text: 'C-1187 · ₹1,120 → kirana@ybl', tier: 'green' },
  { time: '14:04', text: 'C-4421 · call verdict cached · COERCIVE · 0.93', tier: 'red' },
  { time: '14:05', text: 'C-3376 · ₹340 → metro@paytm', tier: 'green' },
  { time: '14:05', text: 'C-5108 · ₹2,700 → flipkart@ibl', tier: 'green' },
  { time: '14:06', text: 'C-4421 · ₹49,500 → safeguard-account@okaxis', tier: 'red' },
  { time: '14:06', text: 'Rule layer · +35 call-linkage applied', tier: 'yellow' },
  { time: '14:06', text: 'Risk engine · T-1421 scored 95 · RED', tier: 'red' },
  { time: '14:07', text: 'C-0742 · ₹180 → bsnl-bill@icici', tier: 'green' },
  { time: '14:07', text: 'C-1187 · ₹850 → zomato@ybl', tier: 'green' },
  { time: '14:08', text: 'Isolation Forest · pass complete · 214 ms', tier: 'green' },
]

/** Pre-scripted flags that land in the alert feed during the demo. */
export const SCRIPTED_ALERTS: Array<{ id: string; snippet: string; at: string }> = [
  { id: 'T-1421', snippet: 'Call linkage applied — score revised to 95', at: 'just now' },
  { id: 'T-2903', snippet: 'Refund-spike cluster flagged by Isolation Forest', at: 'just now' },
  { id: 'T-1187', snippet: 'Velocity rule tripped: 3 txns in 9 minutes', at: 'just now' },
]

export const ANALYTICS = {
  actioned: 12,
  actionedOf: 15,
  confirmed: 14,
  falsePositives: 5,
  interceptedLakh: 11.8,
  reviewCostSavedLakh: 0.4,
  precision: 84,
  recall: 76,
  funnel: [
    { label: 'Payments scored', value: 2.4, unit: 'L' },
    { label: 'Auto-flagged', value: 86, unit: '' },
    { label: 'Human-reviewed', value: 54, unit: '' },
    { label: 'Fraud intercepted', value: 23.4, unit: '₹L' },
  ],
  lossTrend: [
    { month: 'Mar', losses: 52.1, intercepted: 1.2 },
    { month: 'Apr', losses: 49.4, intercepted: 3.6 },
    { month: 'May', losses: 46.8, intercepted: 6.1 },
    { month: 'Jun', losses: 44.2, intercepted: 8.4 },
    { month: 'Jul', losses: 42.6, intercepted: 11.8 },
    { month: 'Aug', losses: 39.9, intercepted: 14.7 },
  ],
  scamTypes: [
    { type: 'Digital arrest / coercion', amount: 9.1, confirmed: 5 },
    { type: 'OTP & refund', amount: 7.8, confirmed: 3 },
    { type: 'QR swap', amount: 6.4, confirmed: 3 },
    { type: 'Investment fraud', amount: 5.2, confirmed: 2 },
    { type: 'Screen sharing', amount: 4.7, confirmed: 1 },
  ],
  model: {
    version: 'Rules v1.3 + Isolation Forest v0.4',
    retrained: '2 Aug',
    trainingTxns: '2,40,000',
    nextRetrain: '9 Aug',
  },
}

export const STAR_IDS = STARS.map((s) => s.id)

export const flat20 = flat

/* ------------------------------------------------------------------ */
/* Citizen persona — Sarita's own statement of account.               */
/* ------------------------------------------------------------------ */

export interface CitizenTxn {
  id: string
  at: string
  to: string
  note: string
  amount: number // negative = debit, positive = credit
  status: 'clear' | 'watched' | 'intercepted' | 'credit'
}

export const CITIZEN_TRANSACTIONS: CitizenTxn[] = [
  { id: 'T-1421', at: '12 Aug · 14:06', to: 'S. Chaudhary', note: 'safeguard-account@okaxis', amount: -49500, status: 'intercepted' },
  { id: 'T-1422', at: '11 Aug · 10:12', to: 'Rafiq Plumbing', note: 'plumber · new payee', amount: -3200, status: 'watched' },
  { id: 'T-1390', at: '11 Aug · 09:15', to: 'BSNL', note: 'broadband', amount: -799, status: 'clear' },
  { id: 'T-1381', at: '10 Aug · 19:20', to: 'Ration Mart', note: 'groceries', amount: -1840, status: 'clear' },
  { id: 'T-1367', at: '9 Aug · 08:05', to: 'TechnoFab', note: 'salary credit', amount: 162000, status: 'credit' },
  { id: 'T-1342', at: '8 Aug · 21:12', to: 'Ola', note: 'cab', amount: -312, status: 'clear' },
  { id: 'T-1330', at: '8 Aug · 12:40', to: 'QuickMart', note: 'monthly provisions', amount: -5400, status: 'clear' },
  { id: 'T-1301', at: '6 Aug · 18:03', to: 'Jio', note: 'recharge', amount: -299, status: 'clear' },
]

export const CITIZEN_BALANCE = 184320

export const CITIZEN_ALERTS = ALERTS.filter((a) => a.customerId === CURRENT_CUSTOMER_ID)