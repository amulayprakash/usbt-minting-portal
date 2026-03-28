'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock } from '@phosphor-icons/react';

type Phase = 'done' | 'active' | 'upcoming';

const PHASES: {
  phase: string;
  title: string;
  items: string[];
  status: Phase;
  fill: number;
}[] = [
  {
    phase: 'Phase 01',
    title: 'Foundation',
    status: 'done',
    fill: 1,
    items: [
      'USBT token contract deployed and verified',
      'USDT collateral mechanism live',
      'Issuance function verified on-chain',
      'Liquidity pair established',
    ],
  },
  {
    phase: 'Phase 02',
    title: 'Portal',
    status: 'active',
    fill: 0.6,
    items: [
      'Get USBT portal — deposit USDT, receive USBT',
      'Redeem portal — exit via on-chain liquidity',
      'Web3 wallet integration',
      'Mobile-first responsive interface',
      'Multi-chain deployment expansion',
    ],
  },
  {
    phase: 'Phase 03',
    title: 'Ecosystem',
    status: 'upcoming',
    fill: 0,
    items: [
      'Additional wallet adapter support',
      'Portfolio & balance dashboard',
      'Real-time liquidity analytics',
    ],
  },
];

const statusConfig: Record<
  Phase,
  { label: string; color: string; iconColor: string; barColor: string }
> = {
  done: {
    label: 'Complete',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-400/8 border-emerald-500/20',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    barColor: '#34d399',
  },
  active: {
    label: 'In Progress',
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-400/8 border-cyan-500/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    barColor: '#06b6d4',
  },
  upcoming: {
    label: 'Upcoming',
    color: 'text-slate-500 dark:text-[#8b8ba8] bg-black/[0.04] dark:bg-white/[0.04] border-black/[0.10] dark:border-white/[0.10]',
    iconColor: 'text-slate-300 dark:text-[#4a4a6a]',
    barColor: '#94a3b8',
  },
};

export default function Roadmap() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="mb-14 max-w-xl text-center sm:text-left mx-auto sm:mx-0"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
          Our progress
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-slate-900 dark:text-white">
          Where we're headed.
        </h2>
      </motion.div>

      {/* Phase cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
        style={{ perspective: '1000px' }}
      >
        {PHASES.map((phase, i) => {
          const cfg = statusConfig[phase.status];
          return (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: -50, scale: 0.92, rotateX: -12 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 260, damping: 22 }}
              className={`
                rounded-2xl p-5 sm:p-6 border text-center sm:text-left
                ${phase.status === 'active'
                  ? 'border-cyan-500/22 bg-cyan-500/[0.04]'
                  : 'border-black/[0.18] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]'
                }
              `}
              style={{
                boxShadow:
                  phase.status === 'active'
                    ? 'inset 0 1px 0 rgba(6,182,212,0.12)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              {/* Phase number */}
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-[#4a4a6a] mb-3 text-center sm:text-left">
                {phase.phase}
              </p>

              {/* Title + badge */}
              <div className="flex items-center justify-center sm:justify-between gap-3 mb-4 flex-wrap">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex-1">
                  {phase.title}
                </h3>
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: i * 0.12 + 0.2, type: 'spring', stiffness: 360, damping: 22 }}
                  className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${cfg.color} flex-shrink-0`}
                >
                  {cfg.label}
                </motion.span>
              </div>

              {/* Animated progress bar */}
              <div className="h-1 rounded-full overflow-hidden mb-5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: phase.fill }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: i * 0.12 + 0.3, type: 'spring', stiffness: 200, damping: 28 }}
                  style={{ transformOrigin: 'left', background: cfg.barColor }}
                />
              </div>

              {/* Items */}
              <ul className="space-y-3 inline-block text-left">
                {phase.items.map((item, j) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{
                      delay: i * 0.12 + 0.22 + j * 0.06,
                      type: 'spring',
                      stiffness: 300,
                      damping: 26,
                    }}
                    className="flex items-start gap-2.5"
                  >
                    {phase.status === 'done' ? (
                      <CheckCircle size={15} weight="fill" className="text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : phase.status === 'active' ? (
                      <Clock size={15} weight="fill" className="text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={15} weight="regular" className="text-slate-300 dark:text-[#3f3f52] flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm leading-snug ${
                        phase.status === 'done'
                          ? 'text-slate-500 dark:text-[#8b8ba8]'
                          : phase.status === 'active'
                          ? 'text-slate-800 dark:text-white/90'
                          : 'text-slate-400 dark:text-[#4a4a6a]'
                      }`}
                    >
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
