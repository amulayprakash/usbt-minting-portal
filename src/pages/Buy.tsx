import { useRef, useEffect } from 'react';
import { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, DownloadSimple, PaperPlaneTilt, ShieldCheck, ArrowSquareOut,
  Star, Lightning, Crown, CaretLeft, CaretRight, Gift,
} from '@phosphor-icons/react';
import BuyPortal from '../components/portal/BuyPortal';
import WithdrawPanel from '../components/portal/WithdrawPanel';
import { CONTRACTS, TRONSCAN_CONTRACT_URL } from '../constants/contracts';

type ActiveTab = 'buy' | 'withdraw';

// ─── Bonus Offers ─────────────────────────────────────────────────────────────

const OFFERS = [
  {
    id: 'starter',
    label: 'Starter Boost',
    sublabel: 'Purchase 20,000+ USDT',
    minUsdt: 20_000,
    bonusPct: 10,
    icon: Star,
    gradient: 'from-cyan-500/[0.13] to-blue-600/[0.06]',
    border: 'border-cyan-500/25',
    accent: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    btnBg: 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300',
    glow: 'shadow-[0_0_32px_rgba(6,182,212,0.15)]',
    popular: false,
  },
  {
    id: 'growth',
    label: 'Growth Pack',
    sublabel: 'Purchase 50,000+ USDT',
    minUsdt: 50_000,
    bonusPct: 15,
    icon: Lightning,
    gradient: 'from-violet-500/[0.15] to-purple-600/[0.07]',
    border: 'border-violet-500/30',
    accent: 'text-violet-400',
    badgeBg: 'bg-violet-500/15',
    badgeText: 'text-violet-300',
    btnBg: 'bg-violet-500/15 hover:bg-violet-500/25 text-violet-300',
    glow: 'shadow-[0_0_32px_rgba(139,92,246,0.18)]',
    popular: true,
  },
  {
    id: 'elite',
    label: 'Elite Tier',
    sublabel: 'Purchase 100,000+ USDT',
    minUsdt: 100_000,
    bonusPct: 20,
    icon: Crown,
    gradient: 'from-amber-500/[0.15] to-yellow-600/[0.07]',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    btnBg: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300',
    glow: 'shadow-[0_0_32px_rgba(245,158,11,0.18)]',
    popular: false,
  },
] as const;

function OfferCarousel({ onSelect }: { onSelect: (minUsdt: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = OFFERS.length;

  const go = (next: number) => {
    setDirection(next > idx ? 1 : -1);
    setIdx(next);
  };
  const prev = () => go((idx - 1 + total) % total);
  const next = () => go((idx + 1) % total);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [total]);

  const offer = OFFERS[idx];
  const Icon = offer.icon;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: 0.96 }),
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={offer.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`
              relative w-full rounded-2xl border p-5
              bg-gradient-to-br ${offer.gradient} ${offer.border} ${offer.glow}
            `}
          >
            {offer.popular && (
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] bg-violet-500 text-white px-2.5 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${offer.badgeBg}`}>
                <Icon size={22} weight="fill" className={offer.accent} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className={`text-base font-bold ${offer.accent}`}>{offer.label}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${offer.badgeBg} ${offer.badgeText}`}>
                    +{offer.bonusPct}% Bonus
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-[#6b6b88]">{offer.sublabel}</p>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-[#4a4a6a] uppercase tracking-wide mb-1">
                  You get extra
                </p>
                <p className={`text-2xl font-black ${offer.accent}`}>+{offer.bonusPct}% USBT</p>
                <p className="text-[11px] text-slate-500 dark:text-[#6b6b88] mt-0.5">
                  free on every purchase
                </p>
              </div>
              <button
                onClick={() => onSelect(offer.minUsdt)}
                className={`
                  flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold
                  transition-all duration-150 active:scale-95
                  ${offer.btnBg}
                `}
              >
                Buy Now →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav row */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex gap-1.5">
          {OFFERS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-200 ${
                i === idx
                  ? `w-5 h-1.5 ${OFFERS[i].badgeBg}`
                  : 'w-1.5 h-1.5 bg-slate-300/40 dark:bg-white/[0.08]'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={prev}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.10] transition-colors"
          >
            <CaretLeft size={12} className="text-slate-500 dark:text-[#6b6b88]" />
          </button>
          <button
            onClick={next}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.10] transition-colors"
          >
            <CaretRight size={12} className="text-slate-500 dark:text-[#6b6b88]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── How it Works + Contract Reference ───────────────────────────────────────

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Select coin & network',
    desc: 'Choose the stablecoin you want to deposit and the network it lives on. Only supported coin/network pairs are shown.',
  },
  {
    n: '02',
    title: 'Connect your wallet',
    desc: 'Connect any compatible wallet for your chosen network — TronLink for TRON, or any WalletConnect-compatible wallet.',
  },
  {
    n: '03',
    title: 'Enter amount & approve',
    desc: 'Type how much USDT you want to spend. Approve the token transfer, then confirm the buyTokens transaction in your wallet.',
  },
  {
    n: '04',
    title: 'Receive USBT',
    desc: 'USBT is minted and sent directly to your wallet within the same transaction block. No waiting, no intermediaries.',
  },
] as const;

