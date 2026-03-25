'use client';
import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { SUNSWAP_PAIR_URL } from '../../constants/contracts';

interface StatItem {
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  sub?: string;
  live?: boolean;
  highlight?: boolean;
}

const STATS: StatItem[] = [
  {
    label: 'Token Price',
    prefix: '$',
    value: '1.000',
    suffix: ' USDT',
    sub: 'Per USBT',
    live: true,
    highlight: true,
  },
  {
    label: 'Pool Liquidity',
    prefix: '$',
    value: '—',
    sub: 'SunSwap v2',
    live: true,
  },
  {
    label: 'Network',
    value: 'Tron',
    suffix: ' Mainnet',
    sub: 'TRC-20 Standard',
  },
  {
    label: 'Contract',
    value: 'Verified',
    sub: 'Open source on TronScan',
  },
];

function AnimatedNumber({
  target,
  prefix = '',
  suffix = '',
}: {
  target: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <span className="num font-black">
      {prefix}
      {target}
      {suffix && <span className="text-base font-medium text-slate-400 dark:text-[#6b6b88] ml-1">{suffix}</span>}
    </span>
  );
}

function StatsTicker() {
  const items = [
    'USBT · TRC-20',
    'Backed by USDT',
    'SunSwap Liquidity',
    'Tron Mainnet',
    'Open Source',
    'Non-custodial',
    'USBT · TRC-20',
    'Backed by USDT',
    'SunSwap Liquidity',
    'Tron Mainnet',
    'Open Source',
    'Non-custodial',
  ];

  return (
    <div className="relative border-y border-black/[0.16] dark:border-white/[0.06] overflow-hidden py-3 bg-black/[0.01] dark:bg-white/[0.01]">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#6b6b88]">
              {item}
            </span>
            <span className="w-1 h-1 rounded-full bg-cyan-500/40" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TokenStats() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative">
      <StatsTicker />

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="mb-12"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
            Token Overview
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Live network data
            </h2>
            <a
              href={SUNSWAP_PAIR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              View on SunSwap
              <ArrowSquareOut size={13} />
            </a>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
              className={`
                relative rounded-2xl p-6 border transition-all duration-300
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
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
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
                className={`text-2xl font-black tracking-tight leading-none mb-2 ${
                  stat.highlight ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-900 dark:text-white'
                }`}
              >
                <AnimatedNumber
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.value !== '—' ? stat.suffix : ''}
                />
              </div>

              {stat.sub && (
                <p className="text-xs text-slate-400 dark:text-[#6b6b88]">{stat.sub}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contract addresses strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <ContractRow label="USBT Contract" address="TA22JDzS7HDQPYM38Y4Wsy9N3hLRBSUkGv" />
          <ContractRow label="USDT Collateral" address="TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" />
        </motion.div>
      </div>
    </section>
  );
}

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
