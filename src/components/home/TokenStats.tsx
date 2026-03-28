'use client';
import { useId, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { useCountUp } from '../../hooks/useCountUp';
import { SUNSWAP_PAIR_URL } from '../../constants/contracts';

/* ─────────────────────────────────────────────────────────────────────────────
   PriceSparkline — subtle stable peg sparkline with clip reveal
───────────────────────────────────────────────────────────────────────────── */

const SPARKLINE_DATA = [
  1.001, 0.999, 1.000, 1.002, 0.998, 1.001, 1.000, 0.999,
  1.001, 1.002, 0.998, 1.000, 1.001, 0.999, 1.000, 1.001,
  0.998, 1.000, 1.001, 1.000,
];

function PriceSparkline({ inView }: { inView: boolean }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `spark-clip-${uid}`;
  const gradId = `spark-grad-${uid}`;

  const SW = 300;
  const SH = 40;
  const minV = Math.min(...SPARKLINE_DATA);
  const maxV = Math.max(...SPARKLINE_DATA);
  const rangeV = maxV - minV || 0.001;
  const pad = 4;

  function sx(i: number) { return (i / (SPARKLINE_DATA.length - 1)) * SW; }
  function sy(v: number) { return SH - pad - ((v - minV) / rangeV) * (SH - pad * 2); }

  const pts = SPARKLINE_DATA.map((v, i) => [sx(i), sy(v)] as [number, number]);
  let linePath = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cpx = (x0 + x1) / 2;
    linePath += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
  }
  const areaPath = linePath + ` L ${pts[pts.length - 1][0]} ${SH} L ${pts[0][0]} ${SH} Z`;

  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="flex-1 overflow-hidden" style={{ height: SH }}>
        <svg viewBox={`0 0 ${SW} ${SH}`} width="100%" height={SH} preserveAspectRatio="none">
          <defs>
            <clipPath id={clipId}>
              <motion.rect
                x={0} y={0} height={SH}
                initial={{ width: 0 }}
                animate={inView ? { width: SW } : { width: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
              />
            </clipPath>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <path d={areaPath} fill={`url(#${gradId})`} />
            <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 1.9, type: 'spring', stiffness: 360, damping: 22 }}
        className="text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full flex-shrink-0"
        style={{
          background: 'rgba(52,211,153,0.1)',
          border: '1px solid rgba(52,211,153,0.25)',
          color: '#34d399',
        }}
      >
        STABLE
      </motion.span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stat data — 4 primary stats (editorial style)
───────────────────────────────────────────────────────────────────────────── */

interface StatItem {
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  sub?: string;
  live?: boolean;
  highlight?: boolean;
  countTo?: number;
  decimals?: number;
}

const STATS: StatItem[] = [
  {
    label: 'Token Price',
    prefix: '$',
    value: '1.000',
    countTo: 1,
    decimals: 3,
    suffix: ' USDT',
    sub: 'Peg maintained',
    live: true,
    highlight: true,
  },
  {
    label: 'Total Liquidity',
    prefix: '$',
    value: '4.2M',
    countTo: 4.2,
    decimals: 1,
    suffix: 'M+',
    sub: 'Pooled across networks',
    live: true,
  },
  {
    label: 'Networks Active',
    value: '9',
    countTo: 9,
    suffix: '+',
    sub: 'Major blockchain ecosystems',
  },
  {
    label: 'Transactions',
    value: '127,400',
    countTo: 127400,
    suffix: '+',
    sub: 'Processed on-chain',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CountUpNumber
───────────────────────────────────────────────────────────────────────────── */

function CountUpNumber({ stat, inView, index }: { stat: StatItem; inView: boolean; index: number }) {
  const counted = useCountUp(stat.countTo ?? 0, inView && stat.countTo !== undefined, {
    decimals: stat.decimals ?? 0,
    delay: index * 0.08,
    duration: 1.6,
  });

  const displayValue = stat.countTo !== undefined ? counted : stat.value;

  return (
    <span className="font-black tabular-nums">
      {stat.prefix && <span>{stat.prefix}</span>}
      {displayValue}
      {stat.suffix && stat.value !== '—' && (
        <span className="text-xl font-medium text-slate-400 dark:text-[#6b6b88] ml-0.5">
          {stat.suffix}
        </span>
      )}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ContractRow
───────────────────────────────────────────────────────────────────────────── */

function ContractRow({ label, address }: { label: string; address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-black/[0.16] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] hover:border-black/[0.10] dark:hover:border-white/[0.10] transition-all duration-200 text-left w-full group"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-[#4a4a6a] w-28 flex-shrink-0">
        {label}
      </span>
      <span className="font-mono text-xs text-slate-500 dark:text-[#6b6b88] group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
        {address}
      </span>
      <span className="ml-auto text-[10px] text-slate-300 dark:text-[#3f3f52] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex-shrink-0">
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TokenStats
───────────────────────────────────────────────────────────────────────────── */

export default function TokenStats() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative">
      {/* Top border line */}
      <div className="border-t border-black/[0.16] dark:border-white/[0.06]" />

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="mb-12"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
            Protocol snapshot
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-slate-900 dark:text-white">
              Numbers that speak<br className="hidden sm:block" /> for themselves.
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

        {/* Stats grid — 4 editorial stat blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                delay: i * 0.09,
                type: 'spring',
                stiffness: 260,
                damping: 28,
              }}
              className={`
                relative rounded-3xl p-8 border transition-all duration-300
                ${stat.highlight
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
              {/* Live badge */}
              {stat.live && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring opacity-70" />
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a4a6a]">
                    Live
                  </span>
                </div>
              )}

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-[#4a4a6a] mb-3">
                {stat.label}
              </p>

              <div
                className={`text-4xl md:text-5xl font-black tracking-tight leading-none mb-3 ${
                  stat.highlight ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-900 dark:text-white'
                }`}
              >
                <CountUpNumber stat={stat} inView={inView} index={i} />
              </div>

              {stat.sub && (
                <p className="text-xs text-slate-400 dark:text-[#6b6b88]">{stat.sub}</p>
              )}

              {/* Sparkline inside the highlighted Token Price card */}
              {stat.highlight && <PriceSparkline inView={inView} />}
            </motion.div>
          ))}
        </div>

        {/* Contract addresses strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 260, damping: 26 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <ContractRow label="USBT Contract" address="TA22JDzS7HDQPYM38Y4Wsy9N3hLRBSUkGv" />
          <ContractRow label="Collateral Reserve" address="TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" />
        </motion.div>
      </div>
    </section>
  );
}
