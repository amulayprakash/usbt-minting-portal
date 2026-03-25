import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowSquareOut, ShieldCheck, Star, Lightning, Crown, CaretLeft, CaretRight, Gift } from '@phosphor-icons/react';
import BuyPortal from '../components/portal/BuyPortal';
import { TRONSCAN_CONTRACT_URL, CONTRACTS } from '../constants/contracts';

const OFFERS = [
  {
    id: 'starter',
    label: 'Starter Boost',
    sublabel: 'Purchase 20,000+ USDT',
    minUsdt: 20_000,
    bonusPct: 10,
    icon: Star,
    gradient: 'from-cyan-500/[0.13] to-blue-600/[0.06]',
    border: 'border-cyan-500/25',
    activeBorder: 'border-cyan-400/60',
    accent: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    btnBg: 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300',
    glow: 'shadow-[0_0_32px_rgba(6,182,212,0.15)]',
    popular: false,
  },
  {
    id: 'growth',
    label: 'Growth Pack',
    sublabel: 'Purchase 50,000+ USDT',
    minUsdt: 50_000,
    bonusPct: 15,
    icon: Lightning,
    gradient: 'from-violet-500/[0.15] to-purple-600/[0.07]',
    border: 'border-violet-500/30',
    activeBorder: 'border-violet-400/60',
    accent: 'text-violet-400',
    badgeBg: 'bg-violet-500/15',
    badgeText: 'text-violet-300',
    btnBg: 'bg-violet-500/15 hover:bg-violet-500/25 text-violet-300',
    glow: 'shadow-[0_0_32px_rgba(139,92,246,0.18)]',
    popular: true,
  },
  {
    id: 'elite',
    label: 'Elite Tier',
    sublabel: 'Purchase 100,000+ USDT',
    minUsdt: 100_000,
    bonusPct: 20,
    icon: Crown,
    gradient: 'from-amber-500/[0.15] to-yellow-600/[0.07]',
    border: 'border-amber-500/30',
    activeBorder: 'border-amber-400/60',
    accent: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    btnBg: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300',
    glow: 'shadow-[0_0_32px_rgba(245,158,11,0.18)]',
    popular: false,
  },
] as const;

