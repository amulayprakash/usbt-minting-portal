'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Lightning,
  ArrowsLeftRight,
  ShieldCheck,
  Wallet,
  Drop,
  FileCode,
} from '@phosphor-icons/react';

const FEATURES = [
  {
    icon: Lightning,
    title: 'Instant Issuance',
    body: 'Deposit collateral, receive USBT immediately. Issuance settles on-chain in seconds — no queues, no intermediaries.',
    accent: true,
    size: 'large',
  },
  {
    icon: ArrowsLeftRight,
    title: 'Deep Liquidity Access',
    body: 'USBT is redeemable into deep on-chain liquidity at any time. Exit whenever you need to, at market rate, with minimal slippage.',
    size: 'normal',
  },
  {
    icon: ShieldCheck,
    title: 'Fully Collateralized',
    body: 'Every USBT in circulation maps 1:1 to USDT held on-chain. The reserve is transparent and verifiable at any time.',
    size: 'normal',
  },
  {
    icon: Wallet,
    title: 'Wallet-Agnostic',
    body: 'Connect with any compatible Web3 wallet. Desktop and mobile flows are fully supported, with more wallet adapters being added.',
    size: 'normal',
  },
  {
    icon: Drop,
    title: 'Protocol-Grade Depth',
    body: 'Paired liquidity provides real market depth for both issuance and redemption, keeping slippage minimal at scale.',
    size: 'normal',
  },
  {
    icon: FileCode,
    title: 'Verifiable Contract',
    body: 'Fully open-source and publicly verified. No hidden fees, no admin backdoors, no logic that can change after deployment.',
    size: 'wide',
  },
];

export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="mb-14 max-w-xl text-center md:text-left mx-auto md:mx-0"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
          Why USBT
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Built for clarity, not complexity.
        </h2>
        <p className="mt-4 text-slate-500 dark:text-[#8b8ba8] leading-relaxed">
          A minimal, verifiable liquidity token engineered to do one thing well: preserve and transfer value across chains.
        </p>
      </motion.div>

      {/* Asymmetric feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          const colSpan =
            feat.size === 'large'
              ? 'md:col-span-1 md:row-span-2'
              : feat.size === 'wide'
              ? 'md:col-span-2'
              : 'md:col-span-1';

          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 24 }}
              className={`${colSpan}`}
            >
              {/* Outer bezel */}
              <div
                className="h-full rounded-[1.5rem] p-[1px] group cursor-default"
                style={{
                  background: feat.accent
                    ? 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(8,145,178,0.1))'
                    : 'var(--bezel-border)',
                  transition: 'background 0.4s ease',
                }}
              >
                {/* Inner card */}
                <div
                  className="h-full rounded-[calc(1.5rem-1px)] p-6 flex flex-col"
                  style={{
                    background: feat.accent
                      ? 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, var(--bg-canvas) 60%)'
                      : 'var(--bg-surface)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                    transition: 'background 0.4s ease',
                  }}
                >
                  {/* Icon */}
                  <div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center mb-5 flex-shrink-0 mx-auto md:mx-0
                      ${feat.accent
                        ? 'bg-cyan-500/15 border border-cyan-500/25'
                        : 'bg-black/[0.05] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08]'
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      weight="regular"
                      className={feat.accent ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-[#8b8ba8]'}
                    />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5 tracking-tight text-center md:text-left">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-[#8b8ba8] leading-relaxed flex-1 text-center md:text-left">
                    {feat.body}
                  </p>

                  {feat.accent && (
                    <div className="mt-5 pt-5 border-t border-cyan-500/15">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-600/60 dark:text-cyan-500/60 block text-center md:text-left">
                        Contract · Open Source · Publicly Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
