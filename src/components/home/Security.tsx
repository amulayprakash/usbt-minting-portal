'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Lock, ArrowSquareOut } from '@phosphor-icons/react';
import { TRONSCAN_CONTRACT_URL } from '../../constants/contracts';
import { useTheme } from '../../hooks/useTheme';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Collateral-backed',
    body: 'Every USBT minted maps 1:1 to USDT locked in the contract. The reserve is publicly visible at any block. No fractional issuance. No hidden float.',
    tags: '1:1 · On-chain reserve · Verifiable always',
  },
  {
    icon: Eye,
    title: 'Open by design',
    body: 'Contract logic is fully public and immutable. No admin backdoors, no upgradeable proxies, no fee switches that can be flipped after you hold.',
    tags: 'Open source · Zero hidden fees · Auditable',
  },
  {
    icon: Lock,
    title: 'Always yours',
    body: 'Your USBT stays in your wallet. The portal never takes custody. Connect, sign, own — no account, no KYC, no intermediary.',
    tags: 'Non-custodial · Self-sovereign · Permissionless',
  },
];

export default function Security() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(6,182,212,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="mb-14 max-w-xl text-center sm:text-left mx-auto sm:mx-0"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
            Built for trust
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-slate-900 dark:text-white">
            A stablecoin you
            <br />
            <span
              className={`bg-clip-text text-transparent ${
                isDark
                  ? 'bg-gradient-to-br from-cyan-300 via-cyan-500 to-sky-600'
                  : 'bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800'
              }`}
            >
              can count on.
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-500 dark:text-[#8b8ba8] max-w-[48ch] mx-auto sm:mx-0">
            Three guarantees. No exceptions.
          </p>
        </motion.div>

        {/* 3-column pillar cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 260, damping: 26 }}
                className="rounded-[1.5rem] p-[1px]"
                style={{ background: 'var(--bezel-border)' }}
              >
                <div
                  className="h-full rounded-[calc(1.5rem-1px)] p-6 sm:p-8 flex flex-col items-center sm:items-start text-center sm:text-left"
                  style={{
                    background: 'var(--bg-surface)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                  }}
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
                    whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ delay: i * 0.12 + 0.12, type: 'spring', stiffness: 380, damping: 22 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.06)',
                      border: '1px solid rgba(6,182,212,0.2)',
                    }}
                  >
                    <Icon size={24} weight="regular" className="text-cyan-600 dark:text-cyan-400" />
                  </motion.div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-6 mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-[#8b8ba8] leading-relaxed flex-1 max-w-[40ch] sm:max-w-none">
                    {pillar.body}
                  </p>

                  {/* Tag strip */}
                  <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.05]">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-600/60 dark:text-cyan-500/60 block">
                      {pillar.tags}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA to TronScan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 26 }}
          className="mt-10 flex justify-center"
        >
          <a
            href={TRONSCAN_CONTRACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black/[0.09] dark:border-white/[0.09] bg-black/[0.03] dark:bg-white/[0.03] text-sm font-semibold text-slate-500 dark:text-[#8b8ba8] hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.07] dark:hover:bg-white/[0.07] hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all duration-300"
          >
            Review contract source
            <ArrowSquareOut size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
