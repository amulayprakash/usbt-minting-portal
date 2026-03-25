'use client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, ArrowsLeftRight } from '@phosphor-icons/react';
import Button from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

// Floating token visual
function TokenVisual() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[380px]">
      {/* Outer orbit ring */}
      <div
        className="absolute w-72 h-72 rounded-full border border-cyan-500/10 animate-spin-slow"
        style={{ animationDuration: '24s' }}
      >
        {/* Orbit dot */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400/60">
          <div className="absolute inset-0 rounded-full bg-cyan-400 animate-pulse-ring" />
        </div>
      </div>

      {/* Middle orbit ring */}
      <div
        className="absolute w-52 h-52 rounded-full border border-cyan-500/15"
        style={{ animation: 'spinReverse 18s linear infinite' }}
      >
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-500/50" />
      </div>

      {/* Token coin */}
      <div
        className="relative z-10 w-36 h-36 rounded-full"
        style={{
          animation: 'float 7s ease-in-out infinite',
          background: isDark
            ? 'linear-gradient(145deg, #0d1a24, #071318)'
            : 'linear-gradient(145deg, #dff4fb, #c8eaf5)',
          border: '1.5px solid rgba(6,182,212,0.35)',
          boxShadow: isDark
            ? `0 0 60px rgba(6,182,212,0.18), 0 0 120px rgba(6,182,212,0.08),
               inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4)`
            : `0 0 40px rgba(6,182,212,0.14), 0 0 80px rgba(6,182,212,0.06),
               inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.06)`,
        }}
      >
        {/* Coin face */}
        <div
          className="absolute inset-[3px] rounded-full overflow-hidden flex items-center justify-center"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 38% 32%, rgba(6,182,212,0.18) 0%, rgba(7,7,14,0.96) 55%)'
              : 'radial-gradient(circle at 38% 32%, rgba(6,182,212,0.14) 0%, rgba(220,242,250,0.98) 55%)',
          }}
        >
          {/* Highlight */}
          <div className="absolute top-3 left-4 w-12 h-6 rounded-full bg-white/[0.06] blur-md" />

          <img
            src="/usbt-logo.png"
            alt="USBT"
            className="relative z-10 w-[72px] h-[72px] object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]"
            draggable={false}
          />
        </div>

        {/* Edge reflection */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'conic-gradient(from 135deg, transparent 60%, rgba(6,182,212,0.12) 75%, transparent 85%)',
        }} />
      </div>

      {/* Floating stats chips */}
      <FloatingChip
        text="TRC-20"
        subtext="Tron Mainnet"
        style={{ top: '15%', right: '8%', animationDelay: '1s' }}
      />
      <FloatingChip
        text="Backed"
        subtext="USDT Collateral"
        style={{ bottom: '18%', left: '6%', animationDelay: '2.5s' }}
      />
    </div>
  );
}

function FloatingChip({
  text,
  subtext,
  style,
}: {
  text: string;
  subtext: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      className="absolute px-3 py-2 rounded-xl border border-black/[0.20] dark:border-white/[0.09] animate-float"
      style={{
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        ...style,
      }}
    >
      <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{text}</p>
      <p className="text-[10px] text-slate-400 dark:text-[#6b6b88] mt-0.5 whitespace-nowrap">{subtext}</p>
    </div>
  );
}

export default function Hero() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className="relative min-h-[100dvh] flex flex-col overflow-hidden">
      <div className="flex-1 flex items-center max-w-7xl mx-auto w-full px-6 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">

          {/* Left — content */}
          <div className="order-2 lg:order-1">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 24 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/[0.08] mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400">
                <span className="absolute rounded-full bg-cyan-400 animate-pulse-ring" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                Live on Tron Mainnet · TRC-20
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 260, damping: 24 }}
              className="text-5xl md:text-6xl lg:text-[64px] font-black tracking-tighter leading-[1.05] text-slate-900 dark:text-white mb-6"
            >
              The stable token
              <br />
              built for{' '}
              <span className={`bg-clip-text text-transparent ${
                isDark
                  ? 'bg-gradient-to-br from-cyan-300 via-cyan-500 to-sky-600'
                  : 'bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800'
              }`}>
                real value.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, type: 'spring', stiffness: 240, damping: 24 }}
              className="text-lg text-slate-500 dark:text-[#8b8ba8] leading-relaxed max-w-[500px] mb-10"
            >
              Mint, hold, and redeem USBT on the Tron network.
              Backed by USDT collateral, redeemable through SunSwap liquidity.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, type: 'spring', stiffness: 240, damping: 24 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link to="/buy">
                <Button
                  variant="primary"
                  size="lg"
                  trailingIcon={<ArrowRight size={12} weight="bold" />}
                >
                  Buy USBT
                </Button>
              </Link>
              <Link to="/sell">
                <Button variant="secondary" size="lg">
                  Sell USBT
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-5 mt-10 pt-8 border-t border-black/[0.16] dark:border-white/[0.06]"
            >
              <TrustPill icon={<ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />} text="On-chain verified" />
              <TrustPill icon={<ArrowsLeftRight size={14} className="text-cyan-600 dark:text-cyan-400" />} text="SunSwap liquidity" />
              <TrustPill
                icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.2" className="text-cyan-600 dark:text-cyan-400" />
                    <path d="M3.5 7l2.5 2.5L10 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600 dark:text-cyan-400" />
                  </svg>
                }
                text="Open source contract"
              />
            </motion.div>
          </div>

          {/* Right — token visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 22 }}
            className="order-1 lg:order-2"
          >
            <TokenVisual />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(to top, #07070e, transparent)'
            : 'linear-gradient(to top, #f5f6fa, transparent)',
        }}
      />
    </section>
  );
}

function TrustPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-xs text-slate-500 dark:text-[#6b6b88]">{text}</span>
    </div>
  );
}
