'use client';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import {
  EthLogo, BtcLogo, BnbLogo, MaticLogo, SolLogo,
  AvaxLogo, ArbLogo, OpLogo, TronLogo, BaseLogo,
} from './ChainLogos';

/* ─────────────────────────────────────────────────────────────────────────────
   Chain definitions
───────────────────────────────────────────────────────────────────────────── */

type ChainStatus = 'live' | 'supported' | 'bridge-ready' | 'planned';

interface Chain {
  id: string;
  name: string;
  label: string;
  Logo: React.FC;
  status: ChainStatus;
}

const STATUS_CONFIG: Record<ChainStatus, { label: string; color: string; dot: string }> = {
  'live':         { label: 'Live',         color: 'rgba(52,211,153,0.7)',  dot: '#34d399' },
  'supported':    { label: 'Supported',    color: 'rgba(6,182,212,0.7)',   dot: '#06b6d4' },
  'bridge-ready': { label: 'Bridge-ready', color: 'rgba(251,191,36,0.7)',  dot: '#fbbf24' },
  'planned':      { label: 'Planned',      color: 'rgba(148,163,184,0.6)', dot: '#94a3b8' },
};

const CHAINS: Chain[] = [
  { id: 'eth',   name: 'Ethereum',  label: 'ETH',   Logo: EthLogo,   status: 'supported'    },
  { id: 'btc',   name: 'Bitcoin',   label: 'BTC',   Logo: BtcLogo,   status: 'planned'      },
  { id: 'bnb',   name: 'BNB Chain', label: 'BNB',   Logo: BnbLogo,   status: 'live'         },
  { id: 'matic', name: 'Polygon',   label: 'MATIC', Logo: MaticLogo, status: 'supported'    },
  { id: 'sol',   name: 'Solana',    label: 'SOL',   Logo: SolLogo,   status: 'supported'    },
  { id: 'avax',  name: 'Avalanche', label: 'AVAX',  Logo: AvaxLogo,  status: 'bridge-ready' },
  { id: 'arb',   name: 'Arbitrum',  label: 'ARB',   Logo: ArbLogo,   status: 'bridge-ready' },
  { id: 'op',    name: 'Optimism',  label: 'OP',    Logo: OpLogo,    status: 'bridge-ready' },
  { id: 'trx',   name: 'Tron',      label: 'TRX',   Logo: TronLogo,  status: 'live'         },
  { id: 'base',  name: 'Base',      label: 'BASE',  Logo: BaseLogo,  status: 'bridge-ready' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ChainPill — single item in the marquee track
───────────────────────────────────────────────────────────────────────────── */

function ChainPill({ name, label, Logo, status, isDark }: Chain & { isDark: boolean }) {
  const s = STATUS_CONFIG[status];

  return (
    <div
      className="inline-flex items-center gap-3 mx-2.5 px-5 py-3 rounded-2xl select-none"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(255,255,255,0.7) 100%)',
        border: isDark
          ? '1px solid rgba(6,182,212,0.14)'
          : '1px solid rgba(6,182,212,0.18)',
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.2)'
          : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo container */}
      <div
        className="w-6 h-6 flex-shrink-0"
        style={{
          color: isDark ? 'rgba(6,182,212,0.85)' : 'rgba(8,145,178,0.82)',
          filter: isDark ? 'drop-shadow(0 0 5px rgba(6,182,212,0.38))' : undefined,
        }}
      >
        <Logo />
      </div>

      {/* Name + status */}
      <div className="flex flex-col gap-0.5 whitespace-nowrap">
        <div className="flex items-baseline gap-2">
          <span
            className="text-sm font-bold"
            style={{ color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(15,23,42,0.82)' }}
          >
            {name}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: isDark ? 'rgba(6,182,212,0.55)' : 'rgba(6,182,212,0.6)' }}
          >
            {label}
          </span>
        </div>
        {/* Status badge */}
        <div className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: s.dot }}
          />
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: s.color }}
          >
            {s.label}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Marquee keyframes
───────────────────────────────────────────────────────────────────────────── */

const MARQUEE_KEYFRAMES = `
  @keyframes marqueeLTR {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes marqueeRTL {
    0%   { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   MarqueeTrack — one row of the endless marquee
───────────────────────────────────────────────────────────────────────────── */

function MarqueeTrack({
  chains,
  duration,
  reverse = false,
  isDark,
}: {
  chains: Chain[];
  duration: number;
  reverse?: boolean;
  isDark: boolean;
}) {
  const doubled = [...chains, ...chains];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
      }}
    >
      <div
        className="inline-flex"
        style={{
          animation: `${reverse ? 'marqueeRTL' : 'marqueeLTR'} ${duration}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {doubled.map((chain, i) => (
          <ChainPill key={`${chain.id}-${i}`} {...chain} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SupportedChains — main export
───────────────────────────────────────────────────────────────────────────── */

export default function SupportedChains() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const row2Chains = [
    CHAINS[4], // SOL
    CHAINS[1], // BTC
    CHAINS[8], // TRX
    CHAINS[6], // ARB
    CHAINS[2], // BNB
    CHAINS[9], // BASE
    CHAINS[7], // OP
    CHAINS[0], // ETH
    CHAINS[5], // AVAX
    CHAINS[3], // MATIC
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: MARQUEE_KEYFRAMES }} />

      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 50% at 50% 110%, rgba(6,182,212,0.055) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 50% at 50% 110%, rgba(6,182,212,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Top separator */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.18) 30%, rgba(6,182,212,0.28) 50%, rgba(6,182,212,0.18) 70%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.14) 30%, rgba(6,182,212,0.22) 50%, rgba(6,182,212,0.14) 70%, transparent 100%)',
        }}
      />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.88, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="text-center mb-12 px-6"
      >
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 relative">
            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-pulse-ring" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
            Multi-chain infrastructure
          </span>
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-slate-900 dark:text-white mb-3">
          Available everywhere
        </h2>

        {/* Subtitle + network count badge */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <p className="text-base text-slate-500 dark:text-[#6b6b88]">
            USBT runs natively across the chains that matter — with more coming.
          </p>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0"
            style={{
              background: isDark ? 'rgba(6,182,212,0.1)' : 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.22)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring opacity-70" />
            </span>
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
              {CHAINS.length} Networks
            </span>
          </div>
        </div>
      </motion.div>

      {/* Marquee Rows */}
      <div className="flex flex-col gap-3 overflow-hidden">
        {/* Row 1 — slides from left */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 28 }}
        >
          <MarqueeTrack chains={CHAINS} duration={30} reverse={false} isDark={isDark} />
        </motion.div>

        {/* Row 2 — slides from right */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 240, damping: 28 }}
        >
          <MarqueeTrack chains={row2Chains} duration={40} reverse={true} isDark={isDark} />
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div
        className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 70%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 30%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.06) 70%, transparent 100%)',
        }}
      />
    </section>
  );
}
