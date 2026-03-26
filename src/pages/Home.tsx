import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import PresaleBanner from '../components/home/PresaleBanner';
import TokenStats from '../components/home/TokenStats';
import Features from '../components/home/Features';
import Security from '../components/home/Security';
import Roadmap from '../components/home/Roadmap';
import FAQ from '../components/home/FAQ';

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
      <TokenStats />
      <Features />
      <Security />
      <Roadmap />
      <FAQ />
    </motion.main>
  );
}
