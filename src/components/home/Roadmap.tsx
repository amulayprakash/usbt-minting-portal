'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle, Circle, Clock } from '@phosphor-icons/react';

type Phase = 'done' | 'active' | 'upcoming';

const PHASES: {
  phase: string;
  title: string;
  items: string[];
  status: Phase;
}[] = [
  {
    phase: 'Phase 01',
    title: 'Foundation',
    status: 'done',
    items: [
      'USBT token contract deployed on Tron Mainnet',
      'USDT collateral mechanism live',
      'buyTokens function verified (0x3610724e)',
      'SunSwap v2 liquidity pair created',
    ],
  },
  {
    phase: 'Phase 02',
    title: 'Portal',
    status: 'active',
    items: [
      'Buy USBT portal (USDT → USBT)',
      'Sell USBT portal (SunSwap routing)',
      'TronLink wallet integration',
      'Mobile-first responsive interface',
    ],
  },
  {
    phase: 'Phase 03',
    title: 'Ecosystem',
    status: 'upcoming',
    items: [
      'Additional wallet adapter support',
      'Portfolio / balance dashboard',
      'Real-time pool analytics',
      'Community governance exploration',
    ],
  },
];

const statusConfig: Record<
  Phase,
  { label: string; color: string; iconColor: string }
> = {
  done: {
    label: 'Complete',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-400/8 border-emerald-500/20',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  active: {
    label: 'In Progress',
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-400/8 border-cyan-500/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  upcoming: {
    label: 'Upcoming',
    color: 'text-slate-500 dark:text-[#8b8ba8] bg-black/[0.04] dark:bg-white/[0.04] border-black/[0.10] dark:border-white/[0.10]',
    iconColor: 'text-slate-300 dark:text-[#4a4a6a]',
  },
};

export default function Roadmap() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="mb-14 max-w-xl"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
          Roadmap
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Where we are.
          <br />
          Where we're going.
        </h2>
      </motion.div>

      {/* Phase cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PHASES.map((phase, i) => {
          const cfg = statusConfig[phase.status];
          return (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 24 }}
              className={`
                rounded-2xl p-6 border
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-[#4a4a6a] mb-3">
                {phase.phase}
              </p>

              {/* Title + badge */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {phase.title}
                </h3>
                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${cfg.color} flex-shrink-0`}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mb-5" />

              {/* Items */}
              <ul className="space-y-3">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    {phase.status === 'done' ? (
                      <CheckCircle
                        size={15}
                        weight="fill"
                        className="text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5"
                      />
                    ) : phase.status === 'active' ? (
                      <Clock
                        size={15}
                        weight="fill"
                        className="text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5"
                      />
                    ) : (
                      <Circle
                        size={15}
                        weight="regular"
                        className="text-slate-300 dark:text-[#3f3f52] flex-shrink-0 mt-0.5"
                      />
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
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