export default function Buy() {
  const infoRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const infoInView = useInView(infoRef, { once: true });
  const [prefillAmount, setPrefillAmount] = useState<number | null>(null);

  const handleOfferSelect = (minUsdt: number) => {
    setPrefillAmount(minUsdt);
    // On mobile the portal is below — scroll it into view
    setTimeout(() => {
      portalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="min-h-[100dvh] pt-28 pb-20 px-6"
    >
      <div className="max-w-6xl mx-auto relative">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-[#6b6b88] hover:text-slate-900 dark:hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/*
          3-item grid:
            Desktop (lg): col 1 = carousel (row 1) + info (row 2) | col 2 = portal (rows 1–2)
            Mobile:        carousel → portal → info  (via order-*)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-x-12 gap-y-8 items-start">

          {/* ── Carousel — mobile: 1st · desktop: col 1 row 1 ── */}
          <div
            ref={infoRef}
            className="order-1 lg:order-none lg:col-start-1 lg:row-start-1"
          >
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={infoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Gift size={13} className="text-slate-400 dark:text-[#5a5a7a]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-[#5a5a7a]">
                  Bonus Offers
                </p>
              </div>
              <OfferCarousel onSelect={handleOfferSelect} />
            </motion.div>
          </div>

          {/* ── Portal — mobile: 2nd · desktop: col 2 rows 1–2 ── */}
          <div
            ref={portalRef}
            className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 w-full"
          >
            <BuyPortal prefillAmount={prefillAmount} />
          </div>

          {/* ── Info — mobile: 3rd · desktop: col 1 row 2 ── */}
          <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={infoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.05 }}
              className="text-center lg:text-left"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-4">
                Buy
              </p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight mb-5">
                Get USBT<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-sky-600 to-cyan-500 dark:from-cyan-300 dark:to-sky-500">
                  with USDT.
                </span>
              </h1>
              <p className="text-slate-500 dark:text-[#8b8ba8] leading-relaxed mb-8 max-w-[400px] mx-auto lg:mx-0">
                Send USDT to the USBT contract and receive USBT in return.
                The transaction settles on Tron mainnet in seconds.
              </p>

              {/* How it works */}
              <div className="space-y-4">
                {[
                  {
                    n: '01',
                    title: 'Connect wallet',
                    desc: 'Connect your TronLink wallet to Tron Mainnet.',
                  },
                  {
                    n: '02',
                    title: 'Enter USDT amount',
                    desc: "Type how much USDT you want to spend. Preview the USBT you'll receive.",
                  },
                  {
                    n: '03',
                    title: 'Approve & confirm',
                    desc: 'Approve the USDT transfer, then confirm the buyTokens transaction.',
                  },
                  {
                    n: '04',
                    title: 'Receive USBT',
                    desc: 'USBT arrives in your wallet within the same transaction block.',
                  },
                ].map((step, i) => (
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, x: -16 }}
                    animate={infoInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      delay: 0.1 + i * 0.07,
                      type: 'spring',
                      stiffness: 260,
                      damping: 26,
                    }}
                    className="flex items-start gap-4 text-left max-w-sm mx-auto lg:mx-0"
                  >
                    <span className="num text-[11px] font-black text-slate-400 dark:text-[#4a4a6a] w-6 flex-shrink-0 mt-0.5">
                      {step.n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">{step.title}</p>
                      <p className="text-sm text-slate-500 dark:text-[#6b6b88] leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Contract ref */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={infoInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
                className="mt-8 p-4 rounded-2xl border border-black/[0.18] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02] max-w-sm mx-auto lg:mx-0 text-left"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={14} className="text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-[#8b8ba8]">Contract reference</span>
                </div>
                <div className="space-y-2">
                  <ContractField label="USBT Contract" value={CONTRACTS.STABLE} />
                  <ContractField label="Function" value="buyTokens · 0x3610724e" />
                </div>
                <a
                  href={TRONSCAN_CONTRACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mt-3 transition-colors"
                >
                  View on TronScan
                  <ArrowSquareOut size={11} />
                </a>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.main>
  );
}

function OfferCarousel({ onSelect }: { onSelect: (minUsdt: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = OFFERS.length;

  const go = (next: number) => {
    setDirection(next > idx ? 1 : -1);
    setIdx(next);
  };
  const prev = () => go((idx - 1 + total) % total);
  const next = () => go((idx + 1) % total);

  // Auto-advance every 2 s
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [total]);

  const offer = OFFERS[idx];
  const Icon = offer.icon;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: 0.96 }),
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={offer.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`
              relative w-full rounded-2xl border p-5
              bg-gradient-to-br ${offer.gradient} ${offer.border}
              ${offer.glow}
            `}
          >
            {offer.popular && (
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] bg-violet-500 text-white px-2.5 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            {/* Top row: icon + badge */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${offer.badgeBg}`}>
                <Icon size={22} weight="fill" className={offer.accent} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-base font-bold ${offer.accent}`}>{offer.label}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${offer.badgeBg} ${offer.badgeText}`}>
                    +{offer.bonusPct}% Bonus
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-[#6b6b88]">{offer.sublabel}</p>
              </div>
            </div>

            {/* Body */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-[#4a4a6a] uppercase tracking-wide mb-1">
                  You get extra
                </p>
                <p className={`text-2xl font-black ${offer.accent}`}>
                  +{offer.bonusPct}% USBT
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#6b6b88] mt-0.5">
                  free on every purchase
                </p>
              </div>
              <button
                onClick={() => onSelect(offer.minUsdt)}
                className={`
                  flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150
                  active:scale-95 border border-transparent
                  ${offer.btnBg}
                `}
              >
                Buy Now →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav row */}
      <div className="flex items-center justify-between mt-3 px-1">
        {/* Dots */}
        <div className="flex gap-1.5">
          {OFFERS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-200 ${
                i === idx
                  ? `w-5 h-1.5 ${OFFERS[i].badgeBg}`
                  : 'w-1.5 h-1.5 bg-slate-300/40 dark:bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex gap-1.5">
          <button
            onClick={prev}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.10] transition-colors"
          >
            <CaretLeft size={12} className="text-slate-500 dark:text-[#6b6b88]" />
          </button>
          <button
            onClick={next}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.10] transition-colors"
          >
            <CaretRight size={12} className="text-slate-500 dark:text-[#6b6b88]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a4a6a] w-20 flex-shrink-0">
        {label}
      </span>
      <span className="font-mono text-xs text-slate-500 dark:text-[#6b6b88] truncate">{value}</span>
    </div>
  );
}