function BuyOverview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="mt-10">
      {/* Divider */}
      <div className="border-t border-white/[0.06] mb-8" />

      {/* Eyebrow */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-6">
        How it works
      </p>

      {/* Steps */}
      <div className="space-y-5 mb-8">
        {HOW_IT_WORKS.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{
              delay: 0.08 + i * 0.07,
              type: 'spring',
              stiffness: 260,
              damping: 26,
            }}
            className="flex items-start gap-4"
          >
            <span className="num text-[11px] font-black text-slate-400 dark:text-[#4a4a6a] w-6 flex-shrink-0 mt-0.5 tabular-nums">
              {step.n}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                {step.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-[#6b6b88] leading-relaxed">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contract reference card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.38, type: 'spring', stiffness: 260, damping: 26 }}
        className="p-4 rounded-2xl border border-black/[0.18] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={14} className="text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-[#8b8ba8]">
            Contract reference
          </span>
        </div>
        <div className="space-y-2">
          <ContractField label="USBT Contract" value={CONTRACTS.STABLE} />
          <ContractField label="Function" value="buyTokens · 0x3610724e" />
        </div>
        <a
          href={TRONSCAN_CONTRACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400
            hover:text-cyan-700 dark:hover:text-cyan-300 mt-3 transition-colors"
        >
          View on TronScan
          <ArrowSquareOut size={11} />
        </a>
      </motion.div>
    </div>
  );
}

function ContractField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a4a6a] w-24 flex-shrink-0">
        {label}
      </span>
      <span className="font-mono text-xs text-slate-500 dark:text-[#6b6b88] truncate">{value}</span>
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  sublabel,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left
        transition-all duration-200 group
        ${active
          ? 'text-white'
          : 'text-slate-500 hover:text-white'
        }
      `}
      style={{
        background: active ? 'rgba(6,182,212,0.10)' : 'transparent',
        border: active ? '1px solid rgba(6,182,212,0.22)' : '1px solid transparent',
      }}
    >
      <div
        className={`
          w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
          transition-colors duration-200
          ${active
            ? 'text-cyan-400'
            : 'text-slate-600 group-hover:text-slate-400'
          }
        `}
        style={{
          background: active
            ? 'rgba(6,182,212,0.12)'
            : 'rgba(255,255,255,0.04)',
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`}>
          {label}
        </p>
        <p className="text-[10px] text-slate-600 group-hover:text-slate-500 transition-colors">
          {sublabel}
        </p>
      </div>
      {active && (
        <div
          className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-auto flex-shrink-0"
          style={{ boxShadow: '0 0 6px rgba(6,182,212,0.8)' }}
        />
      )}
    </button>
  );
}

// ─── Mobile Tab Button ────────────────────────────────────────────────────────

function MobileTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
        text-sm font-semibold transition-all duration-200
        ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
      `}
      style={{
        background: active ? 'rgba(6,182,212,0.10)' : 'transparent',
        border: active ? '1px solid rgba(6,182,212,0.22)' : '1px solid transparent',
      }}
    >
      <span className={active ? 'text-cyan-400' : 'text-slate-600'}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Buy() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('buy');
  const [prefillAmount, setPrefillAmount] = useState<number | null>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const handleOfferSelect = (minUsdt: number) => {
    setPrefillAmount(minUsdt);
    setActiveTab('buy');
    setTimeout(() => {
      portalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="min-h-[100dvh] pt-24 pb-20 px-4 sm:px-6"
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Back link (mobile only, sits above layout) ── */}
        <Link
          to="/"
          className="inline-flex lg:hidden items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-5"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/* ── Bonus Offers Banner ── */}
        <AnimatePresence>
          {activeTab === 'buy' && (
            <motion.div
              key="offers-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Gift size={13} className="text-slate-400 dark:text-[#5a5a7a]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-[#5a5a7a]">
                  Bonus Offers
                </p>
              </div>
              <OfferCarousel onSelect={handleOfferSelect} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Layout: sidebar + main ── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

          {/* ─────────────────────────────────────────────
              SIDEBAR (desktop only)
          ───────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 sticky top-24">
            {/* Back */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors mb-7"
            >
              <ArrowLeft size={12} />
              Back to home
            </Link>

            {/* Section label */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600 mb-3 px-1">
              Get USBT
            </p>

            {/* Nav items */}
            <div className="flex flex-col gap-1.5">
              <NavItem
                icon={<DownloadSimple size={17} />}
                label="Buy USBT"
                sublabel="USDT → USBT"
                active={activeTab === 'buy'}
                onClick={() => setActiveTab('buy')}
              />
              <NavItem
                icon={<PaperPlaneTilt size={17} />}
                label="Withdraw USBT"
                sublabel="Send to any address"
                active={activeTab === 'withdraw'}
                onClick={() => setActiveTab('withdraw')}
              />
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-white/[0.05]" />

            {/* Network info */}
            <div
              className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  style={{ boxShadow: '0 0 5px rgba(52,211,153,0.7)' }}
                />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Network
                </span>
              </div>
              <p className="text-xs font-semibold text-white mb-0.5">TRON Mainnet</p>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Only USDT on TRON is supported. Ensure your wallet is on TRON.
              </p>
            </div>

            {/* Contract ref */}
            <div className="mt-4 flex items-center gap-2">
              <ShieldCheck size={11} className="text-cyan-500 flex-shrink-0" />
              <span className="text-[10px] text-slate-600">
                Audited smart contract
              </span>
            </div>
          </aside>

          {/* ─────────────────────────────────────────────
              MAIN CONTENT
          ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 w-full">

            {/* Mobile Tabs */}
            <div
              className="flex lg:hidden gap-1.5 mb-5 p-1 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <MobileTab
                icon={<DownloadSimple size={15} />}
                label="Buy USBT"
                active={activeTab === 'buy'}
                onClick={() => setActiveTab('buy')}
              />
              <MobileTab
                icon={<PaperPlaneTilt size={15} />}
                label="Withdraw"
                active={activeTab === 'withdraw'}
                onClick={() => setActiveTab('withdraw')}
              />
            </div>

            {/* Page heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 280, damping: 28 }}
              className="mb-6"
            >
              <AnimatePresence mode="wait">
                {activeTab === 'buy' ? (
                  <motion.div
                    key="heading-buy"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600 mb-2">
                      Buy
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-tight">
                      Get USBT{' '}
                      <span
                        className="bg-clip-text text-transparent"
                        style={{
                          backgroundImage: 'linear-gradient(135deg, #67e8f9 0%, #06b6d4 60%)',
                        }}
                      >
                        with USDT.
                      </span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm">
                      Select a stablecoin and network, connect your wallet, then enter the amount.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="heading-withdraw"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600 mb-2">
                      Withdraw
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-tight">
                      Send USBT{' '}
                      <span
                        className="bg-clip-text text-transparent"
                        style={{
                          backgroundImage: 'linear-gradient(135deg, #67e8f9 0%, #06b6d4 60%)',
                        }}
                      >
                        anywhere.
                      </span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm">
                      Transfer USBT to any TRON address. Withdrawals are available on TRON only.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Portal */}
            <AnimatePresence mode="wait">
              {activeTab === 'buy' ? (
                <motion.div
                  key="buy-portal"
                  ref={portalRef}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <BuyPortal prefillAmount={prefillAmount} />
                  <BuyOverview />
                </motion.div>
              ) : (
                <motion.div
                  key="withdraw-panel"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <WithdrawPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
