'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
  Info,
  ArrowSquareOut,
  CheckCircle,
  Warning,
  X,
} from '@phosphor-icons/react';
import Button from '../ui/Button';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../../hooks/useToast';
import { useTokenPrice } from '../../hooks/useTokenPrice';
import {
  CONTRACTS,
  TRC20_ABI,
  STABLE_ABI,
  DECIMALS_FACTOR,
  DEFAULT_SLIPPAGE_BPS,
  FEE_LIMIT_SUN,
  TRONSCAN_TX_URL,
} from '../../constants/contracts';
import {
  buildTriggerSmartContract,
  abiEncodeUint256,
  abiEncodeAddress,
} from '../../lib/tronGrid';

type TxStep = 'idle' | 'approving' | 'approved' | 'buying' | 'success' | 'error';

export default function BuyPortal() {
  const { account, isConnected, connect, isConnecting, connectionType, wcSignAndBroadcast } = useWallet();
  const { addToast } = useToast();
  const { price, getAmountsOut } = useTokenPrice();

  const [usdtAmount, setUsdtAmount] = useState('');
  const [usbtOut, setUsbtOut] = useState<number | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);
  const [usbtBalance, setUsbtBalance] = useState<number | null>(null);
  const [step, setStep] = useState<TxStep>('idle');
  const [txid, setTxid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [slippage] = useState(DEFAULT_SLIPPAGE_BPS / 100); // 0.5%
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Fetch balances on wallet connect
  useEffect(() => {
    if (!isConnected || !account || !window.tronWeb) return;
    fetchBalances();
  }, [isConnected, account]);

  const fetchBalances = useCallback(async () => {
    if (!window.tronWeb || !account) return;
    try {
      const usdt = await window.tronWeb.contract(TRC20_ABI as unknown as object[], CONTRACTS.COLLATERAL);
      const usbtC = await window.tronWeb.contract(STABLE_ABI as unknown as object[], CONTRACTS.STABLE);

      const [rawUsdt, rawUsbt] = await Promise.all([
        usdt.balanceOf(account).call() as Promise<bigint>,
        usbtC.balanceOf(account).call() as Promise<bigint>,
      ]);

      setUsdtBalance(Number(rawUsdt) / DECIMALS_FACTOR);
      setUsbtBalance(Number(rawUsbt) / DECIMALS_FACTOR);
    } catch {
      // Silently fail — balances are display-only
    }
  }, [account]);

  // Debounced quote
  useEffect(() => {
    if (!usdtAmount || Number(usdtAmount) <= 0) {
      setUsbtOut(null);
      return;
    }
    setQuoteLoading(true);
    const t = setTimeout(async () => {
      const out = await getAmountsOut(Number(usdtAmount), false);
      setUsbtOut(out);
      setQuoteLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [usdtAmount, getAmountsOut]);

  const handleMaxUsdt = () => {
    if (usdtBalance !== null) {
      setUsdtAmount(usdtBalance.toFixed(6));
    }
  };

  const handleBuy = async () => {
    if (!account) return;
    const parsed = parseFloat(usdtAmount);
    if (!parsed || parsed <= 0) return;

    setErrorMsg(null);
    setTxid(null);

    const amountUnits = BigInt(Math.floor(parsed * DECIMALS_FACTOR));
    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

    try {
      // ── WalletConnect path ─────────────────────────────────────────────
      if (connectionType === 'walletconnect') {
        // 1. Check current allowance via TronGrid constant call
        setStep('approving');

        // Build approve tx if needed
        const approveParam =
          abiEncodeAddress(CONTRACTS.STABLE) + abiEncodeUint256(maxUint256);
        const approveTx = await buildTriggerSmartContract({
          ownerAddress: account,
          contractAddress: CONTRACTS.COLLATERAL,
          functionSelector: 'approve(address,uint256)',
          parameter: approveParam,
          feeLimit: FEE_LIMIT_SUN,
        });
        await wcSignAndBroadcast(approveTx);
        addToast({ type: 'info', title: 'USDT approved', message: 'Confirm purchase in wallet.' });

        // 2. Buy tokens
        setStep('buying');
        const buyParam = abiEncodeUint256(amountUnits);
        const buyTx = await buildTriggerSmartContract({
          ownerAddress: account,
          contractAddress: CONTRACTS.STABLE,
          functionSelector: 'buyTokens(uint256)',
          parameter: buyParam,
          feeLimit: FEE_LIMIT_SUN,
        });
        const hash = await wcSignAndBroadcast(buyTx);

        setTxid(hash);
        setStep('success');
        setUsdtAmount('');
        setUsbtOut(null);
        fetchBalances();
        addToast({ type: 'success', title: 'Purchase complete', message: 'USBT added to your wallet.', txid: hash, duration: 8000 });
        return;
      }

      // ── TronLink path ──────────────────────────────────────────────────
      if (!window.tronWeb) throw new Error('TronLink not detected. Please connect TronLink.');

      // Ensure TronWeb's internal defaultAddress is synced — prevents
      // "Cannot read properties of undefined (reading 'toLowerCase')"
      // which occurs when TronLink connects via the newer requestAccounts
      // API and window.tronWeb.defaultAddress.hex is left undefined.
      if (typeof (window.tronWeb as any).setAddress === 'function') {
        (window.tronWeb as any).setAddress(account);
      }

      // Step 1 — Check allowance
      const usdtContract = await window.tronWeb.contract(
        TRC20_ABI as unknown as object[],
        CONTRACTS.COLLATERAL
      );

      // TronWeb may return BigNumber (bignumber.js) or bigint depending on
      // the installed TronLink version; normalise to bigint for safe comparison.
      const rawAllowance: unknown = await usdtContract
        .allowance(account, CONTRACTS.STABLE)
        .call();
      const currentAllowance = BigInt(
        rawAllowance !== null && typeof rawAllowance === 'object'
          ? (
              (rawAllowance as Record<string | number, unknown>)[0] ??
              (rawAllowance as Record<string, unknown>)['remaining'] ??
              rawAllowance
            ).toString()
          : String(rawAllowance)
      );

      if (currentAllowance < amountUnits) {
        setStep('approving');
        await usdtContract.approve(CONTRACTS.STABLE, maxUint256).send({
          from: account,
          feeLimit: FEE_LIMIT_SUN,
        });
        addToast({
          type: 'info',
          title: 'USDT approved',
          message: 'You can now confirm the purchase.',
        });
      }

      setStep('buying');

      // Step 2 — Buy tokens
      const stableContract = await window.tronWeb.contract(
        STABLE_ABI as unknown as object[],
        CONTRACTS.STABLE
      );

      const result = await stableContract
        .buyTokens(amountUnits)
        .send({
          from: account,
          feeLimit: FEE_LIMIT_SUN,
        });

      const hash: string =
        result?.txid ?? result?.transaction?.txID ?? '';

      setTxid(hash);
      setStep('success');
      setUsdtAmount('');
      setUsbtOut(null);
      fetchBalances();

      addToast({
        type: 'success',
        title: 'Purchase complete',
        message: `USBT has been added to your wallet.`,
        txid: hash,
        duration: 8000,
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Transaction rejected or failed. Please try again.';
      setErrorMsg(msg);
      setStep('error');
      addToast({ type: 'error', title: 'Transaction failed', message: msg });
    }
  };

  const reset = () => {
    setStep('idle');
    setErrorMsg(null);
    setTxid(null);
  };

  const isLoading = step === 'approving' || step === 'buying';
  const parsedUsdt = parseFloat(usdtAmount) || 0;
  const insufficient = usdtBalance !== null && parsedUsdt > usdtBalance;
  const canSubmit = isConnected && parsedUsdt > 0 && !insufficient && step !== 'success';

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer bezel */}
      <div className="bezel-outer">
        <div
          className="rounded-[calc(1.5rem-1px)] p-6"
          style={{
            background: 'var(--bg-surface)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.8), 0 32px 80px rgba(0,0,0,0.12)',
          }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-[#4a4a6a] mb-1">
                Mint
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Buy USBT</h2>
            </div>
            {price !== null && (
              <div className="text-right">
                <p className="text-[10px] text-slate-400 dark:text-[#4a4a6a] uppercase tracking-wide mb-0.5">
                  Price
                </p>
                <p className="num text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  ${price.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          {/* Success state */}
          <AnimatePresence mode="wait">
            {step === 'success' ? (
              <SuccessState txid={txid} onReset={reset} />
            ) : step === 'error' ? (
              <ErrorState message={errorMsg} onReset={reset} />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* You pay — USDT */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-[#6b6b88]">You pay</label>
                    {usdtBalance !== null && (
                      <button
                        onClick={handleMaxUsdt}
                        className="text-[10px] text-cyan-600/70 dark:text-cyan-400/70 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        Balance: {usdtBalance.toFixed(2)} USDT · Max
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={usdtAmount}
                      onChange={(e) => setUsdtAmount(e.target.value)}
                      disabled={isLoading}
                      className={`
                        swap-input px-4 py-4 pr-20 text-xl font-bold
                        placeholder-slate-300 dark:placeholder-[#3f3f52] rounded-2xl
                        ${insufficient ? 'border-red-500/40 bg-red-500/5' : ''}
                      `}
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                        <span className="text-[8px] font-black text-green-400">T</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 dark:text-[#8b8ba8]">USDT</span>
                    </div>
                  </div>
                  {insufficient && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <Warning size={11} />
                      Insufficient USDT balance
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-3">
                  <div className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.20] dark:border-white/[0.08] flex items-center justify-center">
                    <ArrowDown size={14} className="text-slate-400 dark:text-[#6b6b88]" />
                  </div>
                </div>

                {/* You receive — USBT */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-[#6b6b88]">You receive</label>
                    {usbtBalance !== null && (
                      <span className="text-[10px] text-slate-400 dark:text-[#4a4a6a]">
                        Balance: {usbtBalance.toFixed(2)} USBT
                      </span>
                    )}
                  </div>
                  <div
                    className="swap-input px-4 py-4 pr-20 rounded-2xl flex items-center justify-between"
                    style={{ minHeight: 62 }}
                  >
                    <span
                      className={`text-xl font-bold transition-colors ${
                        usbtOut !== null ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-300 dark:text-[#3f3f52]'
                      }`}
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      {quoteLoading ? (
                        <span className="skeleton inline-block w-20 h-6" />
                      ) : usbtOut !== null && !isNaN(usbtOut) ? (
                        usbtOut.toFixed(4)
                      ) : (
                        '0.00'
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <span className="text-[7px] font-black text-cyan-600 dark:text-cyan-400">U</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-[#8b8ba8]">USBT</span>
                    </div>
                  </div>
                </div>

                {/* Details row */}
                {parsedUsdt > 0 && usbtOut !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.16] dark:border-white/[0.06] space-y-2"
                  >
                    <DetailRow
                      label="Rate"
                      value={`1 USBT = ${price !== null ? `$${price.toFixed(4)}` : '—'} USDT`}
                    />
                    <DetailRow label="Slippage tolerance" value={`${slippage}%`} />
                    <DetailRow label="Network fee" value="~1–5 TRX" />
                    <DetailRow
                      label="Contract"
                      value={`${CONTRACTS.STABLE.slice(0, 8)}…`}
                      link={`https://tronscan.org/#/contract/${CONTRACTS.STABLE}`}
                    />
                  </motion.div>
                )}

                {/* Status label during approval / buying */}
                {(step === 'approving' || step === 'buying') && (
                  <div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/20">
                    <span className="w-4 h-4 rounded-full border-[1.5px] border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                    <span className="text-sm text-cyan-600 dark:text-cyan-300">
                      {step === 'approving'
                        ? 'Approving USDT… confirm in wallet'
                        : 'Buying USBT… confirm in wallet'}
                    </span>
                  </div>
                )}

                {/* CTA */}
                {!isConnected ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isConnecting}
                    onClick={connect}
                  >
                    Connect Wallet
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={!canSubmit}
                    onClick={handleBuy}
                  >
                    {step === 'approving'
                      ? 'Approving USDT…'
                      : step === 'buying'
                      ? 'Buying USBT…'
                      : `Buy USBT${parsedUsdt > 0 ? ` · ${parsedUsdt} USDT` : ''}`}
                  </Button>
                )}

                {/* Wallet not detected warning */}
                {isConnected && !window.tronWeb && (
                  <p className="text-xs text-amber-400 mt-3 flex items-center gap-1.5">
                    <Warning size={13} />
                    TronLink not detected. Install TronLink to proceed.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 dark:text-[#3f3f52] text-center mt-4 leading-relaxed px-2">
        Always verify the contract address before transacting.
        Transactions on Tron are irreversible.
      </p>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500 dark:text-[#6b6b88]">{label}</span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          {value}
          <ArrowSquareOut size={10} />
        </a>
      ) : (
        <span className="text-xs font-medium text-slate-900 dark:text-white">{value}</span>
      )}
    </div>
  );
}

function SuccessState({
  txid,
  onReset,
}: {
  txid: string | null;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="flex flex-col items-center text-center py-8"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center mb-5">
        <CheckCircle size={32} weight="fill" className="text-emerald-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Purchase complete</h3>
      <p className="text-sm text-slate-500 dark:text-[#8b8ba8] mb-5">
        USBT has been sent to your wallet. It may take a moment to appear.
      </p>
      {txid && (
        <a
          href={TRONSCAN_TX_URL(txid)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mb-6 transition-colors"
        >
          {txid.slice(0, 10)}…{txid.slice(-8)}
          <ArrowSquareOut size={12} />
        </a>
      )}
      <Button variant="secondary" onClick={onReset}>
        Make another purchase
      </Button>
    </motion.div>
  );
}

function ErrorState({
  message,
  onReset,
}: {
  message: string | null;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="flex flex-col items-center text-center py-8"
    >
      <div className="w-16 h-16 rounded-full bg-red-500/12 border border-red-500/25 flex items-center justify-center mb-5">
        <X size={28} className="text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Transaction failed</h3>
      {message && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-5 max-w-[280px] leading-relaxed">{message}</p>
      )}
      <Button variant="secondary" onClick={onReset}>
        Try again
      </Button>
    </motion.div>
  );
}
