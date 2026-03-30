'use client';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  CurrencyDollarSimple,
  Gift,
  Anchor,
  Lightning,
  Globe,
  Star,
  Wallet,
  Storefront,
  ShieldCheck,
  LockSimple,
  CheckCircle,
  ArrowRight,
  Sparkle
} from '@phosphor-icons/react';
import Button from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

const BENEFITS = [
  {
    icon: CurrencyDollarSimple,
    title: 'Real Utility',
    body: 'Accepted across the platform ecosystem for payments, services, and access.',
    metric: 'Payments · Access',
  },
  {
    icon: Gift,
    title: 'Redeemable Rewards',
    body: 'Holders unlock exclusive benefits, offers, and platform perks.',
    metric: 'Exclusive Perks',
  },
  {
    icon: Anchor,
    title: 'Stable by Design',
    body: '1:1 USDT-backed, collateral-secured, always redeemable at par.',
    metric: 'Always at Par',
  },
  {
    icon: Lightning,
    title: 'Instant Access',
    body: 'Mint and redeem in seconds with no lock-up or delay.',
    metric: 'Zero Delay',
  },
  {
    icon: Globe,
    title: 'Multi-Chain Ready',
    body: 'Use USBT across 9+ networks — seamlessly bridged and liquid.',
    metric: 'Cross-Chain',
  },
  {
    icon: Star,
    title: 'Holder Benefits',
    body: 'Early adopters gain priority access to upcoming features and campaigns.',
    metric: 'Priority Access',
  },
];

type OfferStatus = 'active' | 'ongoing' | 'coming-soon' | 'available';

const OFFERS: {
  title: string;
  body: string;
  badge: string;
  status: OfferStatus;
  featured: boolean;
  icon?: any;
}[] = [
  {
    featured: true,
    title: 'Early Adopter Bonus',
    body: 'Buy during the presale phase and receive priority access to exclusive platform rewards. Limited allocation.',
    badge: 'Active Now',
    status: 'active',
  },
  {
    featured: false,
    title: 'Holder Access Pass',
    body: 'Maintain a qualifying balance and unlock access to premium features as they launch.',
    badge: 'Ongoing',
    status: 'ongoing',
    icon: LockSimple,
  },
  {
    featured: false,
    title: 'Rewards Campaign',
    body: 'Participate in upcoming reward campaigns. Allocations distributed to qualifying holders.',
    badge: 'Coming Soon',
    status: 'coming-soon',
    icon: Gift,
  },
  {
    featured: false,
    title: 'Platform Credits',
    body: 'Redeem USBT for platform credits usable across the ecosystem.',
    badge: 'Available',
    status: 'available',
    icon: CurrencyDollarSimple,
  },
];

const REDEEM_STEPS = [
  {
    num: '1',
    icon: CurrencyDollarSimple,
    title: 'Buy USBT',
    desc: 'Mint USBT through the portal by depositing USDT.',
  },
  {
    num: '2',
    icon: Wallet,
    title: 'Hold & Qualify',
    desc: 'Maintain your balance to become eligible for active reward campaigns.',
  },
  {
    num: '3',
    icon: Storefront,
    title: 'Visit Rewards Center',
    desc: 'Access the rewards dashboard to view your available offers.',
  },
  {
    num: '4',
    icon: Gift,
    title: 'Redeem Your Perks',
    desc: 'Select and claim your benefits through the available redemption options.',
  },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Secure Platform' },
  { icon: LockSimple, label: 'Transparent Access' },
  { icon: CheckCircle, label: 'Easy Redemption' },
  { icon: Star, label: 'Real Utility' },
];

const BADGE_STYLES: Record<OfferStatus, string> = {
  active: 'text-emerald-700 dark:text-emerald-400 bg-emerald-400/[0.12] border-emerald-500/20 shadow-[0_2px_12px_rgba(16,185,129,0.15)]',
  ongoing: 'text-cyan-700 dark:text-cyan-400 bg-cyan-400/[0.12] border-cyan-500/20 shadow-[0_2px_12px_rgba(6,182,212,0.15)]',
  'coming-soon':
    'text-slate-600 dark:text-[#8b8ba8] bg-black/[0.06] dark:bg-white/[0.06] border-black/[0.10] dark:border-white/[0.10]',
  available: 'text-amber-700 dark:text-amber-400 bg-amber-400/[0.12] border-amber-500/20 shadow-[0_2px_12px_rgba(245,158,11,0.15)]',
};

