import { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowSquareOut,
  ShieldCheck,
  Lightning,
  Anchor,
  CaretLeft,
  CaretRight,
  Info,
} from '@phosphor-icons/react';
import SellPortal from '../components/portal/SellPortal';
import { SUNSWAP_PAIR_URL, CONTRACTS } from '../constants/contracts';
import { useCountUp } from '../hooks/useCountUp';
import { useTheme } from '../hooks/useTheme';

/* ─────────────────────────────────────────────────────────────────────────────
   Redeem Highlights — carousel cards
───────────────────────────────────────────────────────────────────────────── */

const HIGHLIGHTS = [
  {
    id: 'instant',
    label: 'Instant Liquidity',
    sublabel: 'No lockup, no waiting',
    body: 'Sell USBT into $4.2M+ of pooled USBT/USDT liquidity. Transactions settle on Tron in seconds.',
    icon: Lightning,
    gradient: 'from-cyan-500/[0.13] to-sky-600/[0.06]',
    border: 'border-cyan-500/25',
    activeBorder: 'border-cyan-400/60',
    accent: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    glow: 'shadow-[0_0_32px_rgba(6,182,212,0.15)]',
    stat: '$4.2M+ Pool',
  },
  {
    id: 'near-peg',
    label: 'Near-Peg Exit',
    sublabel: 'Always redeemable',
    body: 'Trade close to 1:1 with minimal slippage on standard amounts. Price impact is shown before you confirm.',
    icon: Anchor,
    gradient: 'from-emerald-500/[0.12] to-teal-600/[0.05]',
    border: 'border-emerald-500/25',
    activeBorder: 'border-emerald-400/60',
    accent: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    glow: 'shadow-[0_0_32px_rgba(16,185,129,0.14)]',
    stat: '~1:1 Rate',
  },
  {
    id: 'non-custodial',
    label: 'Non-Custodial',
    sublabel: 'Your wallet, always',
    body: 'USDT is sent directly to your wallet by the SunSwap pool contract. No intermediary holds your funds.',
    icon: ShieldCheck,
    gradient: 'from-violet-500/[0.12] to-purple-600/[0.05]',
    border: 'border-violet-500/25',
    activeBorder: 'border-violet-400/60',
    accent: 'text-violet-400',
    badgeBg: 'bg-violet-500/15',
    badgeText: 'text-violet-300',
    glow: 'shadow-[0_0_32px_rgba(139,92,246,0.14)]',
    stat: 'Self-Custody',
  },
] as const;

