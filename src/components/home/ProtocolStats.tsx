'use client';
import { useId, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendUp } from '@phosphor-icons/react';
import { useTheme } from '../../hooks/useTheme';
import { useCountUp } from '../../hooks/useCountUp';

/* ─────────────────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────────────────── */

const GROWTH_METRICS = [
  { label: 'Weekly Liquidity Growth', period: '7-day change',       prefix: '+', countTo: 12.4, decimals: 1, suffix: '%' },
  { label: 'Transaction Success Rate', period: 'All-time average',  prefix: '',  countTo: 99.7, decimals: 1, suffix: '%' },
  { label: '30-Day Volume',            period: 'Rolling 30 days',   prefix: '$', countTo: 2.1,  decimals: 1, suffix: 'M+' },
  { label: 'Active Wallet Growth',     period: 'Month over month',  prefix: '+', countTo: 8.3,  decimals: 1, suffix: '%' },
];

const NETWORK_DIST = [
  { name: 'TRON',      label: 'TRX', pct: 38, color: '#06b6d4' },
  { name: 'Ethereum',  label: 'ETH', pct: 28, color: '#6366f1' },
  { name: 'BNB Chain', label: 'BNB', pct: 18, color: '#f59e0b' },
  { name: 'Solana',    label: 'SOL', pct: 8,  color: '#8b5cf6' },
  { name: 'Others',    label: '—',   pct: 8,  color: '#475569' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   VolumeAreaChart — 30-day animated area chart
───────────────────────────────────────────────────────────────────────────── */

// Simulated 30-day data growing from ~0.8M to ~2.6M
const VOLUME_DATA = [
  0.82, 0.88, 0.91, 0.95, 0.99, 1.02, 1.08, 1.12, 1.18, 1.15,
  1.22, 1.28, 1.35, 1.31, 1.40, 1.48, 1.55, 1.62, 1.58, 1.70,
  1.78, 1.85, 1.92, 2.01, 2.08, 2.18, 2.28, 2.38, 2.50, 2.61,
];

const CW = 560;
const CH = 140;
const PAD_L = 52;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 28;
const CHART_W = CW - PAD_L - PAD_R;
const CHART_H = CH - PAD_T - PAD_B;
const Y_TICKS = [0, 0.5, 1.0, 1.5, 2.0, 2.5];
const DATA_MIN = 0;
const DATA_MAX = 2.8;

function toX(i: number) {
  return PAD_L + (i / (VOLUME_DATA.length - 1)) * CHART_W;
}
function toY(v: number) {
  return PAD_T + CHART_H - ((v - DATA_MIN) / (DATA_MAX - DATA_MIN)) * CHART_H;
}

function buildPath(data: number[], close = false): string {
  const pts = data.map((v, i) => [toX(i), toY(v)] as [number, number]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cpx = (x0 + x1) / 2;
    d += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
  }
  if (close) {
    const last = pts[pts.length - 1];
    const first = pts[0];
    d += ` L ${last[0]} ${PAD_T + CHART_H} L ${first[0]} ${PAD_T + CHART_H} Z`;
  }
  return d;
}

function VolumeAreaChart({ inView }: { inView: boolean }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `vol-clip-${uid}`;
  const gradId = `vol-grad-${uid}`;
  const lastPt = [toX(VOLUME_DATA.length - 1), toY(VOLUME_DATA[VOLUME_DATA.length - 1])];

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${CW} ${CH}`}
        className="w-full"
        style={{ height: CH, maxHeight: CH }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Clip rect that expands left-to-right */}
          <clipPath id={clipId}>
            <motion.rect
              x={PAD_L}
              y={0}
              height={CH}
              initial={{ width: 0 }}
              animate={inView ? { width: CHART_W + PAD_R } : { width: 0 }}
              transition={{ duration: 1.6, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </clipPath>
          {/* Cyan area gradient */}
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines — fade in */}
        {Y_TICKS.map((tick) => {
          const y = toY(tick);
          if (y < PAD_T - 2 || y > PAD_T + CHART_H + 2) return null;
          return (
            <motion.g
              key={tick}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <line
                x1={PAD_L}
                y1={y}
                x2={CW - PAD_R}
                y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="3 4"
                className="text-slate-300 dark:text-white/[0.07]"
              />
              <text
                x={PAD_L - 6}
                y={y + 3.5}
                textAnchor="end"
                fontSize="8"
                className="fill-slate-400 dark:fill-[#4a4a6a]"
              >
                ${tick.toFixed(1)}M
              </text>
            </motion.g>
          );
        })}

        {/* X-axis labels */}
        {[0, 9, 19, 29].map((idx, li) => {
          const labels = ['Day 1', 'Day 10', 'Day 20', 'Day 30'];
          return (
            <motion.text
              key={idx}
              x={toX(idx)}
              y={CH - 4}
              textAnchor="middle"
              fontSize="8"
              className="fill-slate-400 dark:fill-[#4a4a6a]"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + li * 0.05 }}
            >
              {labels[li]}
            </motion.text>
          );
        })}

        {/* Area fill + line — clipped */}
        <g clipPath={`url(#${clipId})`}>
          {/* Area */}
          <path
            d={buildPath(VOLUME_DATA, true)}
            fill={`url(#${gradId})`}
          />
          {/* Line */}
          <path
            d={buildPath(VOLUME_DATA, false)}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Endpoint dot — pops in after clip finishes */}
        <motion.circle
          cx={lastPt[0]}
          cy={lastPt[1]}
          r={4}
          fill="#06b6d4"
          stroke="#07070e"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ delay: 2.2, type: 'spring', stiffness: 400, damping: 18 }}
          style={{ originX: `${lastPt[0]}px`, originY: `${lastPt[1]}px` }}
        />
        {/* Pulse ring around endpoint */}
        <motion.circle
          cx={lastPt[0]}
          cy={lastPt[1]}
          r={7}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          strokeOpacity="0.35"
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ delay: 2.3, type: 'spring', stiffness: 300, damping: 20 }}
          style={{ originX: `${lastPt[0]}px`, originY: `${lastPt[1]}px` }}
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DonutChart — network distribution
───────────────────────────────────────────────────────────────────────────── */

