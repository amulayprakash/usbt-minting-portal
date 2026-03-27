'use client';
import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from '@phosphor-icons/react';

const FAQS = [
  {
    q: 'What is USBT?',
    a: 'USBT is a collateral-backed liquidity token. It is issued on-chain against USDT collateral and is designed to hold a stable unit of account while giving holders direct access to on-chain liquidity. The contract is publicly verified and open source.',
  },
  {
    q: 'How do I get USBT?',
    a: 'Connect a compatible Web3 wallet, navigate to the Get USBT page, enter the amount of USDT you want to deposit, approve the transfer, and confirm the issuance transaction. USBT will appear in your wallet once the transaction confirms on-chain.',
  },
  {
    q: 'How do I redeem USBT?',
    a: 'On the Redeem page, enter the amount of USBT you want to exit. The portal routes the redemption through the on-chain liquidity pair, returning USDT to your wallet at the current pool rate.',
  },
  {
    q: 'Which wallets are supported?',
    a: "Any compatible Web3 wallet can connect to this portal. Desktop extensions and mobile wallets are both supported. You will need a small amount of the network's native token to cover gas fees.",
  },
  {
    q: 'What are the fees?',
    a: 'Getting USBT incurs only standard network gas fees. Redeeming via the liquidity pool incurs the standard DEX trading fee (0.3%). There is no additional portal fee layered on top.',
  },
  {
    q: 'Is the contract audited?',
    a: 'The contract is published and publicly verified. You can review every line of the source code on-chain at any time. Always confirm the contract address matches the one displayed in this portal before interacting.',
  },
  {
    q: 'What happens if liquidity in the pool is low?',
    a: 'Redeeming with low pool liquidity results in higher slippage. The portal displays your estimated output and flags a warning when slippage exceeds 1%. We recommend reviewing pool depth before large redemptions.',
  }
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
