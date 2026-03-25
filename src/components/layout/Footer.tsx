import { Link } from 'react-router-dom';
import { ArrowSquareOut } from '@phosphor-icons/react';
import Logo from '../ui/Logo';
import {
  CONTRACTS,
  TRONSCAN_CONTRACT_URL,
  SUNSWAP_PAIR_URL,
} from '../../constants/contracts';

const LINKS_CONTRACT = [
  { label: 'USBT Contract', href: TRONSCAN_CONTRACT_URL, external: true },
  { label: 'Liquidity Pool', href: SUNSWAP_PAIR_URL, external: true },
  { label: 'TronScan', href: `https://tronscan.org/#/address/${CONTRACTS.STABLE}`, external: true },
];

const LINKS_PORTAL = [
  { label: 'Buy USBT', to: '/buy' },
  { label: 'Sell USBT', to: '/sell' },
  { label: 'Home', to: '/' },
];

const LINKS_LEGAL = [
  { label: 'Terms of Service', to: '/' },
  { label: 'Privacy Policy', to: '/' },
  { label: 'Risk Disclosure', to: '/' },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.16] dark:border-white/[0.06] bg-[#f5f6fa] dark:bg-[#07070e]">
      {/* Accent line */}
      <div className="accent-line" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 text-center md:text-left">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <Logo size="md" className="mb-4" />
            <p className="text-sm text-slate-500 dark:text-[#6b6b88] leading-relaxed max-w-[200px]">
              A transparent, on-chain stable token built on Tron mainnet.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 relative">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring opacity-60" />
              </span>
              <span className="text-xs text-slate-400 dark:text-[#6b6b88]">Live on Tron Mainnet</span>
            </div>
          </div>

          {/* Contract links */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#4a4a6a] mb-4">
              On-Chain
            </p>
            <ul className="space-y-2.5">
              {LINKS_CONTRACT.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center md:justify-start gap-1.5 text-sm text-slate-500 dark:text-[#8b8ba8] hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {l.label}
                    <ArrowSquareOut size={11} className="opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal links */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#4a4a6a] mb-4">
              Portal
            </p>
            <ul className="space-y-2.5">
              {LINKS_PORTAL.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 dark:text-[#8b8ba8] hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-[#4a4a6a] mb-4">
              Legal
            </p>
            <ul className="space-y-2.5">
              {LINKS_LEGAL.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 dark:text-[#8b8ba8] hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-black/[0.14] dark:border-white/[0.05] flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-400 dark:text-[#4a4a6a] text-center sm:text-left">
            © {new Date().getFullYear()} USBT. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <AddressChip label="Contract" address={CONTRACTS.STABLE} />
            <AddressChip label="Pair" address={CONTRACTS.PAIR} />
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-[11px] text-slate-400 dark:text-[#3f3f52] leading-relaxed max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
          USBT is an experimental token on the Tron network. Interact only with assets you can afford to lose.
          Always verify contract addresses on TronScan before transacting. This interface does not constitute
          financial advice.
        </p>
      </div>
    </footer>
  );
}

function AddressChip({ label, address }: { label: string; address: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.16] dark:border-white/[0.06]">
      <span className="text-[10px] font-medium text-slate-400 dark:text-[#4a4a6a] uppercase tracking-wide">{label}</span>
      <span className="font-mono text-[10px] text-slate-500 dark:text-[#6b6b88]">
        {address.slice(0, 6)}…{address.slice(-4)}
      </span>
    </div>
  );
}
