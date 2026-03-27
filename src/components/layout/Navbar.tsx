'use client';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, Moon, Sun } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import Logo from '../ui/Logo';
import WalletButton from '../ui/WalletButton';
import { useTheme } from '../../hooks/useTheme';

const NAV_LINKS = [
  { to: '/', label: 'Overview' },
  { to: '/buy', label: 'Get USBT' },
  { to: '/sell', label: 'Redeem' },
];

export default function Navbar() {
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Floating pill nav */}
      <header className="fixed top-0 inset-x-0 z-[9900] flex justify-center pt-5 px-4">
        <motion.nav
          initial={false}
          animate={{
            borderColor: scrolled
              ? isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'
              : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
          }}
          transition={{ duration: 0.4 }}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-full',
            'border transition-all duration-500',
            'w-full max-w-3xl',
            scrolled
              ? isDark
                ? 'bg-[rgba(7,7,14,0.92)] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'bg-[rgba(245,246,250,0.94)] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]'
              : isDark
                ? 'bg-[rgba(7,7,14,0.6)] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'bg-[rgba(245,246,250,0.72)] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
          )}
        >
          {/* Logo */}
          <Logo size="sm" />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={clsx(
                    'relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
                    active
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-[#8b8ba8] hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05]'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="navActive"
                      className="absolute inset-0 rounded-full bg-black/[0.06] dark:bg-white/[0.07] border border-black/[0.08] dark:border-white/[0.09]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex-1" />

          {/* Theme toggle + Wallet + hamburger */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              onClick={toggle}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={clsx(
                'w-8 h-8 flex items-center justify-center rounded-full',
                'border transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                isDark
                  ? 'bg-white/[0.05] border-white/[0.09] text-[#8b8ba8] hover:text-amber-300 hover:bg-amber-300/[0.08] hover:border-amber-300/[0.20]'
                  : 'bg-black/[0.05] border-black/[0.09] text-slate-500 hover:text-cyan-600 hover:bg-cyan-500/[0.08] hover:border-cyan-500/[0.20]'
              )}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.span
                    key="moon"
                    initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={14} weight="fill" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="sun"
                    initial={{ rotate: 30, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -30, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={14} weight="fill" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <WalletButton />

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={clsx(
                'md:hidden w-8 h-8 flex items-center justify-center rounded-full border transition-colors',
                isDark
                  ? 'bg-white/[0.05] border-white/[0.09] text-[#8b8ba8] hover:text-white'
                  : 'bg-black/[0.05] border-black/[0.09] text-slate-500 hover:text-slate-900'
              )}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={15} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <List size={15} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9800] bg-white/90 dark:bg-black/85 backdrop-blur-3xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-6">
              {NAV_LINKS.map((link, i) => {
                const active = location.pathname === link.to;
                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{
                      delay: i * 0.07,
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                    }}
                  >
                    <Link
                      to={link.to}
                      className={clsx(
                        'text-4xl font-bold tracking-tight transition-colors duration-200',
                        active
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-300 dark:text-[#4a4a6a] hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