const CarouselContent = () => (
  <>
    {/* Featured Offer Card */}
    <div className="flex-none w-[85vw] sm:w-[480px] md:w-[580px] h-[400px]">
      <div className="relative h-full overflow-hidden rounded-[2rem] p-8 sm:p-10 flex flex-col justify-end bg-slate-900 isolate group cursor-pointer hover:shadow-[0_24px_50px_-12px_rgba(6,182,212,0.3)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-400">
        <div className="absolute inset-0 pointer-events-none">
            <img
              src="/redeem/Social Promo Poster — Featured Offer.png"
              alt=""
              className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-105 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 sm:gap-3 mb-4 sm:mb-5">
              <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${BADGE_STYLES['active']} backdrop-blur-md`}>
                Active Now
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 flex justify-center sm:justify-start items-center gap-1">
                <Star weight="fill" /> Featured
              </span>
            </div>
            <h4 className="text-3xl font-black text-white tracking-tight mb-3">Early Adopter Bonus</h4>
            <p className="text-slate-300 text-[15px] sm:text-base leading-relaxed mb-6 max-w-md mx-auto sm:mx-0">
              Buy during the presale phase and receive priority access to exclusive platform rewards. Limited allocation.
            </p>
            
            <div className="flex items-center justify-center sm:justify-start gap-2 text-cyan-400 font-semibold group-hover:text-cyan-300 group-hover:gap-3 transition-all">
              Redeem Offer <ArrowRight weight="bold" />
            </div>
        </div>
      </div>
    </div>

    {/* Standard Offer Cards */}
    {OFFERS.filter(o => !o.featured).map((offer) => {
      const Icon = offer.icon;
      return (
      <div key={offer.title} className="flex-none w-[75vw] sm:w-[320px] md:w-[360px] h-[400px]">
        <div className="h-full rounded-[2rem] p-[1px] bg-gradient-to-b from-black/[0.08] to-transparent dark:from-white/[0.08] dark:to-transparent group hover:from-cyan-500/30 hover:to-transparent transition-colors duration-400">
          <div className="relative overflow-hidden h-full rounded-[calc(2rem-1px)] bg-white/60 dark:bg-[#0d0d1a]/60 backdrop-blur-2xl p-7 sm:p-8 flex flex-col cursor-pointer active:scale-[0.98] hover:shadow-[0_16px_40px_-12px_rgba(6,182,212,0.1)] hover:-translate-y-1 transition-all duration-300">
            
            {/* Background Icon/Symbol Accent */}
            {Icon && (
               <div className="absolute -top-8 -right-8 text-slate-100 dark:text-slate-800/40 group-hover:text-cyan-500/10 transition-colors duration-500 transform group-hover:scale-110 group-hover:-rotate-12 pointer-events-none z-0">
                 <Icon size={200} weight="fill" />
               </div>
            )}

            {/* Glowing Accent Gradient */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

            <div className="mb-auto relative z-10 text-center sm:text-left">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${BADGE_STYLES[offer.status]}`}>
                  {offer.badge}
                </span>
            </div>
            
            <div className="mt-8 relative z-10 text-center sm:text-left">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                  {offer.title}
                </h4>
                
                <p className="text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed mb-8">
                  {offer.body}
                </p>
                
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    Learn more <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

          </div>
        </div>
      </div>
      );
    })}
  </>
);

