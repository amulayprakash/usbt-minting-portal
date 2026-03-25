'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ShieldCheck,
  Eye,
  Lock,
  ArrowSquareOut,
  Coin,
  GitBranch,
} from '@phosphor-icons/react';
import { TRONSCAN_CONTRACT_URL } from '../../constants/contracts';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'On-chain collateral',
    body: 'Every USBT minted is backed by USDT deposited to the contract. The reserve is visible at any time on TronScan.',
  },
  {
    icon: Eye,
    title: 'Fully transparent',
    body: 'Contract logic is public and verified. No admin backdoors, no upgradeable proxies that could change rules after deployment.',
  },
  {
    icon: Lock,
    title: 'Non-custodial',
    body: 'Your tokens stay in your wallet. The portal never holds or controls your assets. You connect, sign, and own.',
  },
  {
    icon: Coin,
    title: 'USDT-pegged design',
    body: 'The minting contract is designed around USDT as collateral, targeting a predictable and stable unit of account.',
  },
  {
    icon: GitBranch,
    title: 'Open source contract',
    body: 'The smart contract source is published and verifiable. Review every line before you interact.',
  },
  {
    icon: ArrowSquareOut,
    title: 'SunSwap exit liquidity',
    body: 'USBT can be sold directly on SunSwap v2 at any time. No application approval required for redemption.',
  },
];

export default function Security() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(6,182,212,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
            Trust &amp; Security
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-5">
            Transparent by design.
          </h2>
          <p className="text-slate-500 dark:text-[#8b8ba8] leading-relaxed">
            USBT is built on verifiable on-chain logic. No hidden fees, no opaque reserve management,
            no trust assumptions beyond the Tron network itself.
          </p>
        </motion.div>

        {/* Items grid */}
        <div className="space-y-4">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 240, damping: 26 }}
                className="flex items-start gap-5 p-6 rounded-2xl border border-black/[0.16] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-black/[0.10] dark:hover:border-white/[0.10] transition-all duration-300"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.05] border border-black/[0.20] dark:border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} weight="regular" className="text-cyan-600/80 dark:text-cyan-400/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-[#8b8ba8] leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA to TronScan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <a
            href={TRONSCAN_CONTRACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black/[0.09] dark:border-white/[0.09] bg-black/[0.03] dark:bg-white/[0.03] text-sm font-semibold text-slate-500 dark:text-[#8b8ba8] hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.07] dark:hover:bg-white/[0.07] hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all duration-300"
          >
            Review contract on TronScan
            <ArrowSquareOut size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
