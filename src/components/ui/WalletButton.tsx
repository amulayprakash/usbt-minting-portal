'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CaretDown, Copy, SignOut, CheckCircle } from '@phosphor-icons/react';
import { useWallet } from '../../hooks/useWallet';
import WalletModal from './WalletModal';

export default function WalletButton() {
  const { account, isConnected, disconnect, shortenAddress, connectionType } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDisconnect = () => {
    disconnect();
    setDropdownOpen(false);
  };

  if (!isConnected) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400
            text-sm font-semibold
            hover:bg-cyan-500/18 hover:border-cyan-500/40
            transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            active:scale-[0.97]
            shadow-[inset_0_1px_0_rgba(6,182,212,0.15)]
          "
        >
          <Wallet size={15} weight="regular" />
          <span>Connect</span>
        </button>
        <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="
          inline-flex items-center gap-2 px-3.5 py-2 rounded-full
          bg-black/[0.05] dark:bg-white/[0.05]
          border border-black/[0.09] dark:border-white/[0.09]
          text-sm font-medium text-slate-800 dark:text-white
          hover:bg-black/[0.08] dark:hover:bg-white/[0.08]
          hover:border-black/[0.15] dark:hover:border-white/[0.15]
          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          active:scale-[0.97]
        "
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        {/* Status dot */}
        <span className="relative flex-shrink-0 w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring opacity-60" />
          <span className="absolute inset-0 rounded-full bg-emerald-400" />
        </span>
        {connectionType === 'walletconnect' && (
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-500/70">WC</span>
        )}
        <span className="font-mono text-xs tracking-wide">
          {account ? shortenAddress(account) : ''}
        </span>
        <motion.span
          animate={{ rotate: dropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 dark:text-[#6b6b88]"
        >
          <CaretDown size={12} weight="bold" />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {dropdownOpen && (
          <>
            {/* Click-outside */}
            <div
              className="fixed inset-0 z-[9970]"
              onClick={() => setDropdownOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="absolute right-0 top-full mt-2 z-[9971] w-56"
            >
              <div
                className="rounded-2xl border border-black/[0.09] dark:border-white/[0.09] overflow-hidden"
                style={{
                  background: 'var(--bg-surface)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
                }}
              >
                {/* Address */}
                <div className="px-4 py-3 border-b border-black/[0.16] dark:border-white/[0.06]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-[#4a4a6a] mb-1">
                    Connected
                  </p>
                  <p className="text-xs font-mono text-slate-500 dark:text-[#8b8ba8] break-all leading-relaxed">
                    {account}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-1.5">
                  <DropdownItem
                    icon={copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    label={copied ? 'Copied!' : 'Copy address'}
                    onClick={handleCopy}
                  />
                  <DropdownItem
                    icon={<SignOut size={14} />}
                    label="Disconnect"
                    onClick={handleDisconnect}
                    danger
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200
        ${danger
          ? 'text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300'
          : 'text-slate-500 dark:text-[#8b8ba8] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
