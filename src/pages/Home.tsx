import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import PresaleBanner from '../components/home/PresaleBanner';
import SupportedChains from '../components/home/SupportedChains';
import TokenStats from '../components/home/TokenStats';
import ProtocolStats from '../components/home/ProtocolStats';
import WhyBuy from '../components/home/WhyBuy';
import Features from '../components/home/Features';
import Security from '../components/home/Security';
import Roadmap from '../components/home/Roadmap';
import HowItWorks from '../components/home/HowItWorks';
import FAQ from '../components/home/FAQ';
import WhitepaperSection from '../components/home/WhitepaperSection';

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Hero />
      <PresaleBanner />
      <SupportedChains />
      <WhyBuy />
      <WhitepaperSection />
      <TokenStats />
      <ProtocolStats />
      <Features />
      <Security />
      <Roadmap />
      <HowItWorks />
      <FAQ />
    </motion.main>
  );
}
