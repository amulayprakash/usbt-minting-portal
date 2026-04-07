import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowSquareOut,
  ArrowClockwise,
  CheckCircle,
  Clock,
  XCircle,
  SignIn,
  Coins,
  ArrowCircleDown,
  ArrowCircleUp,
  Spinner,
} from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type Deposit = {
  id: string
  chain: string
  token_symbol: string
  amount: number
  usbt_credited: number | null
  tx_hash: string
  status: 'pending' | 'credited' | 'failed'
  created_at: string
}

type Withdrawal = {
  id: string
  tron_address: string
  usbt_amount: number
  tx_hash: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

const TRONSCAN_TX = 'https://tronscan.org/#/transaction/'
const TRONSCAN_ADDR = 'https://tronscan.org/#/address/'
const EDGE_URL = import.meta.env.VITE_EDGE_FUNCTION_URL as string

const STATUS_CONFIG = {
  pending:    { icon: Clock,       color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  label: 'Pending' },
  credited:   { icon: CheckCircle, color: '#34d399', bg: 'rgba(52,211,153,0.10)',  label: 'Credited' },
  failed:     { icon: XCircle,     color: '#f87171', bg: 'rgba(248,113,113,0.10)', label: 'Failed' },
  processing: { icon: Clock,       color: '#06b6d4', bg: 'rgba(6,182,212,0.10)',   label: 'Processing' },
  completed:  { icon: CheckCircle, color: '#34d399', bg: 'rgba(52,211,153,0.10)',  label: 'Completed' },
}

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={10} weight="fill" />
      {cfg.label}
    </span>
  )
}

function NetworkBadge({ chain }: { chain: string }) {
  const label = chain.toUpperCase()
  const isTron = label === 'TRON' || label === 'TRX'
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded"
      style={{
        background: isTron ? 'rgba(255,0,0,0.08)' : 'rgba(99,102,241,0.10)',
        color: isTron ? '#f87171' : '#818cf8',
      }}
    >
      {label}
    </span>
  )
}

function truncateHash(hash: string, chars = 6) {
  if (!hash) return '—'
  return `${hash.slice(0, chars)}…${hash.slice(-4)}`
}

