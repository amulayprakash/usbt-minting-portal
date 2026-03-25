'use client';
import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from '@phosphor-icons/react';

const FAQS = [
  {
    q: 'What is USBT?',
    a: 'USBT is a TRC-20 token on the Tron mainnet. It is designed to be purchased with USDT and redeemable via the SunSwap liquidity pool. The token contract is publicly verified on TronScan.',
  },
  {
    q: 'How do I buy USBT?',
    a: 'Connect your TronLink wallet, navigate to the Buy page, enter the amount of USDT you want to spend, approve the USDT transfer, then confirm the buyTokens transaction. USBT will appear in your wallet after the transaction confirms.',
  },
  {
    q: 'How do I sell USBT?',
    a: 'On the Sell page, enter the amount of USBT you want to sell. The portal routes the sale through the SunSwap v2 liquidity pool (pair: TEpLryVMYSALJkGJ3n8urG7iWzHDeLyrBS), swapping your USBT for USDT.',
  },
  {
    q: 'Which wallets are supported?',
    a: 'TronLink (browser extension) and TronLink Mobile are fully supported. WalletConnect support is in development. You need a Tron mainnet wallet with TRX for gas fees.',
  },
  {
    q: 'What are the fees?',
    a: 'Buying USBT charges only Tron network energy/bandwidth fees (paid in TRX). Selling via SunSwap incurs the standard 0.3% SunSwap trading fee. There is no additional portal fee.',
  },
  {
    q: 'Is the contract audited?',
    a: 'The contract is published and verified on TronScan. You can review every line of the source code at tronscan.org. Always verify the contract address matches TA22JDzS7HDQPYM38Y4Wsy9N3hLRBSUkGv before interacting.',
  },
  {
    q: 'What happens if there is low liquidity in the pool?',
    a: 'Selling through SunSwap with low pool liquidity results in higher slippage. The portal shows you the estimated output and warns when slippage exceeds 1%. You can always review the pair on sun.io before transacting.',
  },
  {
    q: 'What network do I need?',
    a: 'Tron Mainnet only. Ensure your wallet is set to Tron mainnet before connecting. The portal will display a warning if the wrong network is detected.',
  },
];

export default function FAQ() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section ref={ref} className="max-w-4xl mx-auto px-6 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="text-center mb-14"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-[#4a4a6a] mb-3">
          FAQ
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Common questions.
        </h2>
      </motion.div>

      {/* Accordion */}
      <div className="space-y-2">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 26 }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className={`
                  w-full flex items-start gap-4 px-5 py-4 rounded-2xl border text-left
                  transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                  ${isOpen
                    ? 'border-cyan-500/22 bg-cyan-500/[0.04]'
                    : 'border-black/[0.18] dark:border-white/[0.07] bg-black/[0.025] dark:bg-white/[0.025] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-black/[0.12] dark:hover:border-white/[0.12]'
                  }
                `}
                aria-expanded={isOpen}
              >
                <span
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors duration-300
                    ${isOpen
                      ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                      : 'bg-black/[0.05] dark:bg-white/[0.05] border-black/[0.10] dark:border-white/[0.10] text-slate-400 dark:text-[#6b6b88]'
                    }
                  `}
                >
                  {isOpen ? <Minus size={11} weight="bold" /> : <Plus size={11} weight="bold" />}
                </span>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-snug ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-[#c0c0d0]'}`}>
                    {faq.q}
                  </p>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-slate-500 dark:text-[#8b8ba8] leading-relaxed pt-3 max-w-[65ch]">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