export default function WhyBuy() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ offset: ['start end', 'end start'], target: containerRef });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={containerRef} className="relative py-28 overflow-hidden bg-transparent">
      {/* Background radial glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[800px] pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(6,182,212,0.06) 0%, transparent 100%)'
            : 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(6,182,212,0.04) 0%, transparent 100%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* ── 1. Premium Section Intro ── */}
        <div className="flex flex-col md:flex-row gap-12 items-center justify-between mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="flex-1 max-w-2xl flex flex-col items-center md:items-start text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Sparkle weight="fill" className="text-cyan-600 dark:text-cyan-400" size={14} />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
                The USBT Advantage
              </span>
            </div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-[76px] font-black tracking-[-0.03em] leading-[0.95] text-slate-900 dark:text-white mb-6">
              Why hold USBT. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600">
                What you unlock.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-[45ch] leading-[1.6]">
              Real utility, exclusive rewards, and instant redemption — built into every token. Elevate your portfolio with a stablecoin that works for you.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 w-full">
               <Link to="/buy">
                 <Button variant="primary" size="lg" className="hover:-translate-y-0.5 shadow-[0_8px_24px_-8px_rgba(6,182,212,0.5)] transition-transform">
                   Mint USBT Now
                 </Button>
               </Link>
               <button 
                 onClick={() => document.getElementById('whybuy-offers')?.scrollIntoView({ behavior: 'smooth' })}
                 className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
               >
                 View Exclusive Offers
               </button>
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroY }}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ type: 'spring', stiffness: 180, damping: 28, delay: 0.1 }}
            className="flex-1 w-full max-w-xl"
          >
            <div className="relative rounded-[2rem] p-2 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.5)] backdrop-blur-3xl transform rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
              <img
                src="/redeem/Hero Banner — Rewards Section.png"
                alt="USBT Rewards"
                className="w-full h-auto rounded-[1.5rem] object-cover"
              />
              <div className="absolute inset-0 rounded-[2rem] pointer-events-none ring-1 ring-inset ring-white/10" />
            </div>
          </motion.div>
        </div>

        {/* ── 2. Benefits (Asymmetric Broken Grid with Sticky Poster) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-32 relative">
          
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-20 h-[calc(100vh-5rem)] pb-10 flex flex-col justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ type: 'spring', stiffness: 180, damping: 28, delay: 0.1 }}
                className="w-full max-w-sm xl:max-w-md"
              >
                <div className="relative rounded-[2rem] p-2 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.5)] backdrop-blur-3xl transform -rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
                  <img
                    src="/redeem/Why Buy USBT Feature Poster.png"
                    alt="USBT Benefits Overview"
                    className="w-full h-auto rounded-[1.5rem] object-cover"
                  />
                  <div className="absolute inset-0 rounded-[2rem] pointer-events-none ring-1 ring-inset ring-white/10" />
                </div>
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="lg:hidden mb-8 col-span-full flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ type: 'spring', stiffness: 180, damping: 28, delay: 0.1 }}
                className="w-full max-w-sm sm:max-w-md"
              >
                <div className="relative rounded-[2rem] p-2 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.5)] backdrop-blur-3xl transform -rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
                  <img
                    src="/redeem/Why Buy USBT Feature Poster.png"
                    alt="USBT Benefits Overview"
                    className="w-full h-auto rounded-[1.5rem] object-cover"
                  />
                  <div className="absolute inset-0 rounded-[2rem] pointer-events-none ring-1 ring-inset ring-white/10" />
                </div>
              </motion.div>
            </div>
            
            {BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon;
              const isOdd = i % 2 !== 0;
              
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 250, damping: 24 }}
                  className={`flex h-full ${isOdd ? 'sm:mt-12' : ''}`}
                >
                  <div className="group relative p-[1px] rounded-[1.75rem] w-full bg-gradient-to-b from-black/[0.08] to-transparent dark:from-white/[0.08] dark:to-transparent hover:from-cyan-500/30 hover:to-cyan-500/5 transition-all duration-500">
                    <div className="relative h-full flex flex-col p-6 sm:p-7 rounded-[calc(1.75rem-1px)] bg-white/80 dark:bg-[#0d0d1a]/80 backdrop-blur-xl shadow-sm hover:shadow-[0_16px_40px_-12px_rgba(6,182,212,0.15)] active:scale-[0.98] transition-all duration-300">
                      
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 mx-auto sm:mx-0 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 ease-out border border-cyan-500/20">
                        <Icon size={24} weight="duotone" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-center sm:text-left text-slate-900 dark:text-white mb-3 tracking-tight">
                        {benefit.title}
                      </h3>
                      
                      <p className="text-center sm:text-left text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed mb-6 flex-1">
                        {benefit.body}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800/80 w-full text-center sm:text-left">
                         <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600/80 dark:text-cyan-400/80">
                           {benefit.metric}
                         </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── 3. Exclusive Offers (Infinite Auto-Scroll Carousel) ── */}
        <div id="whybuy-offers" className="mb-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 220 }}
              className="text-center md:text-left w-full"
            >
               <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.02em] text-slate-900 dark:text-white">
                 Unlock Offers
               </h3>
               <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">Exclusive perks reserved for USBT holders.</p>
            </motion.div>
          </div>

          <div className="relative -mx-6 sm:-mx-12 px-6 sm:px-12 py-12 -my-12 overflow-hidden mask-edges group/carousel">
            <div className="flex w-max">
              <div className="flex min-w-max animate-infinite-slide gap-4 sm:gap-6 pr-4 sm:pr-6 group-hover/carousel:pause-animation">
                <CarouselContent />
              </div>
              <div aria-hidden="true" className="flex min-w-max animate-infinite-slide gap-4 sm:gap-6 pr-4 sm:pr-6 group-hover/carousel:pause-animation">
                <CarouselContent />
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. How Redemption Works (Connected Flow) ── */}
        <div className="mb-32">
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 220 }}
              className="text-center mb-16"
            >
               <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.02em] text-slate-900 dark:text-white">
                 How it works.
               </h3>
               <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg max-w-xl mx-auto">
                 Unlock value in four simple steps. Seamless and straightforward.
               </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
               
               {/* Left: Step flow timeline */}
               <div className="relative pl-6 sm:pl-8">
                  {/* Vertical connecting line background */}
                  <div className="absolute left-[1.15rem] sm:left-[1.65rem] top-8 bottom-8 w-[2px] bg-slate-200 dark:bg-slate-800 rounded-full" />
                  
                  {/* Animated solid line over top */}
                  <motion.div 
                     initial={{ height: 0 }}
                     whileInView={{ height: 'calc(100% - 4rem)' }}
                     viewport={{ once: true, margin: '-20%' }}
                     transition={{ duration: 1.5, ease: 'easeOut' }}
                     className="absolute left-[1.15rem] sm:left-[1.65rem] top-8 w-[2px] bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"
                  />

                  <div className="flex flex-col gap-10">
                     {REDEEM_STEPS.map((step, i) => {
                        const Icon = step.icon;
                        return (
                           <motion.div 
                              key={step.num}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true, margin: '-50px' }}
                              transition={{ delay: i * 0.2, type: 'spring', stiffness: 250 }}
                              className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 group"
                           >
                              {/* Step circle */}
                              <div className="relative z-10 flex items-center justify-center w-10 h-10 mx-auto sm:ml-[-1rem] sm:mx-0 rounded-full bg-white dark:bg-[#0d0d1a] border-4 border-slate-100 dark:border-slate-800 shadow-sm group-hover:border-cyan-400 dark:group-hover:border-cyan-500 transition-colors duration-400 flex-shrink-0">
                                 <span className="text-sm font-black text-slate-900 dark:text-white">
                                    {step.num}
                                 </span>
                              </div>
                              
                              <div className="flex-1 pt-0.5 text-center sm:text-left">
                                 <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex flex-col sm:flex-row items-center sm:justify-start gap-2 tracking-tight">
                                    {step.title}
                                 </h4>
                                 <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto sm:mx-0">
                                    {step.desc}
                                 </p>
                              </div>
                           </motion.div>
                        );
                     })}
                  </div>
               </div>

               {/* Right: Infographic Poster */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  className="rounded-[2rem] overflow-hidden shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-white/5"
               >
                  <img
                     src="/redeem/Rewards & Redemption Infographic.png"
                     alt="How to Redeem USBT"
                     className="w-full h-auto"
                  />
               </motion.div>

            </div>
        </div>

        {/* ── 5. High-Conversion CTA & Trust ── */}
        <div className="flex flex-col items-center justify-center pt-20 pb-12 text-center border-t border-slate-200 dark:border-slate-800/80">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ type: 'spring', stiffness: 220 }}
            >
               <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-[-0.02em] mb-8">
                 Ready to unlock these benefits?
               </h2>
               
               <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                 <Link to="/buy">
                   <Button
                     variant="primary"
                     size="lg"
                     className="min-w-[200px] shadow-[0_8px_32px_-8px_rgba(6,182,212,0.4)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
                   >
                     Mint USBT Now
                   </Button>
                 </Link>
                 <Link to="/" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors py-3">
                   Explore Platform
                 </Link>
               </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2, duration: 0.8 }}
               className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 mt-16"
            >
               {TRUST_BADGES.map((badge) => {
                  const Icon = badge.icon;
                  return (
                     <div key={badge.label} className="flex items-center gap-2.5 group">
                        <Icon size={18} weight="duotone" className="text-cyan-500 dark:text-cyan-400 group-hover:scale-110 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-all" />
                        <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">{badge.label}</span>
                     </div>
                  );
               })}
            </motion.div>
        </div>

      </div>

      <style>{`
        @keyframes infinite-slide {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
        .animate-infinite-slide {
          animation: infinite-slide 30s linear infinite;
        }
        .pause-animation {
          animation-play-state: paused;
        }
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </section>
  );
}