function truncateAddress(addr: string, chars = 8) {
  if (!addr) return '—'
  return `${addr.slice(0, chars)}…${addr.slice(-4)}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
}

const spring = { type: 'spring' as const, stiffness: 260, damping: 26 }

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { ...spring, delay: i * 0.04 } }),
}

export default function Dashboard() {
  const { user, session, isLoading, usbtBalance, refreshBalance, signInWithGoogle } = useAuth()
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loadingTx, setLoadingTx] = useState(false)
  const [recheckingId, setRecheckingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>('deposits')

  useEffect(() => {
    if (!user) return
    fetchTxHistory()
  }, [user])

  const fetchTxHistory = async () => {
    setLoadingTx(true)
    const [{ data: deps }, { data: wds }] = await Promise.all([
      supabase.from('deposits').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('withdrawals').select('*').order('created_at', { ascending: false }).limit(20),
    ])
    if (deps) setDeposits(deps as Deposit[])
    if (wds) setWithdrawals(wds as Withdrawal[])
    setLoadingTx(false)
  }

  const handleRecheck = async (deposit: Deposit) => {
    if (!session) return
    setRecheckingId(deposit.id)
    try {
      const res = await fetch(`${EDGE_URL}verify-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tx_hash: deposit.tx_hash }),
      })
      const json = await res.json()
      if (json.success) {
        await fetchTxHistory()
        await refreshBalance()
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setRecheckingId(null)
    }
  }

  // Summary stats
  const totalDeposited = deposits.filter(d => d.status === 'credited').reduce((s, d) => s + (d.usbt_credited ?? 0), 0)
  const totalWithdrawn = withdrawals.filter(w => w.status === 'completed').reduce((s, w) => s + w.usbt_amount, 0)
  const pendingCount = deposits.filter(d => d.status === 'pending').length + withdrawals.filter(w => w.status === 'pending' || w.status === 'processing').length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={24} className="text-cyan-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-2">
          <p className="text-base font-semibold text-white">Sign in to continue</p>
          <p className="text-sm text-slate-500">View your balance, deposits, and withdrawal history.</p>
        </div>
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.10] transition-colors"
        >
          <SignIn size={16} weight="bold" />
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={spring}
      className="min-h-dvh pt-28 pb-24 px-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5 font-mono">{user.email}</p>
          </div>
          <button
            onClick={() => { fetchTxHistory(); refreshBalance() }}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
            title="Refresh"
          >
            <ArrowClockwise size={14} className={loadingTx ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Balance + Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Main balance — spans 2 on mobile */}
          <div
            className="col-span-2 rounded-2xl p-5 flex items-center justify-between"
            style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.20)' }}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-400/60 mb-1">USBT Balance</p>
              <p className="text-3xl font-bold text-white tracking-tight font-mono tabular-nums">
                {usbtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">≈ ${usbtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
            </div>
            <Coins size={32} className="text-cyan-500/30" weight="duotone" />
          </div>

          {/* Total deposited */}
          <div
            className="rounded-2xl p-4 flex flex-col justify-between"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Deposited</p>
              <ArrowCircleDown size={14} className="text-emerald-400/50" weight="fill" />
            </div>
            <p className="text-lg font-bold text-white font-mono tabular-nums">
              {totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">{deposits.filter(d => d.status === 'credited').length} transactions</p>
          </div>

          {/* Total withdrawn */}
          <div
            className="rounded-2xl p-4 flex flex-col justify-between"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Withdrawn</p>
              <ArrowCircleUp size={14} className="text-cyan-400/50" weight="fill" />
            </div>
            <p className="text-lg font-bold text-white font-mono tabular-nums">
              {totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">{withdrawals.filter(w => w.status === 'completed').length} transactions</p>
          </div>
        </div>

        {/* Pending indicator */}
        {pendingCount > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}
          >
            <Clock size={13} className="text-amber-400" weight="fill" />
            <p className="text-xs text-amber-400/80">
              {pendingCount} transaction{pendingCount > 1 ? 's' : ''} pending — refresh to check status
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {(['deposits', 'withdrawals'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
              style={{ color: activeTab === tab ? '#fff' : 'rgb(100,116,139)' }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                  transition={spring}
                />
              )}
              <span className="relative capitalize">{tab}</span>
              <span
                className="relative ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: activeTab === tab ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.06)',
                  color: activeTab === tab ? '#06b6d4' : 'rgb(71,85,105)',
                }}
              >
                {tab === 'deposits' ? deposits.length : withdrawals.length}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <AnimatePresence mode="wait">
          {activeTab === 'deposits' ? (
            <motion.section
              key="deposits"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={spring}
            >
              {deposits.length === 0 ? (
                <EmptyState
                  icon={<ArrowCircleDown size={28} className="text-slate-600" weight="duotone" />}
                  label="No deposits yet"
                  sublabel="Your deposit history will appear here."
                />
              ) : (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {/* Table header */}
                  <div
                    className="hidden sm:grid grid-cols-[1fr_1.2fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600"
                    style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span>Amount</span>
                    <span>Network · Token</span>
                    <span>Tx Hash</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span></span>
                  </div>

                  {deposits.map((d, i) => {
                    const { date, time } = formatDate(d.created_at)
                    return (
                      <motion.div
                        key={d.id}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr_auto_auto_auto_auto] gap-2 sm:gap-4 px-4 py-3.5 items-center group"
                        style={{
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                          borderBottom: i < deposits.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}
                      >
                        {/* Amount */}
                        <div>
                          <p className="text-sm font-semibold text-white font-mono tabular-nums">
                            {d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                            <span className="text-slate-400 font-sans font-medium">{d.token_symbol}</span>
                          </p>
                          {d.usbt_credited != null && (
                            <p className="text-xs text-cyan-400 font-mono tabular-nums mt-0.5">
                              → {d.usbt_credited.toLocaleString('en-US', { minimumFractionDigits: 2 })} USBT
                            </p>
                          )}
                        </div>

                        {/* Network + Token */}
                        <div className="flex items-center gap-2">
                          <NetworkBadge chain={d.chain} />
                          <span className="text-xs text-slate-500 font-mono">{d.token_symbol}</span>
                        </div>

                        {/* Tx hash */}
                        <a
                          href={`${TRONSCAN_TX}${d.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors"
                          title={d.tx_hash}
                        >
                          {truncateHash(d.tx_hash)}
                          <ArrowSquareOut size={10} />
                        </a>

                        {/* Date */}
                        <div className="text-right sm:text-left">
                          <p className="text-xs text-slate-400">{date}</p>
                          <p className="text-[10px] text-slate-600 font-mono">{time}</p>
                        </div>

                        {/* Status */}
                        <StatusBadge status={d.status} />

                        {/* Actions */}
                        <div className="flex items-center gap-2 justify-end">
                          {d.status === 'pending' && (
                            <button
                              onClick={() => handleRecheck(d)}
                              disabled={recheckingId === d.id}
                              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 disabled:opacity-40 transition-colors"
                            >
                              {recheckingId === d.id ? 'Checking…' : 'Recheck'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section
              key="withdrawals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={spring}
            >
              {withdrawals.length === 0 ? (
                <EmptyState
                  icon={<ArrowCircleUp size={28} className="text-slate-600" weight="duotone" />}
                  label="No withdrawals yet"
                  sublabel="Your withdrawal history will appear here."
                />
              ) : (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {/* Table header */}
                  <div
                    className="hidden sm:grid grid-cols-[1fr_1.4fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600"
                    style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span>Amount</span>
                    <span>Wallet address</span>
                    <span>Network</span>
                    <span>Tx Hash</span>
                    <span>Date</span>
                    <span>Status</span>
                  </div>

                  {withdrawals.map((w, i) => {
                    const { date, time } = formatDate(w.created_at)
                    return (
                      <motion.div
                        key={w.id}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto_auto_auto_auto] gap-2 sm:gap-4 px-4 py-3.5 items-center"
                        style={{
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                          borderBottom: i < withdrawals.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}
                      >
                        {/* Amount */}
                        <div>
                          <p className="text-sm font-semibold text-white font-mono tabular-nums">
                            {w.usbt_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                            <span className="text-slate-400 font-sans font-medium">USBT</span>
                          </p>
                        </div>

                        {/* Wallet address */}
                        <a
                          href={`${TRONSCAN_ADDR}${w.tron_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors truncate"
                          title={w.tron_address}
                        >
                          {truncateAddress(w.tron_address, 10)}
                          <ArrowSquareOut size={10} className="flex-shrink-0" />
                        </a>

                        {/* Network */}
                        <NetworkBadge chain="TRON" />

                        {/* Tx hash */}
                        {w.tx_hash ? (
                          <a
                            href={`${TRONSCAN_TX}${w.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors"
                            title={w.tx_hash}
                          >
                            {truncateHash(w.tx_hash)}
                            <ArrowSquareOut size={10} />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-700 font-mono">—</span>
                        )}

                        {/* Date */}
                        <div>
                          <p className="text-xs text-slate-400">{date}</p>
                          <p className="text-[10px] text-slate-600 font-mono">{time}</p>
                        </div>

                        {/* Status */}
                        <StatusBadge status={w.status} />
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  )
}

function EmptyState({ icon, label, sublabel }: { icon: React.ReactNode; label: string; sublabel: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-14 rounded-2xl"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {icon}
      <div className="text-center">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="text-xs text-slate-600 mt-0.5">{sublabel}</p>
      </div>
    </div>
  )
}