const DONUT_R = 52;
const DONUT_CX = 80;
const DONUT_CY = 80;
const DONUT_SW = 18;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_R; // ~326.7

function DonutChart({ inView }: { inView: boolean }) {
  // Compute cumulative percentages for offset positioning
  let cumulative = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="flex-shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Background track */}
          <circle
            cx={DONUT_CX}
            cy={DONUT_CY}
            r={DONUT_R}
            fill="none"
            stroke="currentColor"
            strokeWidth={DONUT_SW}
            className="text-slate-100 dark:text-white/[0.05]"
          />

          {NETWORK_DIST.map((seg, i) => {
            const arcLen = (seg.pct / 100) * CIRCUMFERENCE;
            const offset = -(cumulative / 100) * CIRCUMFERENCE;
            cumulative += seg.pct;

            return (
              <motion.circle
                key={seg.name}
                cx={DONUT_CX}
                cy={DONUT_CY}
                r={DONUT_R}
                fill="none"
                stroke={seg.color}
                strokeWidth={DONUT_SW}
                strokeLinecap="butt"
                transform={`rotate(-90, ${DONUT_CX}, ${DONUT_CY})`}
                strokeDashoffset={offset}
                initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                animate={
                  inView
                    ? { strokeDasharray: `${arcLen} ${CIRCUMFERENCE}` }
                    : { strokeDasharray: `0 ${CIRCUMFERENCE}` }
                }
                transition={{
                  delay: 0.5 + i * 0.15,
                  duration: 0.6,
                  ease: 'easeOut',
                }}
              />
            );
          })}

          {/* Center text */}
          <motion.text
            x={DONUT_CX}
            y={DONUT_CY - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="18"
            fontWeight="900"
            fill="currentColor"
            className="text-slate-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.4 }}
          >
            9+
          </motion.text>
          <motion.text
            x={DONUT_CX}
            y={DONUT_CY + 12}
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            letterSpacing="0.12em"
            fill="currentColor"
            className="text-slate-400 dark:text-[#4a4a6a]"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.6, duration: 0.4 }}
          >
            CHAINS
          </motion.text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        {NETWORK_DIST.map((seg, i) => (
          <motion.div
            key={seg.name}
            initial={{ opacity: 0, x: 16 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
            transition={{ delay: 0.6 + i * 0.12, type: 'spring', stiffness: 300, damping: 26 }}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: seg.color }}
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-[#c8c8e0] truncate">
                {seg.name}
              </span>
              {seg.label !== '—' && (
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-600/60 dark:text-cyan-500/55">
                  {seg.label}
                </span>
              )}
            </div>
            <span className="text-sm font-black tabular-nums text-slate-900 dark:text-white flex-shrink-0">
              {seg.pct}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GrowthRow — one metric with count-up value
───────────────────────────────────────────────────────────────────────────── */

function GrowthRow({
  metric,
  inView,
  index,
  isDark,
}: {
  metric: typeof GROWTH_METRICS[0];
  inView: boolean;
  index: number;
  isDark: boolean;
}) {
  const counted = useCountUp(metric.countTo, inView, {
    decimals: metric.decimals,
    delay: 0.15 + index * 0.1,
    duration: 1.4,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: 0.12 + index * 0.09, type: 'spring', stiffness: 300, damping: 26 }}
      className="flex items-center justify-between gap-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.05] last:border-0"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: isDark ? 'rgba(6,182,212,0.1)' : 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.18)',
          }}
        >
          <TrendUp size={13} className="text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700 dark:text-[#c8c8e0] leading-none truncate">
            {metric.label}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-[#4a4a6a] mt-0.5">{metric.period}</p>
        </div>
      </div>

      <span className="text-base font-black text-cyan-600 dark:text-cyan-300 tabular-nums flex-shrink-0">
        {metric.prefix}{counted}{metric.suffix}
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ProtocolStats
───────────────────────────────────────────────────────────────────────────── */

export default function ProtocolStats() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  };

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-6 py-24">
      {/* Header — blur + slide up */}
      <motion.div
        initial={{ opacity: 0, y: 32, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="mb-10 max-w-xl text-center md:text-left mx-auto md:mx-0"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
          Proof on the chain
        </p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-slate-900 dark:text-white">
          Transparent activity.
          <br />
          Publicly recorded.
        </h2>
        <p className="mt-4 text-base text-slate-500 dark:text-[#8b8ba8] max-w-[48ch]">
          Every transaction, every movement — verifiable by anyone.
        </p>
      </motion.div>

      {/* Editorial callout strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ delay: 0.06, type: 'spring', stiffness: 260, damping: 26 }}
        className="grid grid-cols-3 mb-8 rounded-2xl overflow-hidden border border-black/[0.10] dark:border-white/[0.07]"
      >
        {[
          { value: '$2.6M', label: 'Peak daily volume' },
          { value: '99.7%', label: 'Success rate' },
          { value: '+218%', label: 'Growth vs prior period' },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`px-5 py-4 ${i < 2 ? 'border-r border-black/[0.10] dark:border-white/[0.07]' : ''} bg-black/[0.02] dark:bg-white/[0.02]`}
          >
            <p className="text-lg font-black tabular-nums text-slate-900 dark:text-white leading-none mb-1">
              {item.value}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a4a6a]">
              {item.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Volume chart card — full width */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 26 }}
        className="rounded-[1.5rem] p-[1px] mb-6"
        style={{ background: 'var(--bezel-border)' }}
      >
        <div className="rounded-[calc(1.5rem-1px)] p-6" style={cardStyle}>
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#4a4a6a]">
              30-Day Volume Growth
            </p>
          </div>
          <VolumeAreaChart inView={inView} />
        </div>
      </motion.div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Growth metrics (slides from left) */}
        <motion.div
          initial={{ opacity: 0, x: -60, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 26 }}
          className="rounded-[1.5rem] p-[1px]"
          style={{ background: 'var(--bezel-border)' }}
        >
          <div className="h-full rounded-[calc(1.5rem-1px)] p-6" style={cardStyle}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#4a4a6a] mb-5">
              Growth Indicators
            </p>
            <div className="flex flex-col">
              {GROWTH_METRICS.map((m, i) => (
                <GrowthRow key={m.label} metric={m} inView={inView} index={i} isDark={isDark} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right — Donut chart (slides from right) */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.16, type: 'spring', stiffness: 260, damping: 26 }}
          className="rounded-[1.5rem] p-[1px]"
          style={{ background: 'var(--bezel-border)' }}
        >
          <div className="h-full rounded-[calc(1.5rem-1px)] p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#4a4a6a]">
                Network Distribution
              </p>
              <span className="text-[10px] font-medium text-slate-400 dark:text-[#4a4a6a]">
                % of total volume
              </span>
            </div>
            <DonutChart inView={inView} />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
