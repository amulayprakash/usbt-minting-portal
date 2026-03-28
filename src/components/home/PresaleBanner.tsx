'use client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Fire, Warning } from '@phosphor-icons/react';
import { useTheme } from '../../hooks/useTheme';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';

// Presale ends 15 days from 2026-03-26
const PRESALE_END = new Date('2026-04-10T23:59:59Z').getTime();

function getTimeLeft() {
  const diff = PRESALE_END - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const display = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative w-[60px] h-[60px] rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(160deg, rgba(6,182,212,0.20) 0%, rgba(5,8,18,0.95) 100%)'
            : 'linear-gradient(160deg, rgba(6,182,212,0.15) 0%, rgba(255,255,255,0.95) 100%)',
          border: isDark
            ? '1px solid rgba(6,182,212,0.35)'
            : '1px solid rgba(6,182,212,0.25)',
          boxShadow: isDark
            ? '0 0 18px rgba(6,182,212,0.20), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Center divider */}
        <div
          className="absolute inset-x-0 top-1/2 h-px pointer-events-none"
          style={{ background: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(0,0,0,0.05)' }}
        />
        <span className="relative text-2xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
          {display}
        </span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-cyan-500/60">
        {label}
      </span>
    </div>
  );
}

function CountdownSeparator() {
  return (
    <span className="text-2xl font-black text-cyan-500/40 dark:text-cyan-400/30 mb-6 select-none">:</span>
  );
}

export default function PresaleBanner() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    // Outer wrapper: pushes section below navbar with a visible gap
    <div className="w-full px-4 md:px-6 lg:px-10 py-6">
      <motion.section
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24, delay: 0.05 }}
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          background: isDark
            ? 'linear-gradient(130deg, #040c14 0%, #060e18 35%, #050a10 65%, #04080e 100%)'
            : 'linear-gradient(130deg, #ddf3fb 0%, #eef8fd 35%, #e6f5fb 65%, #d8f0f9 100%)',
          border: isDark
            ? '1px solid rgba(6,182,212,0.40)'
            : '1px solid rgba(6,182,212,0.30)',
          boxShadow: isDark
            ? '0 0 0 1px rgba(6,182,212,0.08), 0 8px 40px rgba(6,182,212,0.18), 0 2px 12px rgba(0,0,0,0.5)'
            : '0 0 0 1px rgba(6,182,212,0.06), 0 8px 32px rgba(6,182,212,0.14), 0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.5) 20%, rgba(34,211,238,0.9) 50%, rgba(6,182,212,0.5) 80%, transparent 100%)'
              : 'linear-gradient(90deg, transparent, rgba(6,182,212,0.45), transparent)',
          }}
        />

        {/* Left cyan glow */}
        <div
          className="absolute top-0 left-0 w-[340px] h-full pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at left center, rgba(6,182,212,0.10) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at left center, rgba(6,182,212,0.08) 0%, transparent 65%)',
          }}
        />
        {/* Right cyan glow */}
        <div
          className="absolute top-0 right-0 w-[300px] h-full pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at right center, rgba(6,182,212,0.07) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at right center, rgba(6,182,212,0.05) 0%, transparent 65%)',
          }}
        />

        <div className="noise-overlay absolute inset-0 pointer-events-none" />

        {/* Mobile-only full-width PRESALE LIVE banner strip */}
        <div
          className="sm:hidden relative flex items-center justify-center gap-3 py-3 px-6"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0.12) 50%, rgba(6,182,212,0.22) 100%)'
              : 'linear-gradient(90deg, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.08) 50%, rgba(6,182,212,0.18) 100%)',
            borderBottom: '1px solid rgba(6,182,212,0.35)',
          }}
        >
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
          </span>
          <span
            className={`text-[16px] font-black uppercase tracking-[0.28em] ${isDark ? 'text-cyan-400' : 'text-sky-700'}`}
            style={{ textShadow: isDark ? '0 0 16px rgba(6,182,212,0.8)' : undefined }}
          >
            Early Access Live
          </span>
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-14 md:py-9">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-7 xl:gap-8">

            {/* Left — badge + text */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-5 min-w-0">

              {/* Live badge — hidden on mobile (replaced by full-width strip above) */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 22 }}
                className="hidden sm:flex flex-shrink-0 items-center gap-3 px-5 py-3 rounded-2xl"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(6,182,212,0.28) 0%, rgba(6,182,212,0.12) 100%)'
                    : 'linear-gradient(135deg, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0.08) 100%)',
                  border: '1.5px solid rgba(6,182,212,0.60)',
                  boxShadow: isDark
                    ? '0 0 36px rgba(6,182,212,0.35), 0 0 12px rgba(6,182,212,0.20), inset 0 1px 0 rgba(6,182,212,0.25)'
                    : '0 2px 12px rgba(6,182,212,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
                }}
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
                </span>
                <span className={`text-[15px] font-extrabold uppercase tracking-[0.22em] whitespace-nowrap ${isDark ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-sky-700'}`}>
                  Early Access Live
                </span>
              </motion.div>

              <div className="hidden sm:block w-px h-14 bg-black/[0.10] dark:bg-cyan-500/[0.15]" />

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.20, type: 'spring', stiffness: 260, damping: 24 }}
                className="text-center sm:text-left min-w-0"
              >
                <div className="flex items-center gap-2.5 justify-center sm:justify-start mb-2">
                  <Fire size={18} weight="fill" className="text-amber-400 flex-shrink-0" />
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center sm:text-left">
                    USBT Early Access — lock in your position before this round closes.
                  </h2>
                </div>
                <p className="text-sm md:text-[15px] text-slate-500 dark:text-[#8b8ba8] max-w-[500px] leading-relaxed text-center sm:text-left mx-auto sm:mx-0">
                  Early participants secure the best entry rate. Once this round closes,{' '}
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">pricing adjusts permanently</span>.
                </p>
                <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                  <Warning size={14} weight="fill" className="text-amber-400 flex-shrink-0" />
                  <span className="text-[13px] font-semibold text-amber-500 dark:text-amber-400">
                    Limited allocation remaining in this round.
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Center — countdown */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 240, damping: 24 }}
              className="flex flex-col items-center gap-3 flex-shrink-0"
            >
              <span
                className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: isDark ? 'rgba(6,182,212,0.7)' : 'rgba(8,145,178,0.8)' }}
              >
                Round closes in
              </span>
              <div className="flex items-end gap-2">
                <CountdownUnit value={timeLeft.days} label="Days" />
                <CountdownSeparator />
                <CountdownUnit value={timeLeft.hours} label="Hrs" />
                <CountdownSeparator />
                <CountdownUnit value={timeLeft.minutes} label="Min" />
                <CountdownSeparator />
                <CountdownUnit value={timeLeft.seconds} label="Sec" />
              </div>
            </motion.div>

            {/* Right — CTA */}
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.30, type: 'spring', stiffness: 240, damping: 24 }}
              className="flex flex-col items-center gap-3 flex-shrink-0"
            >
              <Link to="/buy">
                <Button
                  variant="primary"
                  size="lg"
                  trailingIcon={<ArrowRight size={12} weight="bold" />}
                >
                  Get USBT
                </Button>
              </Link>
              <span className="text-[11px] font-medium text-slate-400 dark:text-[#4a4a6a]">
                Secure · On-chain · Non-custodial
              </span>
            </motion.div>

          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 inset-x-0 h-[1px] pointer-events-none"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.30) 30%, rgba(6,182,212,0.45) 50%, rgba(6,182,212,0.30) 70%, transparent 100%)'
              : 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)',
          }}
        />
      </motion.section>
    </div>
  );
}
