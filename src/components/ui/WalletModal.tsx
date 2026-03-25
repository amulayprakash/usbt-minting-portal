'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DeviceMobileCamera, ArrowSquareOut } from '@phosphor-icons/react';
import { useWallet } from '../../hooks/useWallet';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WalletModal({ open, onClose }: WalletModalProps) {
  const { connect, connectWC, isConnecting, wcConnecting, error } = useWallet();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleTronLink = async () => {
    try {
      await connect();
      onClose();
    } catch {
      // error shown inline
    }
  };

  const handleTronLinkMobile = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`tronlinkoutside://pull.activity?param=${url}`, '_self');
  };

  const handleWalletConnect = async () => {
    try {
      await connectWC();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.toLowerCase().includes('closed')) {
        // error already set in context
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9980] bg-black/40 dark:bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[9981] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Outer bezel */}
              <div className="bezel-outer p-[1px]">
                <div
                  className="rounded-[calc(1.5rem-1px)] p-6"
                  style={{
                    background: 'var(--bg-surface)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.8), 0 32px 80px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-[#4a4a6a] mb-1">
                        Tron Mainnet
                      </p>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        Connect Wallet
                      </h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.05] border border-black/[0.20] dark:border-white/[0.08] flex items-center justify-center text-slate-400 dark:text-[#6b6b88] hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.10] dark:hover:bg-white/[0.10] transition-all duration-200"
                      aria-label="Close"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Wallet options */}
                  <div className="space-y-2.5">
                    {/* TronLink Extension */}
                    <WalletOption
                      icon={
                        <span className="text-lg font-black text-cyan-600 dark:text-cyan-400" style={{ fontFamily: 'Geist Mono' }}>
                          T
                        </span>
                      }
                      label="TronLink"
                      description="Browser extension · desktop"
                      badge="Recommended"
                      loading={isConnecting}
                      onClick={handleTronLink}
                    />

                    {/* TronLink Mobile */}
                    <WalletOption
                      icon={<DeviceMobileCamera size={20} className="text-slate-400 dark:text-[#8b8ba8]" />}
                      label="TronLink Mobile"
                      description="Deep link to wallet app"
                      onClick={handleTronLinkMobile}
                    />

                    {/* WalletConnect */}
                    <WalletOption
                      icon={
                        <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="40" rx="10" fill="rgba(6,182,212,0.12)" />
                          <path
                            d="M9.2 16.4c5.96-5.83 15.63-5.83 21.6 0l.71.7a.73.73 0 010 1.04l-2.44 2.38a.38.38 0 01-.53 0l-.98-.96c-4.16-4.07-10.91-4.07-15.07 0l-1.05 1.02a.38.38 0 01-.53 0l-2.44-2.38a.73.73 0 010-1.04l.73-.76zm26.7 4.97l2.17 2.12a.73.73 0 010 1.04l-9.77 9.55a.77.77 0 01-1.06 0l-6.93-6.77a.19.19 0 00-.27 0l-6.93 6.77a.77.77 0 01-1.06 0L2.27 24.53a.73.73 0 010-1.04l2.17-2.12a.77.77 0 011.06 0l6.93 6.77c.07.07.2.07.27 0l6.93-6.77a.77.77 0 011.06 0l6.93 6.77c.07.07.2.07.27 0l6.93-6.77a.77.77 0 011.06 0z"
                            fill="#06b6d4"
                          />
                        </svg>
                      }
                      label="WalletConnect"
                      description="Scan QR code with any compatible wallet"
                      loading={wcConnecting}
                      onClick={handleWalletConnect}
                    />
                  </div>

                  {/* Error state */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20"
                    >
                      <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">{error}</p>
                      {error.includes('not detected') && (
                        <a
                          href="https://www.tronlink.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-500 mt-2 transition-colors"
                        >
                          Install TronLink
                          <ArrowSquareOut size={11} />
                        </a>
                      )}
                    </motion.div>
                  )}

                  {/* Footer */}
                  <p className="text-[11px] text-slate-400 dark:text-[#4a4a6a] text-center mt-5 leading-relaxed">
                    By connecting you agree to the{' '}
                    <span className="text-slate-500 dark:text-[#6b6b88] underline underline-offset-2 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                      Terms of Service
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Option row ───────────────────────────────────────────────────────────────

function WalletOption({
  icon,
  label,
  description,
  badge,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  badge?: string;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-3 p-4 rounded-2xl border border-black/[0.18] dark:border-white/[0.07] bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.07] dark:hover:bg-white/[0.07] hover:border-black/[0.12] dark:hover:border-white/[0.12] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group text-left active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
    >
      <span className="w-10 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.05] border border-black/[0.20] dark:border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:border-black/[0.15] dark:group-hover:border-white/[0.15] transition-colors">
        {loading ? (
          <span className="w-4 h-4 rounded-full border-[1.5px] border-cyan-500 border-t-transparent animate-spin" />
        ) : (
          icon
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{label}</span>
          {badge && (
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-[#6b6b88] mt-0.5">{description}</p>
      </div>
      <span className="text-slate-300 dark:text-[#3f3f52] group-hover:text-slate-500 dark:group-hover:text-[#6b6b88] transition-colors flex-shrink-0">
        <ArrowSquareOut size={14} />
      </span>
    </button>
  );
}
