'use client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Wallet, Lightning, ArrowRight, ArrowSquareDown } from '@phosphor-icons/react';
import Button from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

const STEPS = [
  {
    num: '01',
    icon: Globe,
    title: 'Pick your chain',
    desc: 'USBT is live on TRON, BNB Chain, and 7 more. Choose the network that matches your wallet.',
  },
  {
    num: '02',
    icon: Wallet,
    title: 'Connect your wallet',
    desc: 'Any compatible Web3 wallet works. Desktop or mobile. No account, no sign-up.',
  },
  {
    num: '03',
    icon: ArrowSquareDown,
    title: 'Deposit USDT',
    desc: 'Approve a one-time spend, then confirm the mint. Your USBT arrives in the same transaction.',
  },
  {
    num: '04',
    icon: Lightning,
    title: "You're done",
    desc: 'USBT is in your wallet. Redeem at any time via the same portal.',
  },
];

export default function HowItWorks() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="mb-14 max-w-xl text-center sm:text-left mx-auto sm:mx-0"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
          Get started
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-slate-900 dark:text-white">
          Up and running
          <br />
          in minutes.
        </h2>
      </motion.div>

      {/* Steps grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Connecting line — desktop only */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute top-[2.75rem] left-[12.5%] right-[12.5%] h-px pointer-events-none"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.18) 15%, rgba(6,182,212,0.22) 50%, rgba(6,182,212,0.18) 85%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.14) 15%, rgba(6,182,212,0.2) 50%, rgba(6,182,212,0.14) 85%, transparent 100%)',
          }}
        />

        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, scale: 0.55 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 380, damping: 22 }}
            >
              {/* Outer bezel */}
              <div
                className="h-full rounded-[1.5rem] p-[1px]"
                style={{ background: 'var(--bezel-border)' }}
              >
                {/* Inner card */}
                <div
                  className="relative h-full rounded-[calc(1.5rem-1px)] p-5 sm:p-6 flex flex-col gap-4 overflow-hidden items-center sm:items-start text-center sm:text-left"
                  style={{
                    background: 'var(--bg-surface)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                  }}
                >
                  {/* Oversized ghost step number */}
                  <span
                    className="absolute top-0 right-4 text-[80px] font-black leading-none select-none pointer-events-none"
                    style={{ color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
                  >
                    {step.num}
                  </span>

                  {/* Icon bubble — spins in */}
                  <div className="flex items-center gap-3 relative z-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ delay: i * 0.1 + 0.15, type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isDark ? 'rgba(6,182,212,0.1)' : 'rgba(6,182,212,0.08)',
                        border: '1px solid rgba(6,182,212,0.2)',
                      }}
                    >
                      <Icon size={18} className="text-cyan-600 dark:text-cyan-400" />
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight relative z-10">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-500 dark:text-[#8b8ba8] leading-relaxed flex-1 relative z-10 max-w-[40ch] sm:max-w-none">
                    {step.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ delay: 0.42, type: 'spring', stiffness: 240, damping: 24 }}
        className="flex flex-wrap items-center gap-3 mt-10 justify-center md:justify-start"
      >
        <Link to="/buy">
          <Button variant="primary" size="lg" trailingIcon={<ArrowRight size={12} weight="bold" />}>
            Get USBT
          </Button>
        </Link>
        <Link to="/sell">
          <Button variant="secondary" size="lg">
            Redeem USBT
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
