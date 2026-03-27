'use client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, ArrowsLeftRight } from '@phosphor-icons/react';
import Button from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

/* ─────────────────────────────────────────────────────────────────────────────
   Chain Logos — monochrome SVG, cyan-tinted, clean vector
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
      <path d="M7.5 21h14.5l2.5-2.5H10z"   fill="currentColor" opacity="0.72"/>
      <path d="M7.5 16.25h14.5l2.5-2.5H10z" fill="currentColor" opacity="0.9"/>
      <path d="M10 11.5h14.5l-2.5-2.5H7.5z" fill="currentColor" opacity="0.58"/>
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
      <polygon points="16,2 29,11 24,28 8,28 3,11" stroke="currentColor" strokeWidth="1.3" fill="none" opacity="0.3"/>
      <rect x="10" y="10" width="12" height="2.2" rx="0.6" fill="currentColor" opacity="0.85"/>
      <rect x="14.9" y="12.2" width="2.2" height="9.5" rx="0.6" fill="currentColor" opacity="0.9"/>
      <circle cx="16" cy="24.5" r="1.2" fill="currentColor" opacity="0.55"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Keyframes — injected once into the document
───────────────────────────────────────────────────────────────────────────── */

const ORBIT_KEYFRAMES = `
  @keyframes orbitCW {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes orbitCCW {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes counterCW {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes counterCCW {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes usbtFloat {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%      { transform: translateY(-7px) scale(1.015); }
  }
  @keyframes centerBloom {
    0%, 100% { opacity: 0.45; transform: translate(-50%,-50%) scale(1); }
    50%      { opacity: 0.85; transform: translate(-50%,-50%) scale(1.14); }
  }
  @keyframes ringBreath {
    0%, 100% { opacity: 0.09; }
    50%      { opacity: 0.22; }
  }
  @keyframes particleDrift {
    0%, 100% { opacity: 0.35; }
    50%      { opacity: 0.7; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   OrbitLogo — keeps the logo upright while it orbits
   Technique: outer wrapper rotates (orbit); inner div counter-rotates (stays upright)
───────────────────────────────────────────────────────────────────────────── */

interface OrbitLogoProps {
  Logo: React.FC;
  radius: number;
  duration: number;
  /** Negative delay offsets start position around the ring (negative = pre-advance) */
  delay: number;
  size?: number;
  clockwise?: boolean;
  isDark?: boolean;
}

function OrbitLogo({ Logo, radius, duration, delay, size = 30, clockwise = true, isDark = true }: OrbitLogoProps) {
  const orbitAnim   = clockwise ? 'orbitCW'   : 'orbitCCW';
  const counterAnim = clockwise ? 'counterCW' : 'counterCCW';
  const animTiming  = `${duration}s linear infinite`;

  return (
    /* Orbit pivot — sits at the visual center via top/left:50% */
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        animation: `${orbitAnim} ${animTiming}`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Soft glow halo behind the logo — dark mode only */}
      {isDark && (
        <div
          style={{
            position: 'absolute',
            left: radius - size / 2 - 6,
            top: -(size / 2) - 6,
            width: size + 12,
            height: size + 12,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 72%)',
            animation: `${counterAnim} ${animTiming}`,
            animationDelay: `${delay}s`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Logo chip */}
      <div
        style={{
          position: 'absolute',
          left: radius - size / 2,
          top: -(size / 2),
          width: size,
          height: size,
          color: isDark ? 'rgba(6,182,212,0.8)' : 'rgba(8,145,178,0.82)',
          animation: `${counterAnim} ${animTiming}`,
          animationDelay: `${delay}s`,
          ...(isDark && { filter: 'drop-shadow(0 0 5px rgba(6,182,212,0.38))' }),
        }}
      >
        <Logo />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TokenVisual
───────────────────────────────────────────────────────────────────────────── */

function TokenVisual() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Orbit parameters
  const innerR  = 112;  // px from center
  const outerR  = 172;  // px from center
  const innerDur = 26;  // seconds
  const outerDur = 43;  // seconds

  // Inner ring  (clockwise)     — 4 logos, 90° apart → delay step = -duration/4
  const innerLogos: React.FC[] = [EthLogo, SolLogo, BnbLogo, ArbLogo];
  // Outer ring  (counterclockwise) — 5 logos
  const outerLogos: React.FC[] = [BtcLogo, MaticLogo, AvaxLogo, OpLogo, TronLogo];

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[440px]">

      {/* ── Keyframe definitions ── */}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: ORBIT_KEYFRAMES }} />

      {/* ── Background SVG: particles + faint network lines ── */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 440 440"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        {/* Network lines */}
        <line x1="55"  y1="72"  x2="215" y2="184" stroke="rgba(6,182,212,0.055)" strokeWidth="0.8"/>
        <line x1="385" y1="85"  x2="225" y2="184" stroke="rgba(6,182,212,0.055)" strokeWidth="0.8"/>
        <line x1="38"  y1="305" x2="215" y2="258" stroke="rgba(6,182,212,0.05)"  strokeWidth="0.8"/>
        <line x1="402" y1="318" x2="225" y2="258" stroke="rgba(6,182,212,0.05)"  strokeWidth="0.8"/>
        <line x1="220" y1="28"  x2="220" y2="182" stroke="rgba(6,182,212,0.04)"  strokeWidth="0.8"/>
        <line x1="220" y1="412" x2="220" y2="260" stroke="rgba(6,182,212,0.04)"  strokeWidth="0.8"/>
        <line x1="55"  y1="72"  x2="38"  y2="305" stroke="rgba(6,182,212,0.025)" strokeWidth="0.6"/>
        <line x1="385" y1="85"  x2="402" y2="318" stroke="rgba(6,182,212,0.025)" strokeWidth="0.6"/>

        {/* Animated particle dots */}
        <circle cx="55"  cy="72"  r="2.2" fill="rgba(6,182,212,0.45)" style={{ animation: 'particleDrift 3.8s ease-in-out infinite' }}/>
        <circle cx="385" cy="85"  r="1.8" fill="rgba(6,182,212,0.35)" style={{ animation: 'particleDrift 4.5s ease-in-out infinite 0.5s' }}/>
        <circle cx="38"  cy="305" r="2.0" fill="rgba(6,182,212,0.38)" style={{ animation: 'particleDrift 3.2s ease-in-out infinite 1s' }}/>
        <circle cx="402" cy="318" r="1.6" fill="rgba(6,182,212,0.28)" style={{ animation: 'particleDrift 5s ease-in-out infinite 1.5s' }}/>
        <circle cx="220" cy="26"  r="2.4" fill="rgba(6,182,212,0.5)"  style={{ animation: 'particleDrift 4s ease-in-out infinite 0.8s' }}/>
        <circle cx="118" cy="382" r="1.6" fill="rgba(6,182,212,0.25)" style={{ animation: 'particleDrift 4.8s ease-in-out infinite 2s' }}/>
        <circle cx="322" cy="392" r="1.8" fill="rgba(6,182,212,0.3)"  style={{ animation: 'particleDrift 3.6s ease-in-out infinite 1.2s' }}/>
        <circle cx="422" cy="200" r="1.4" fill="rgba(6,182,212,0.22)" style={{ animation: 'particleDrift 5.5s ease-in-out infinite 2.5s' }}/>
        <circle cx="18"  cy="200" r="1.8" fill="rgba(6,182,212,0.28)" style={{ animation: 'particleDrift 4.2s ease-in-out infinite 0.3s' }}/>
        <circle cx="148" cy="58"  r="1.4" fill="rgba(6,182,212,0.2)"  style={{ animation: 'particleDrift 6s ease-in-out infinite 3s' }}/>
        <circle cx="292" cy="52"  r="1.2" fill="rgba(6,182,212,0.18)" style={{ animation: 'particleDrift 5.2s ease-in-out infinite 1.8s' }}/>

        {/* Decorative empty circles in corners */}
        <circle cx="62"  cy="115" r="32" stroke="rgba(6,182,212,0.055)" strokeWidth="1"/>
        <circle cx="378" cy="342" r="26" stroke="rgba(6,182,212,0.045)" strokeWidth="1"/>
      </svg>

      {/* ── Orbital ring: innermost decorative ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 148, height: 148,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '1px solid rgba(6,182,212,0.14)',
          animation: 'ringBreath 4.5s ease-in-out infinite',
          boxShadow: isDark ? '0 0 24px rgba(6,182,212,0.05) inset' : undefined,
          pointerEvents: 'none',
        }}
      />

      {/* ── Orbital ring: inner (logos orbit this) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: innerR * 2, height: innerR * 2,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '1px solid rgba(6,182,212,0.13)',
          boxShadow: isDark ? '0 0 32px rgba(6,182,212,0.06) inset, 0 0 32px rgba(6,182,212,0.04)' : undefined,
          pointerEvents: 'none',
        }}
      />

      {/* ── Orbital ring: outer (logos orbit this) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: outerR * 2, height: outerR * 2,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '1px solid rgba(6,182,212,0.08)',
          filter: 'blur(0.4px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Inner ring logos — clockwise ── */}
      {innerLogos.map((Logo, i) => (
        <OrbitLogo
          key={`inner-${i}`}
          Logo={Logo}
          radius={innerR}
          duration={innerDur}
          delay={-(i * innerDur / innerLogos.length)}
          size={29}
          clockwise={true}
          isDark={isDark}
        />
      ))}

      {/* ── Outer ring logos — counter-clockwise (parallax depth) ── */}
      {outerLogos.map((Logo, i) => (
        <OrbitLogo
          key={`outer-${i}`}
          Logo={Logo}
          radius={outerR}
          duration={outerDur}
          delay={-(i * outerDur / outerLogos.length)}
          size={31}
          clockwise={false}
          isDark={isDark}
        />
      ))}

      {/* ── Central bloom glow — dark mode only ── */}
      {isDark && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 210, height: 210,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.04) 40%, transparent 72%)',
            animation: 'centerBloom 5s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* ── USBT Token coin ── */}
      <div
        className="relative z-10 w-[124px] h-[124px] rounded-full"
        style={{
          animation: 'usbtFloat 6.5s ease-in-out infinite',
          background: isDark
            ? 'linear-gradient(145deg, #0d1a24, #071318)'
            : 'linear-gradient(145deg, #dff4fb, #c8eaf5)',
          border: '1.5px solid rgba(6,182,212,0.38)',
          boxShadow: isDark
            ? `0 0 55px rgba(6,182,212,0.24), 0 0 110px rgba(6,182,212,0.1),
               inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.45)`
            : `0 4px 20px rgba(6,182,212,0.12), 0 1px 3px rgba(0,0,0,0.06),
               inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(0,0,0,0.06)`,
          zIndex: 10,
        }}
      >
        {/* Inner face */}
        <div
          className="absolute inset-[3px] rounded-full overflow-hidden flex items-center justify-center"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 38% 32%, rgba(6,182,212,0.22) 0%, rgba(7,7,14,0.96) 55%)'
              : 'radial-gradient(circle at 38% 32%, rgba(6,182,212,0.18) 0%, rgba(220,242,250,0.98) 55%)',
          }}
        >
          {/* Specular highlight */}
          <div className="absolute top-3 left-4 w-11 h-5 rounded-full bg-white/[0.07] blur-md" />

          <img
            src="/usbt-logo.png"
            alt="USBT"
            className={`relative z-10 w-[64px] h-[64px] object-contain ${isDark ? 'drop-shadow-[0_0_14px_rgba(6,182,212,0.58)]' : 'drop-shadow-[0_2px_6px_rgba(6,182,212,0.2)]'}`}
            draggable={false}
          />
        </div>

        {/* Edge conic shimmer */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'conic-gradient(from 135deg, transparent 58%, rgba(6,182,212,0.16) 74%, transparent 86%)',
          }}
        />
      </div>

      {/* ── Floating info chips ── */}
      <FloatingChip
        text="Multi-Chain"
        subtext="Major networks"
        style={{ top: '10%', right: '4%', animationDelay: '1s' }}
      />
      <FloatingChip
        text="Backed"
        subtext="USDT Collateral"
        style={{ bottom: '12%', left: '2%', animationDelay: '2.5s' }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FloatingChip
───────────────────────────────────────────────────────────────────────────── */

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
      className="absolute px-3 py-2 rounded-xl border border-black/[0.18] dark:border-white/[0.08] animate-float z-20"
      style={{
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.75)',
        ...style,
      }}
    >
      <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{text}</p>
      <p className="text-[10px] text-slate-400 dark:text-[#6b6b88] mt-0.5 whitespace-nowrap">{subtext}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Hero
───────────────────────────────────────────────────────────────────────────── */

export default function Hero() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className="relative flex flex-col overflow-hidden">
      <div className="flex-1 flex items-start max-w-7xl mx-auto w-full px-6 pt-28 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start w-full">

          {/* ── Left — content ── */}
          <div className="order-2 lg:order-1 text-center lg:text-left">

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
                Multi-Chain · Collateral-Backed · On-Chain Verified
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 260, damping: 24 }}
              className="text-5xl md:text-6xl lg:text-[64px] font-black tracking-tighter leading-[1.05] text-slate-900 dark:text-white mb-6"
            >
              Liquidity infrastructure
              <br />
              built for{' '}
              <span className={`bg-clip-text text-transparent ${
                isDark
                  ? 'bg-gradient-to-br from-cyan-300 via-cyan-500 to-sky-600'
                  : 'bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800'
              }`}>
                every chain.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, type: 'spring', stiffness: 240, damping: 24 }}
              className="text-lg text-slate-500 dark:text-[#8b8ba8] leading-relaxed max-w-[500px] mb-10 mx-auto lg:mx-0"
            >
              USBT is a collateral-backed liquidity token designed for major blockchain networks. Mint, hold, and redeem with full on-chain transparency — no intermediaries, no opacity.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, type: 'spring', stiffness: 240, damping: 24 }}
              className="flex flex-wrap items-center gap-3 justify-center lg:justify-start"
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
              <Link to="/sell">
                <Button variant="secondary" size="lg">
                  Redeem USBT
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-5 mt-10 pt-8 border-t border-black/[0.16] dark:border-white/[0.06] justify-center lg:justify-start"
            >
              <TrustPill icon={<ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />} text="On-chain verified" />
              <TrustPill icon={<ArrowsLeftRight size={14} className="text-cyan-600 dark:text-cyan-400" />} text="Deep liquidity" />
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

          {/* ── Right — orbital token visual ── */}
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
