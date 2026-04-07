'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowSquareOut, ArrowClockwise, CheckCircle, XCircle } from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { EVM_CHAINS, TRONSCAN_TX_URL } from '../../constants/contracts';

type Deposit = {
  id: string;
  chain: string;
  token_symbol: string;
  amount: number;
  usbt_credited: number | null;
  tx_hash: string;
  status: 'pending' | 'credited' | 'failed';
  created_at: string;
};

const EDGE_URL = import.meta.env.VITE_EDGE_FUNCTION_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function explorerUrl(chain: string, txHash: string): string {
  if (chain === 'tron') return TRONSCAN_TX_URL(txHash);
  const cfg = EVM_CHAINS[chain];
  if (cfg) return `${cfg.explorerTx}${txHash}`;
  return '#';
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const CHAIN_LABELS: Record<string, string> = {
  tron: 'TRON',
  ethereum: 'Ethereum',
  bsc: 'BNB Chain',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
  avalanche: 'Avalanche',
};

export default function PendingDeposits({ refreshSignal }: { refreshSignal: number }) {
  const { user, session, refreshBalance } = useAuth();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const fetchPending = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setDeposits(data as Deposit[]);
  }, [user]);

  useEffect(() => { fetchPending(); }, [fetchPending, refreshSignal]);

  const handleCheck = async (deposit: Deposit) => {
    // Force a server-side token refresh so the JWT is never stale
    const { data, error: refreshError } = await supabase.auth.refreshSession();
    const freshSession = data.session;
    if (!freshSession || refreshError) return;
    setCheckingId(deposit.id);
    try {
      const res = await fetch(`${EDGE_URL}verify-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshSession.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ tx_hash: deposit.tx_hash }),
      });
      const json = await res.json();
      if (json.success) {
        // Remove from pending list
        setDeposits(prev => prev.filter(d => d.id !== deposit.id));
        await refreshBalance();
      } else {
        // Mark as checked but not credited yet
        setCheckedIds(prev => new Set(prev).add(deposit.id));
      }
    } catch {
      setCheckedIds(prev => new Set(prev).add(deposit.id));
    } finally {
      setCheckingId(null);
    }
  };

  if (!user || deposits.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="mt-4"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <Clock size={12} weight="fill" className="text-amber-400" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pending Deposits
          </p>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.12)', color: 'rgba(251,191,36,0.9)' }}
          >
            {deposits.length}
          </span>
        </div>

        <div className="space-y-2">
          {deposits.map((dep) => {
            const isChecking = checkingId === dep.id;
            const wasChecked = checkedIds.has(dep.id);

            return (
              <motion.div
                key={dep.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: wasChecked
                    ? '1px solid rgba(245,158,11,0.18)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: 'rgba(245,158,11,0.9)',
                    boxShadow: '0 0 6px rgba(245,158,11,0.5)',
                  }}
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">
                      {dep.amount.toLocaleString()} {dep.token_symbol}
                    </span>
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
                    >
                      {CHAIN_LABELS[dep.chain] ?? dep.chain}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href={explorerUrl(dep.chain, dep.tx_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-mono text-slate-600 hover:text-cyan-400 transition-colors"
                    >
                      {dep.tx_hash.slice(0, 8)}…{dep.tx_hash.slice(-6)}
                      <ArrowSquareOut size={9} />
                    </a>
                    <span className="text-[10px] text-slate-700">{timeAgo(dep.created_at)}</span>
                  </div>
                </div>

                {/* Check button */}
                <button
                  onClick={() => handleCheck(dep)}
                  disabled={isChecking}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-wait flex-shrink-0"
                  style={{
                    background: wasChecked ? 'rgba(245,158,11,0.10)' : 'rgba(6,182,212,0.10)',
                    border: wasChecked ? '1px solid rgba(245,158,11,0.22)' : '1px solid rgba(6,182,212,0.22)',
                    color: wasChecked ? 'rgba(251,191,36,0.9)' : 'rgba(103,232,249,1)',
                  }}
                >
                  {isChecking ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-[1.5px] border-current border-t-transparent animate-spin" />
                      Checking
                    </>
                  ) : wasChecked ? (
                    <>
                      <Clock size={11} weight="fill" />
                      Not yet
                    </>
                  ) : (
                    <>
                      <ArrowClockwise size={11} weight="bold" />
                      Check
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-700 mt-2 px-1">
          Press Check to verify if your deposit has been confirmed on-chain and USBT credited.
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