function RedeemHighlightsCarousel() {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = HIGHLIGHTS.length;

  const go = (next: number) => {
    setDirection(next > idx ? 1 : -1);
    setIdx(next);
  };
  const prev = () => go((idx - 1 + total) % total);
  const next = () => go((idx + 1) % total);

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % total);
    }, 4000);
    return () => clearInterval(t);
  }, [total]);

  const highlight = HIGHLIGHTS[idx];
  const Icon = highlight.icon;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: 0.96 }),
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative flex-shrink-0"
          style={{ boxShadow: '0 0 6px rgba(52,211,153,0.6)' }}
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring opacity-70" />
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-[#5a5a7a]">
          Redeem Benefits
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={highlight.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`relative w-full rounded-2xl border p-5 bg-gradient-to-br ${highlight.gradient} ${highlight.border} ${highlight.glow}`}
          >
            {/* Top row */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${highlight.badgeBg}`}>
                <Icon size={22} weight="fill" className={highlight.accent} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className={`text-base font-bold ${highlight.accent}`}>{highlight.label}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${highlight.badgeBg} ${highlight.badgeText}`}>
                    {highlight.stat}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-[#6b6b88]">{highlight.sublabel}</p>
              </div>
            </div>

            {/* Body */}
            <p className="text-sm text-slate-500 dark:text-[#8b8ba8] leading-relaxed">
              {highlight.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav row */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex gap-1.5">
          {HIGHLIGHTS.map((h, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-200 ${
                i === idx
                  ? `w-5 h-1.5 ${HIGHLIGHTS[i].badgeBg}`
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

/* ─────────────────────────────────────────────────────────────────────────────
   Numbers section
───────────────────────────────────────────────────────────────────────────── */

interface StatItem {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  sub: string;
  countTo?: number;
  decimals?: number;
  highlight?: boolean;
}

const NUMBERS: StatItem[] = [
  {
    label: 'Pool Liquidity',
    prefix: '$',
    value: '4.2',
    countTo: 4.2,
    decimals: 1,
    suffix: 'M+',
    sub: 'Available to sell into',
    highlight: true,
  },
  {
    label: 'Token Price',
    prefix: '$',
    value: '1.000',
    countTo: 1,
    decimals: 3,
    suffix: ' USDT',
    sub: 'Stable peg maintained',
  },
  {
    label: 'Transactions',
    value: '127,400',
    countTo: 127400,
    suffix: '+',
    sub: 'Processed on-chain',
  },
  {
    label: 'Settlement',
    prefix: '<',
    value: '3',
    suffix: 's',
    sub: 'Seconds to receive USDT',
  },
];

function StatCountUp({ stat, inView, index }: { stat: StatItem; inView: boolean; index: number }) {
  const uid = useId();
  const counted = useCountUp(stat.countTo ?? 0, inView && stat.countTo !== undefined, {
    decimals: stat.decimals ?? 0,
    delay: index * 0.09,
    duration: 1.6,
  });
  const display = stat.countTo !== undefined ? counted : stat.value;
  return (
    <span key={uid} className="font-black tabular-nums">
      {stat.prefix && <span>{stat.prefix}</span>}
      {display}
      {stat.suffix && (
        <span className="text-xl font-medium text-slate-400 dark:text-[#6b6b88] ml-0.5">
          {stat.suffix}
        </span>
      )}
    </span>
  );
}

function SparklineStable({ inView }: { inView: boolean }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `sell-clip-${uid}`;
  const gradId = `sell-grad-${uid}`;
  const DATA = [1.001, 0.999, 1.000, 1.002, 0.998, 1.001, 1.000, 0.999, 1.001, 1.002, 0.998, 1.000, 1.001, 0.999, 1.000, 1.001, 0.998, 1.000, 1.001, 1.000];
  const SW = 280; const SH = 36;
  const minV = Math.min(...DATA); const maxV = Math.max(...DATA); const rangeV = maxV - minV || 0.001; const pad = 4;
  const sx = (i: number) => (i / (DATA.length - 1)) * SW;
  const sy = (v: number) => SH - pad - ((v - minV) / rangeV) * (SH - pad * 2);
  const pts = DATA.map((v, i) => [sx(i), sy(v)] as [number, number]);
  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]; const [x1, y1] = pts[i]; const cpx = (x0 + x1) / 2;
    line += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
  }
  const area = line + ` L ${pts[pts.length - 1][0]} ${SH} L ${pts[0][0]} ${SH} Z`;
  return (
    <div className="mt-2 overflow-hidden" style={{ height: SH }}>
      <svg viewBox={`0 0 ${SW} ${SH}`} width="100%" height={SH} preserveAspectRatio="none">
        <defs>
          <clipPath id={clipId}>
            <motion.rect x={0} y={0} height={SH}
              initial={{ width: 0 }}
              animate={inView ? { width: SW } : { width: 0 }}
              transition={{ duration: 1.2, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
            />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path d={area} fill={`url(#${gradId})`} />
          <path d={line} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Pool field helpers
───────────────────────────────────────────────────────────────────────────── */

function PoolField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a4a6a] w-14 flex-shrink-0">
        {label}
      </span>
      <span className="font-mono text-xs text-slate-500 dark:text-[#6b6b88] truncate">{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */

export default function Sell() {
  const infoRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const infoInView = useInView(infoRef, { once: true });
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="min-h-[100dvh] pt-28 pb-24 px-6"
    >
      <div className="max-w-6xl mx-auto relative">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 280, damping: 28 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-[#6b6b88] hover:text-slate-900 dark:hover:text-white transition-colors mb-10"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </motion.div>

        {/*
          3-item grid (mirrors Buy.tsx):
          Desktop: col 1 = highlights (row 1) + info (row 2)  |  col 2 = portal (rows 1–2)
          Mobile:  highlights → portal → info
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-x-12 gap-y-8 items-start">

          {/* ── Highlights Carousel — mobile: 1st · desktop: col 1 row 1 ── */}
          <div
            ref={infoRef}
            className="order-1 lg:order-none lg:col-start-1 lg:row-start-1"
          >
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={infoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <RedeemHighlightsCarousel />
            </motion.div>
          </div>

          {/* ── Portal — mobile: 2nd · desktop: col 2 rows 1–2 ── */}
          <div className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 w-full">
            <SellPortal />
          </div>

          {/* ── Info — mobile: 3rd · desktop: col 1 row 2 ── */}
          <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={infoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.05 }}
              className="text-center lg:text-left"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-4">
                Redeem
              </p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight mb-5">
                Sell USBT.
                <br />
                <span
                  className={`bg-clip-text text-transparent ${
                    isDark
                      ? 'bg-gradient-to-br from-cyan-300 via-cyan-500 to-sky-600'
                      : 'bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800'
                  }`}
                >
                  Back to USDT.
                </span>
              </h1>
              <p className="text-slate-500 dark:text-[#8b8ba8] leading-relaxed mb-8 max-w-[400px] mx-auto lg:mx-0">
                Exit USBT back to USDT at any time through the SunSwap v2 liquidity pool.
                Output is determined by live on-chain reserves.
              </p>

              {/* How it works */}
              <div className="space-y-4 max-w-sm mx-auto lg:mx-0">
                {[
                  {
                    n: '01',
                    title: 'Connect wallet',
                    desc: 'Connect your TronLink wallet containing USBT.',
                  },
                  {
                    n: '02',
                    title: 'Enter USBT amount',
                    desc: "Enter how many USBT to sell. Preview the USDT you'll receive from the pool.",
                  },
                  {
                    n: '03',
                    title: 'Approve & swap',
                    desc: 'Approve the USBT transfer to the router, then confirm the swap.',
                  },
                  {
                    n: '04',
                    title: 'Receive USDT',
                    desc: 'USDT is sent directly to your wallet from the SunSwap pool contract.',
                  },
                ].map((step, i) => (
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, x: -16 }}
                    animate={infoInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      delay: 0.1 + i * 0.07,
                      type: 'spring',
                      stiffness: 260,
                      damping: 26,
                    }}
                    className="flex items-start gap-4 text-left"
                  >
                    <span className="num text-[11px] font-black text-slate-400 dark:text-[#4a4a6a] w-6 flex-shrink-0 mt-0.5">
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

              {/* Pool info */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={infoInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.42, type: 'spring', stiffness: 260, damping: 26 }}
                className="mt-8 p-4 rounded-2xl border border-black/[0.18] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02] max-w-sm mx-auto lg:mx-0 text-left"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-[#8b8ba8]">
                    Pool reference
                  </span>
                </div>
                <div className="space-y-2">
                  <PoolField label="Pair" value={CONTRACTS.PAIR} />
                  <PoolField label="Router" value={CONTRACTS.ROUTER} />
                  <PoolField label="DEX" value="SunSwap v2" />
                </div>
                <a
                  href={SUNSWAP_PAIR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mt-3 transition-colors"
                >
                  View pair on SunSwap
                  <ArrowSquareOut size={11} />
                </a>
              </motion.div>

              {/* Slippage note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={infoInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.52 }}
                className="mt-4 max-w-sm mx-auto lg:mx-0 flex items-start gap-2 text-[11px] text-slate-400 dark:text-[#4a4a6a] text-left"
              >
                <Info size={12} className="flex-shrink-0 mt-0.5 text-amber-500/60" />
                <span>
                  Default slippage tolerance is 0.5%. For large trades or low-liquidity
                  conditions, actual slippage may be higher. A warning appears when price
                  impact exceeds 2%.
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            Numbers that speak for themselves
        ══════════════════════════════════════════════════════════════════ */}
        <section ref={statsRef} className="mt-20 relative">
          {/* Divider */}
          <div className="border-t border-black/[0.16] dark:border-white/[0.06]" />

          {/* Subtle radial glow */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(6,182,212,0.04) 0%, transparent 70%)',
            }}
          />

          <div className="relative pt-16 pb-4">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={statsInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="mb-10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
                Protocol snapshot
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-slate-900 dark:text-white">
                  Numbers that speak
                  <br className="hidden sm:block" /> for themselves.
                </h2>
                <a
                  href={SUNSWAP_PAIR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex-shrink-0"
                >
                  View liquidity pool
                  <ArrowSquareOut size={13} />
                </a>
              </div>
            </motion.div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {NUMBERS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: i * 0.09,
                    type: 'spring',
                    stiffness: 260,
                    damping: 28,
                  }}
                  className={`
                    relative rounded-3xl p-6 sm:p-8 border transition-all duration-300 overflow-hidden
                    ${
                      stat.highlight
                        ? 'border-cyan-500/25 bg-cyan-500/[0.05] hover:border-cyan-500/35 hover:bg-cyan-500/[0.08]'
                        : 'border-black/[0.18] dark:border-white/[0.07] bg-black/[0.025] dark:bg-white/[0.025] hover:border-black/[0.12] dark:hover:border-white/[0.12] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }
                  `}
                  style={{
                    boxShadow: stat.highlight
                      ? 'inset 0 1px 0 rgba(6,182,212,0.12)'
                      : undefined,
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-[#4a4a6a] mb-3">
                    {stat.label}
                  </p>

                  <div
                    className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mb-3 break-words ${
                      stat.highlight
                        ? 'text-cyan-600 dark:text-cyan-300'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    <StatCountUp stat={stat} inView={statsInView} index={i} />
                  </div>

                  <p className="text-xs text-slate-400 dark:text-[#6b6b88]">{stat.sub}</p>

                  {/* Sparkline on Pool Liquidity card */}
                  {stat.highlight && <SparklineStable inView={statsInView} />}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
}
