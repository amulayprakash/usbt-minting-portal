'use client';
import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { useWallet } from '../../hooks/useWallet';

const WC_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;

interface WCWallet {
  id: string;
  name: string;
  image_url: { sm?: string; md?: string; lg?: string } | string;
  mobile: { native: string; universal: string };
  desktop: { native: string; universal: string };
}

type View = 'home' | 'all';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WalletModal({ open, onClose }: WalletModalProps) {
  const { connect, connectWC, isConnecting, error } = useWallet();
  const [tronLinkInstalled, setTronLinkInstalled] = useState(false);
  const [view, setView] = useState<View>('all');
  const [wallets, setWallets] = useState<WCWallet[]>([]);
  const [search, setSearch] = useState('');
  const [loadingWallets, setLoadingWallets] = useState(false);

  useEffect(() => {
    setTronLinkInstalled(!!(window as any).tronWeb || !!(window as any).tronLink);
  }, [open]);

  // Reset state when modal closes; fetch wallets when it opens
  useEffect(() => {
    if (!open) { setView('all'); setSearch(''); return; }
    if (wallets.length > 0) return;
    setLoadingWallets(true);
    fetch(`https://explorer-api.walletconnect.com/v3/wallets?projectId=${WC_PROJECT_ID}&entries=100&page=1`)
      .then(r => r.json())
      .then(data => setWallets(Object.values(data.listings ?? {}) as WCWallet[]))
      .catch(() => {})
      .finally(() => setLoadingWallets(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const fetchAndShowAll = () => setView('all');

  const filtered = useMemo(() => {
    if (!search.trim()) return wallets;
    return wallets.filter(w =>
      w.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [wallets, search]);

  const getImgUrl = (w: WCWallet): string | undefined => {
    if (typeof w.image_url === 'string') return w.image_url;
    return w.image_url?.md ?? w.image_url?.sm ?? w.image_url?.lg;
  };

  const handleTronLink = async () => {
    try { await connect(); onClose(); } catch {}
  };

  const handleTronLinkMobile = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`tronlinkoutside://pull.activity?param=${url}`, '_self');
  };

  // Close our modal first → AppKit opens unobstructed
  const handleWalletConnect = () => { onClose(); connectWC(); };

  const closeBtn = (
    <button
      onClick={onClose}
      className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b6b88] hover:text-white hover:bg-white/10 transition-all"
      aria-label="Close"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9980] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal shell */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[9981] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-[370px] rounded-[28px] overflow-hidden flex flex-col"
              style={{
                background: '#1c1c26',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
                maxHeight: '88vh',
              }}
              onClick={e => e.stopPropagation()}
            >
              <AnimatePresence mode="wait" initial={false}>

                {/* ── HOME VIEW ───────────────────────────────────── */}
                {view === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-4">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b6b88] hover:text-white hover:bg-white/10 transition-all">
                        <span className="text-sm font-medium">?</span>
                      </button>
                      <h2 className="text-[15px] font-semibold text-white tracking-tight">Connect Wallet</h2>
                      {closeBtn}
                    </div>

                    {/* Wallet list */}
                    <div className="px-3 pb-3">
                      <WalletRow icon={<WCIcon />} label="WalletConnect" badge={{ text: 'QR CODE', color: 'cyan' }} onClick={handleWalletConnect} />
                      <WalletRow icon={<TronLinkIcon />} label="TronLink" badge={tronLinkInstalled ? { text: 'INSTALLED', color: 'green' } : undefined} loading={isConnecting} onClick={handleTronLink} />
                      <WalletRow icon={<MobileIcon />} label="TronLink Mobile" onClick={handleTronLinkMobile} />

                      {/* Search Wallet → switches to All Wallets view */}
                      <button
                        onClick={fetchAndShowAll}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/[0.06] transition-colors group mt-0.5"
                      >
                        <span className="w-10 h-10 rounded-[14px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="5" stroke="#6b6b88" strokeWidth="1.5"/>
                            <path d="M11 11l2.5 2.5" stroke="#6b6b88" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </span>
                        <span className="flex-1 text-left text-[15px] font-medium text-white">Search Wallet</span>
                        <span className="text-xs text-[#6b6b88] mr-1">550+</span>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#3f3f52] group-hover:text-[#6b6b88] transition-colors">
                          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>

                    {/* Error */}
                    {error && !error.toLowerCase().includes('closed') && (
                      <div className="mx-3 mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                        {error.includes('not detected') && (
                          <a href="https://www.tronlink.org/" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-1.5 transition-colors">
                            Install TronLink <ArrowSquareOut size={11} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-5 pt-2 pb-5 text-center space-y-2">
                      <p className="text-[11px] text-[#3f3f52] leading-relaxed">
                        By connecting your wallet, you agree to our{' '}
                        <span className="text-cyan-500 hover:text-cyan-400 cursor-pointer transition-colors">Terms of Service</span>
                        {' '}and{' '}
                        <span className="text-cyan-500 hover:text-cyan-400 cursor-pointer transition-colors">Privacy Policy</span>
                      </p>
                      <p className="text-[11px] text-[#2e2e42]">
                        UX by <span className="text-[#4a4a6a]">.</span> / <span className="text-[#4a4a6a]">reown</span>
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── ALL WALLETS VIEW ────────────────────────────── */}
                {view === 'all' && (
                  <motion.div
                    key="all"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col overflow-hidden"
                    style={{ maxHeight: '88vh' }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
                      <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b6b88] hover:text-white hover:bg-white/10 transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <h2 className="text-[15px] font-semibold text-white tracking-tight">All Wallets</h2>
                      {closeBtn}
                    </div>

                    {/* Search input */}
                    <div className="px-4 pb-3 flex-shrink-0">
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-white/[0.06] border border-white/[0.08]">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                          <circle cx="7" cy="7" r="5" stroke="#6b6b88" strokeWidth="1.5"/>
                          <path d="M11 11l2.5 2.5" stroke="#6b6b88" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="Search wallet"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="flex-1 bg-transparent text-[13px] text-white placeholder-[#6b6b88] outline-none"
                          autoFocus
                        />
                        {search && (
                          <button onClick={() => setSearch('')} className="text-[#6b6b88] hover:text-white transition-colors">
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Wallet grid */}
                    <div className="overflow-y-auto flex-1 px-3 pb-4">
                      {loadingWallets ? (
                        <div className="flex items-center justify-center h-52">
                          <span className="w-6 h-6 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-1">
                          {/* TronLink always pinned first (unless searching and no match) */}
                          {(!search || 'tronlink'.includes(search.toLowerCase())) && (
                            <WalletCard
                              name="TronLink"
                              icon={<TronLinkGridIcon />}
                              installed={tronLinkInstalled}
                              loading={isConnecting}
                              onClick={handleTronLink}
                            />
                          )}
                          {filtered.map(w => (
                            <WalletCard
                              key={w.id}
                              name={w.name}
                              imageUrl={getImgUrl(w)}
                              onClick={handleWalletConnect}
                            />
                          ))}
                          {filtered.length === 0 && !loadingWallets && (
                            <p className="col-span-3 text-center py-16 text-[13px] text-[#6b6b88]">
                              No wallets found for "{search}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Wallet Row (home view) ───────────────────────────────────────────────────

function WalletRow({
  icon, label, badge, loading, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: { text: string; color: 'cyan' | 'green' };
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/[0.06] transition-colors group text-left disabled:opacity-60 disabled:cursor-wait"
    >
      <span className="w-10 h-10 rounded-[14px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {loading
          ? <span className="w-4 h-4 rounded-full border-[1.5px] border-cyan-500 border-t-transparent animate-spin" />
          : icon}
      </span>
      <span className="flex-1 text-[15px] font-medium text-white">{label}</span>
      {badge && (
        <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md ${
          badge.color === 'cyan'
            ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
            : 'text-green-400 bg-green-500/10 border border-green-500/20'
        }`}>{badge.text}</span>
      )}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#3f3f52] group-hover:text-[#6b6b88] transition-colors flex-shrink-0">
        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// ─── Wallet Card (grid view) ──────────────────────────────────────────────────

function WalletCard({
  name, imageUrl, icon, installed, loading, onClick,
}: {
  name: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  installed?: boolean;
  loading?: boolean;
  onClick: () => void;
}) {
  const short = name.length > 11 ? name.slice(0, 10) + '…' : name;
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex flex-col items-center gap-2 py-3 px-2 rounded-2xl hover:bg-white/[0.06] transition-colors group disabled:opacity-60 disabled:cursor-wait"
    >
      <span className="relative w-[62px] h-[62px] rounded-[18px] bg-white/[0.06] border border-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
        {loading ? (
          <span className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : icon}
        {installed && (
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c26]" />
        )}
      </span>
      <div className="flex items-center gap-0.5">
        <span className="text-[11px] text-[#9b9bb8] group-hover:text-white transition-colors text-center leading-tight">
          {short}
        </span>
        {/* Small WC indicator */}
        <svg width="9" height="9" viewBox="0 0 40 40" fill="none" className="flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity">
          <path d="M9.2 16.4c5.96-5.83 15.63-5.83 21.6 0l.71.7a.73.73 0 010 1.04l-2.44 2.38a.38.38 0 01-.53 0l-.98-.96c-4.16-4.07-10.91-4.07-15.07 0l-1.05 1.02a.38.38 0 01-.53 0l-2.44-2.38a.73.73 0 010-1.04l.73-.76zm26.7 4.97l2.17 2.12a.73.73 0 010 1.04l-9.77 9.55a.77.77 0 01-1.06 0l-6.93-6.77a.19.19 0 00-.27 0l-6.93 6.77a.77.77 0 01-1.06 0L2.27 24.53a.73.73 0 010-1.04l2.17-2.12a.77.77 0 011.06 0l6.93 6.77c.07.07.2.07.27 0l6.93-6.77a.77.77 0 011.06 0l6.93 6.77c.07.07.2.07.27 0l6.93-6.77a.77.77 0 011.06 0z" fill="#3b99fc"/>
        </svg>
      </div>
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function WCIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#3b99fc" fillOpacity="0.15"/>
      <path d="M9.2 16.4c5.96-5.83 15.63-5.83 21.6 0l.71.7a.73.73 0 010 1.04l-2.44 2.38a.38.38 0 01-.53 0l-.98-.96c-4.16-4.07-10.91-4.07-15.07 0l-1.05 1.02a.38.38 0 01-.53 0l-2.44-2.38a.73.73 0 010-1.04l.73-.76zm26.7 4.97l2.17 2.12a.73.73 0 010 1.04l-9.77 9.55a.77.77 0 01-1.06 0l-6.93-6.77a.19.19 0 00-.27 0l-6.93 6.77a.77.77 0 01-1.06 0L2.27 24.53a.73.73 0 010-1.04l2.17-2.12a.77.77 0 011.06 0l6.93 6.77c.07.07.2.07.27 0l6.93-6.77a.77.77 0 011.06 0l6.93 6.77c.07.07.2.07.27 0l6.93-6.77a.77.77 0 011.06 0z" fill="#3b99fc"/>
    </svg>
  );
}

function TronLinkIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1a1a2e"/>
      <path d="M20 7L34 28H6L20 7Z" fill="#ef0027" fillOpacity="0.9"/>
      <path d="M20 7L34 28H20V7Z" fill="#ef0027"/>
      <circle cx="20" cy="26" r="5" fill="#ff4d4d" fillOpacity="0.3"/>
      <circle cx="20" cy="26" r="3" fill="#ff6b6b"/>
    </svg>
  );
}

function TronLinkGridIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#1a1a2e"/>
      <path d="M20 7L34 28H6L20 7Z" fill="#ef0027" fillOpacity="0.9"/>
      <path d="M20 7L34 28H20V7Z" fill="#ef0027"/>
      <circle cx="20" cy="26" r="5" fill="#ff4d4d" fillOpacity="0.3"/>
      <circle cx="20" cy="26" r="3" fill="#ff6b6b"/>
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="5" y="2" width="10" height="16" rx="2.5" stroke="#6b6b88" strokeWidth="1.5"/>
      <circle cx="10" cy="15" r="1" fill="#6b6b88"/>
    </svg>
  );
}
