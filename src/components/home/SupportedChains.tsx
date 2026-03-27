'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

/* ─────────────────────────────────────────────────────────────────────────────
   Chain SVG Logos — monochrome, same family as Hero orbital logos
───────────────────────────────────────────────────────────────────────────── */

function EthLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <polygon points="16,2 16,12.8 7.5,16.8"  fill="currentColor" opacity="0.42"/>
      <polygon points="16,2 24.5,16.8 16,12.8" fill="currentColor" opacity="0.72"/>
      <polygon points="16,12.8 7.5,16.8 16,21"  fill="currentColor" opacity="0.58"/>
      <polygon points="16,12.8 24.5,16.8 16,21" fill="currentColor" opacity="0.95"/>
      <polygon points="16,21 7.5,16.8 16,30"    fill="currentColor" opacity="0.52"/>
      <polygon points="16,21 24.5,16.8 16,30"   fill="currentColor" opacity="0.74"/>
    </svg>
  );
}

function BtcLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path
        d="M22.2 13.9c.55-3.7-2.3-5.2-5.2-5.65L17.6 4.3l-2.2-.55-.7 2.95c-.58-.15-1.18-.28-1.77-.42L13.6 3.3 11.4 2.76l-.72 2.92-1.38-.35-3.04-.76-.58 2.38s1.62.37 1.59.4c.88.22 1.04.82 1.01 1.28L7.4 14.78c-.06.28-.35.58-.85.46-.02 0-1.6-.4-1.6-.4L4 17.3l2.88.72 1.6.4-.76 3.26 2.2.55.76-3.3c.6.16 1.18.3 1.75.44l-.75 3.28 2.2.55.76-3.25c4.55.85 7.97.3 9.4-3.6.76-3.3-.04-5.2-2.48-6.44 1.44-.44 2.58-1.72 2.86-3.56zM17.6 22.3c-.57 2.56-4.64 1.18-5.95.84l1.06-4.26c1.32.32 5.56 1 4.9 3.42zm.62-8.5c-.52 2.28-3.72 1.12-4.76.84l.96-3.88c1.04.26 4.9.74 3.8 3.04z"
        fill="currentColor" opacity="0.9"
      />
    </svg>
  );
}

function BnbLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path d="M16 4L19.46 7.46 12.54 14.38 9.08 10.92z" fill="currentColor" opacity="0.88"/>
      <path d="M6.92 13.08 10.38 9.62 13.84 13.08 10.38 16.54z" fill="currentColor" opacity="0.88"/>
      <path d="M16 10L22 16 16 22 10 16z" fill="currentColor" opacity="0.6"/>
      <path d="M25.08 13.08 28.54 16.54 25.08 20 21.62 16.54z" fill="currentColor" opacity="0.88"/>
      <path d="M16 21.5 19.46 25 16 28.54 12.54 25z" fill="currentColor" opacity="0.88"/>
    </svg>
  );
}

function MaticLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path
        d="M20.5 12.1l-4.25-2.45a1.5 1.5 0 00-1.5 0L10.5 12.1a1.5 1.5 0 00-.75 1.3v4.9c0 .54.28 1.02.75 1.3l4.25 2.45c.46.27 1.04.27 1.5 0l4.25-2.45c.47-.28.75-.76.75-1.3v-4.9a1.5 1.5 0 00-.75-1.3zm-2.2 5.7-2.3 1.33-2.3-1.33V14.2l2.3-1.33 2.3 1.33z"
        fill="currentColor" opacity="0.92"
      />
      <path
        d="M16 4L5.07 10.33v11.34L16 28l10.93-6.33V10.33z"
        stroke="currentColor" strokeWidth="1.2" opacity="0.3" fill="none"
      />
    </svg>
  );
}

function SolLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path d="M7.5 21h14.5l2.5-2.5H10z"    fill="currentColor" opacity="0.72"/>
      <path d="M7.5 16.25h14.5l2.5-2.5H10z"  fill="currentColor" opacity="0.9"/>
      <path d="M10 11.5h14.5l-2.5-2.5H7.5z"  fill="currentColor" opacity="0.58"/>
    </svg>
  );
}

function AvaxLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path d="M16 4.5 8.2 27.5h3.2l4.6-8 4.6 8h3.2z" fill="currentColor" opacity="0.88"/>
      <rect x="10.5" y="23" width="11" height="2.2" rx="0.5" fill="currentColor" opacity="0.18"/>
    </svg>
  );
}

function ArbLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <circle cx="16" cy="16" r="11.5" stroke="currentColor" strokeWidth="1.4" opacity="0.28"/>
      <path
        d="M10.5 21.5 13.5 12l3.2 6.5h-3.5l-1.2 3M18.5 21.5l-2-5.5 2.5-5 4.5 10.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.9"
      />
    </svg>
  );
}

function OpLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <circle cx="16" cy="16" r="11.5" stroke="currentColor" strokeWidth="1.4" opacity="0.3"/>
      <circle cx="16" cy="16" r="5.8"  stroke="currentColor" strokeWidth="2"   opacity="0.88"/>
      <circle cx="16" cy="16" r="2.2"  fill="currentColor"                     opacity="0.78"/>
    </svg>
  );
}

function TronLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      {/* Outer diamond */}
      <polygon points="16,2 29,11 24,28 8,28 3,11" stroke="currentColor" strokeWidth="1.3" fill="none" opacity="0.3"/>
      {/* Inner T shape */}
      <rect x="10" y="10" width="12" height="2.2" rx="0.6" fill="currentColor" opacity="0.85"/>
      <rect x="14.9" y="12.2" width="2.2" height="9.5" rx="0.6" fill="currentColor" opacity="0.9"/>
      {/* Bottom accent dot */}
      <circle cx="16" cy="24.5" r="1.2" fill="currentColor" opacity="0.55"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Chain definitions
───────────────────────────────────────────────────────────────────────────── */

interface Chain {
  id: string;
  name: string;
  label: string;
  Logo: React.FC;
}

const CHAINS: Chain[] = [
  { id: 'eth',   name: 'Ethereum',  label: 'ETH',   Logo: EthLogo  },
  { id: 'btc',   name: 'Bitcoin',   label: 'BTC',   Logo: BtcLogo  },
  { id: 'bnb',   name: 'BNB Chain', label: 'BNB',   Logo: BnbLogo  },
  { id: 'matic', name: 'Polygon',   label: 'MATIC', Logo: MaticLogo},
  { id: 'sol',   name: 'Solana',    label: 'SOL',   Logo: SolLogo  },
  { id: 'avax',  name: 'Avalanche', label: 'AVAX',  Logo: AvaxLogo },
  { id: 'arb',   name: 'Arbitrum',  label: 'ARB',   Logo: ArbLogo  },
  { id: 'op',    name: 'Optimism',  label: 'OP',    Logo: OpLogo   },
  { id: 'trx',   name: 'Tron',      label: 'TRX',   Logo: TronLogo },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ChainPill — single item in the marquee track
───────────────────────────────────────────────────────────────────────────── */

function ChainPill({ name, label, Logo, isDark }: Chain & { isDark: boolean }) {
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

      {/* Name */}
      <div className="flex items-baseline gap-2 whitespace-nowrap">
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
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Marquee keyframes — injected once; two named animations avoid the
   "reverse" shorthand conflict and guarantee each row starts at the
   correct position with zero initial snap.
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
  // Double the array — at translateX(-50%) the visual is identical to 0%
  // because the second half is an exact clone of the first.
  const doubled = [...chains, ...chains];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
      }}
    >
      {/*
        KEY: `inline-flex` (not `flex`) makes the track size to its content.
        With `flex` the track fills the parent width → pills shrink → -50%
        no longer equals one full set → visible snap at the loop point.
        `inline-flex` keeps every pill at its natural width and makes -50%
        exactly one set wide, giving a perfectly seamless loop.
      */}
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
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Row 2 uses a staggered order so both rows feel distinct
  const row2Chains = [
    CHAINS[4], // SOL
    CHAINS[1], // BTC
    CHAINS[8], // TRX
    CHAINS[6], // ARB
    CHAINS[2], // BNB
    CHAINS[7], // OP
    CHAINS[0], // ETH
    CHAINS[5], // AVAX
    CHAINS[3], // MATIC
  ];

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
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

      {/* ── Section Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="text-center mb-12 px-6"
      >
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 relative">
            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-pulse-ring" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
            Cross-Chain Infrastructure
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
          Supported Networks
        </h2>

        {/* Subtitle + network count badge */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <p className="text-[15px] text-slate-500 dark:text-[#6b6b88]">
            USBT liquidity available natively across all major blockchain ecosystems
          </p>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0"
            style={{
              background: isDark ? 'rgba(6,182,212,0.1)' : 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.22)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative"
            >
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring opacity-70" />
            </span>
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
              {CHAINS.length} Networks
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Marquee Rows ── */}
      <div className="flex flex-col gap-3">
        {/* Row 1 — left to right (30s) */}
        <MarqueeTrack
          chains={CHAINS}
          duration={30}
          reverse={false}
          isDark={isDark}
        />

        {/* Row 2 — right to left (40s, staggered order for depth) */}
        <MarqueeTrack
          chains={row2Chains}
          duration={40}
          reverse={true}
          isDark={isDark}
        />
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
