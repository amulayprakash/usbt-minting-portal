'use client';
import { motion } from 'framer-motion';
import {
  Lightning,
  ArrowsLeftRight,
  ArrowSquareOut,
  Wallet,
} from '@phosphor-icons/react';

const FEATURES = [
  {
    icon: Lightning,
    title: 'Mint',
    body: 'Deposit USDT, receive USBT at 1:1. Settles on-chain in under 3 seconds.',
    metric: '<3s mint time',
  },
  {
    icon: ArrowsLeftRight,
    title: 'Redeem',
    body: 'Exit USBT back to USDT at any time via on-chain liquidity. No approval required.',
    metric: 'Always redeemable · No lockup',
  },
  {
    icon: ArrowSquareOut,
    title: 'Transfer',
    body: 'Send USBT across 9+ chains to any compatible wallet. Standard token mechanics.',
    metric: '9+ networks · Any wallet',
  },
  {
    icon: Wallet,
    title: 'Hold',
    body: 'USBT stays in your wallet. Fully non-custodial. Backed 1:1 by on-chain reserves.',
    metric: '1:1 USDT · Verifiable on-chain',
  },
];

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="mb-14 max-w-xl text-center sm:text-left mx-auto sm:mx-0"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
          What you can do
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-slate-900 dark:text-white">
          Everything you need.
          <br />
          Nothing you don't.
        </h2>
        <p className="mt-4 text-base text-slate-500 dark:text-[#8b8ba8] max-w-[48ch] mx-auto sm:mx-0">
          Four actions. Clear mechanics. Full control.
        </p>
      </motion.div>

      {/* 4-equal card grid — 3D X-rotation perspective reveal */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        style={{ perspective: '1200px' }}
      >
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, rotateX: 30, y: 40, scale: 0.92 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 240, damping: 24 }}
            >
              {/* Outer bezel */}
              <div
                className="h-full rounded-[1.5rem] p-[1px] group cursor-default"
                style={{
                  background: 'var(--bezel-border)',
                  transition: 'background 0.4s ease',
                }}
              >
                {/* Inner card */}
                <div
                  className="h-full rounded-[calc(1.5rem-1px)] p-6 sm:p-8 flex flex-col items-center sm:items-start text-center sm:text-left min-h-0 sm:min-h-[280px]"
                  style={{
                    background: 'var(--bg-surface)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                  }}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 bg-black/[0.05] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08]">
                    <Icon size={20} weight="regular" className="text-cyan-600 dark:text-cyan-400" />
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-[#8b8ba8] leading-relaxed flex-1 max-w-[40ch] sm:max-w-none">
                    {feat.body}
                  </p>

                  <div className="mt-6 pt-5 border-t border-black/[0.07] dark:border-white/[0.06]">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-600/70 dark:text-cyan-500/60 block">
                      {feat.metric}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
