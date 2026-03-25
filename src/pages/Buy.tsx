import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowSquareOut, ShieldCheck } from '@phosphor-icons/react';
import BuyPortal from '../components/portal/BuyPortal';
import { TRONSCAN_CONTRACT_URL, CONTRACTS } from '../constants/contracts';

export default function Buy() {
  const infoRef = useRef<HTMLDivElement>(null);
  const infoInView = useInView(infoRef, { once: true });

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left — info */}
          <div ref={infoRef}>
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={infoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
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
              <p className="text-slate-500 dark:text-[#8b8ba8] leading-relaxed mb-8 max-w-[400px]">
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
                    className="flex items-start gap-4"
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
                className="mt-8 p-4 rounded-2xl border border-black/[0.18] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]"
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

          {/* Right — swap card */}
          <div className="w-full">
            <BuyPortal />
          </div>
        </div>
      </div>
    </motion.main>
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
