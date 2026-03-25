'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
  Warning,
  ArrowSquareOut,
  CheckCircle,
  X,
  Info,
} from '@phosphor-icons/react';
import Button from '../ui/Button';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../../hooks/useToast';
import { useTokenPrice } from '../../hooks/useTokenPrice';
import {
  CONTRACTS,
  TRC20_ABI,
  STABLE_ABI,
  ROUTER_ABI,
  DECIMALS_FACTOR,
  DEFAULT_SLIPPAGE_BPS,
  DEFAULT_DEADLINE_MINUTES,
  FEE_LIMIT_SUN,
  TRONSCAN_TX_URL,
  SUNSWAP_PAIR_URL,
} from '../../constants/contracts';
import {
  buildTriggerSmartContract,
  abiEncodeUint256,
  abiEncodeAddress,
  abiEncodeAddressArray,
} from '../../lib/tronGrid';

type TxStep = 'idle' | 'approving' | 'swapping' | 'success' | 'error';

export default function SellPortal() {
  const { account, isConnected, connect, isConnecting, connectionType, wcSignAndBroadcast } = useWallet();
  const { addToast } = useToast();
  const { price, getAmountsOut } = useTokenPrice();

  const [usbtAmount, setUsbtAmount] = useState('');
  const [usdtOut, setUsdtOut] = useState<number | null>(null);
  const [usbtBalance, setUsbtBalance] = useState<number | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);
  const [step, setStep] = useState<TxStep>('idle');
  const [txid, setTxid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [slippageBps] = useState(DEFAULT_SLIPPAGE_BPS); // 0.5%
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);

  useEffect(() => {
    if (!isConnected || !account || !window.tronWeb) return;
    fetchBalances();
  }, [isConnected, account]);

  const fetchBalances = useCallback(async () => {
    if (!window.tronWeb || !account) return;
    try {
      const usdtC = await window.tronWeb.contract(
        TRC20_ABI as unknown as object[],
        CONTRACTS.COLLATERAL
      );
      const usbtC = await window.tronWeb.contract(
        STABLE_ABI as unknown as object[],
        CONTRACTS.STABLE
      );

      const [rawUsdt, rawUsbt] = await Promise.all([
        usdtC.balanceOf(account).call() as Promise<bigint>,
        usbtC.balanceOf(account).call() as Promise<bigint>,
      ]);

      setUsdtBalance(Number(rawUsdt) / DECIMALS_FACTOR);
      setUsbtBalance(Number(rawUsbt) / DECIMALS_FACTOR);
    } catch {
      // silent
    }
  }, [account]);

  // Debounced quote
  useEffect(() => {
    if (!usbtAmount || Number(usbtAmount) <= 0) {
      setUsdtOut(null);
      setPriceImpact(null);
      return;
    }
    setQuoteLoading(true);
    const t = setTimeout(async () => {
      const out = await getAmountsOut(Number(usbtAmount), true);
      setUsdtOut(out);

      // Calculate price impact vs spot price
      if (out !== null && price !== null && Number(usbtAmount) > 0) {
        const expectedAtSpot = Number(usbtAmount) * price;
        const impact = ((expectedAtSpot - out) / expectedAtSpot) * 100;
        setPriceImpact(impact > 0 ? impact : 0);
      }

      setQuoteLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [usbtAmount, getAmountsOut, price]);

  const handleMaxUsbt = () => {
    if (usbtBalance !== null) {
      setUsbtAmount(usbtBalance.toFixed(6));
    }
  };

  const handleSell = async () => {
    if (!account) return;
    const parsed = parseFloat(usbtAmount);
    if (!parsed || parsed <= 0 || usdtOut === null) return;

    setErrorMsg(null);
    setTxid(null);

    const amountUnits = BigInt(Math.floor(parsed * DECIMALS_FACTOR));
    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    const slippageFactor = 1 - slippageBps / 10000;
    const minOut = BigInt(Math.floor(usdtOut * slippageFactor * DECIMALS_FACTOR));
    const deadline = Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_MINUTES * 60;
    const path = [CONTRACTS.STABLE, CONTRACTS.COLLATERAL];

    try {
      // ── WalletConnect path ─────────────────────────────────────────────
      if (connectionType === 'walletconnect') {
        setStep('approving');

        const approveParam =
          abiEncodeAddress(CONTRACTS.ROUTER) + abiEncodeUint256(maxUint256);
        const approveTx = await buildTriggerSmartContract({
          ownerAddress: account,
          contractAddress: CONTRACTS.STABLE,
          functionSelector: 'approve(address,uint256)',
          parameter: approveParam,
          feeLimit: FEE_LIMIT_SUN,
        });
        await wcSignAndBroadcast(approveTx);
        addToast({ type: 'info', title: 'USBT approved', message: 'Confirm swap in wallet.' });

        setStep('swapping');

        // swapExactTokensForTokens(uint256,uint256,address[],address,uint256)
        // Encode: amountIn, amountOutMin, path (dynamic array), to, deadline
        const swapParam =
          abiEncodeUint256(amountUnits) +
          abiEncodeUint256(minOut) +
          abiEncodeUint256(5 * 32) + // offset for path (5 static slots before dynamic data, 0-indexed: slot 3 = 3*32)
          abiEncodeAddress(account) +
          abiEncodeUint256(deadline) +
          // path array: length + elements
          abiEncodeUint256(path.length) +
          path.map(abiEncodeAddress).join('');

        // Build proper offset (3rd parameter is array, offset = 3 * 32 = 96 = 0x60)
        const swapParamFixed =
          abiEncodeUint256(amountUnits) +
          abiEncodeUint256(minOut) +
          abiEncodeUint256(160) + // offset = 5 * 32 bytes (5 static params before array)
          abiEncodeAddress(account) +
          abiEncodeUint256(deadline) +
          abiEncodeUint256(path.length) +
          path.map(abiEncodeAddress).join('');

        void swapParam; // discard first attempt, use fixed version

        const swapTx = await buildTriggerSmartContract({
          ownerAddress: account,
          contractAddress: CONTRACTS.ROUTER,
          functionSelector: 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
          parameter: swapParamFixed,
          feeLimit: FEE_LIMIT_SUN,
        });
        const hash = await wcSignAndBroadcast(swapTx);

        setTxid(hash);
        setStep('success');
        setUsbtAmount('');
        setUsdtOut(null);
        fetchBalances();
        addToast({ type: 'success', title: 'Sale complete', message: 'USDT added to your wallet.', txid: hash, duration: 8000 });
        return;
      }

      // ── TronLink path ──────────────────────────────────────────────────
      if (!window.tronWeb) throw new Error('TronLink not detected. Please connect TronLink.');

      // Step 1 — Check USBT allowance for router
      const usbtContract = await window.tronWeb.contract(
        STABLE_ABI as unknown as object[],
        CONTRACTS.STABLE
      );

      const currentAllowance = (await usbtContract
        .allowance(account, CONTRACTS.ROUTER)
        .call()) as bigint;

      if (currentAllowance < amountUnits) {
        setStep('approving');
        await usbtContract.approve(CONTRACTS.ROUTER, maxUint256).send({
          from: account,
          feeLimit: FEE_LIMIT_SUN,
        });
        addToast({
          type: 'info',
          title: 'USBT approved',
          message: 'You can now confirm the sale.',
        });
      }

      setStep('swapping');

      // Step 2 — Swap via SunSwap router
      const router = await window.tronWeb.contract(
        ROUTER_ABI as unknown as object[],
        CONTRACTS.ROUTER
      );

      // Use pre-computed values (minOut, deadline, path, amountUnits defined above)
      const result = await router
        .swapExactTokensForTokens(amountUnits, minOut, path, account, deadline)
        .send({ from: account, feeLimit: FEE_LIMIT_SUN });

      const hash: string =
        result?.txid ?? result?.transaction?.txID ?? '';

      setTxid(hash);
      setStep('success');
      setUsbtAmount('');
      setUsdtOut(null);
      fetchBalances();

      addToast({
        type: 'success',
        title: 'Sale complete',
        message: `USDT has been sent to your wallet.`,
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

  const isLoading = step === 'approving' || step === 'swapping';
  const parsedUsbt = parseFloat(usbtAmount) || 0;
  const insufficient = usbtBalance !== null && parsedUsbt > usbtBalance;
  const highImpact = priceImpact !== null && priceImpact > 2;
  const canSubmit =
    isConnected &&
    parsedUsbt > 0 &&
    !insufficient &&
    usdtOut !== null &&
    step !== 'success';

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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-[#4a4a6a] mb-1">
                Redeem
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Sell USBT</h2>
            </div>
            <div className="flex items-center gap-3">
              {price !== null && (
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 dark:text-[#4a4a6a] uppercase tracking-wide mb-0.5">
                    Pool rate
                  </p>
                  <p className="num text-sm font-bold text-cyan-600 dark:text-cyan-400">
                    ${price.toFixed(4)}
                  </p>
                </div>
              )}
              <a
                href={SUNSWAP_PAIR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.18] dark:border-white/[0.07] text-slate-400 dark:text-[#6b6b88] hover:text-slate-900 dark:hover:text-white transition-colors"
                title="View pool on SunSwap"
              >
                <ArrowSquareOut size={13} />
              </a>
            </div>
          </div>

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
                {/* You sell — USBT */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-[#6b6b88]">You sell</label>
                    {usbtBalance !== null && (
                      <button
                        onClick={handleMaxUsbt}
                        className="text-[10px] text-cyan-600/70 dark:text-cyan-400/70 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        Balance: {usbtBalance.toFixed(2)} USBT · Max
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={usbtAmount}
                      onChange={(e) => setUsbtAmount(e.target.value)}
                      disabled={isLoading}
                      className={`
                        swap-input px-4 py-4 pr-20 text-xl font-bold
                        placeholder-slate-300 dark:placeholder-[#3f3f52] rounded-2xl
                        ${insufficient ? 'border-red-500/40 bg-red-500/5' : ''}
                      `}
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <span className="text-[7px] font-black text-cyan-400">U</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 dark:text-[#8b8ba8]">USBT</span>
                    </div>
                  </div>
                  {insufficient && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <Warning size={11} />
                      Insufficient USBT balance
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-3">
                  <div className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.20] dark:border-white/[0.08] flex items-center justify-center">
                    <ArrowDown size={14} className="text-slate-400 dark:text-[#6b6b88]" />
                  </div>
                </div>

                {/* You receive — USDT */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-[#6b6b88]">You receive</label>
                    {usdtBalance !== null && (
                      <span className="text-[10px] text-slate-400 dark:text-[#4a4a6a]">
                        Balance: {usdtBalance.toFixed(2)} USDT
                      </span>
                    )}
                  </div>
                  <div
                    className="swap-input px-4 py-4 pr-20 rounded-2xl flex items-center justify-between"
                    style={{ minHeight: 62 }}
                  >
                    <span
                      className={`text-xl font-bold transition-colors ${
                        usdtOut !== null ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-[#3f3f52]'
                      }`}
                      style={{ fontFamily: 'Geist Mono, monospace' }}
                    >
                      {quoteLoading ? (
                        <span className="skeleton inline-block w-20 h-6" />
                      ) : usdtOut !== null ? (
                        usdtOut.toFixed(4)
                      ) : (
                        '0.00'
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                        <span className="text-[8px] font-black text-green-400">T</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 dark:text-[#8b8ba8]">USDT</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                {parsedUsbt > 0 && usdtOut !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.16] dark:border-white/[0.06] space-y-2"
                  >
                    <DetailRow
                      label="Route"
                      value="USBT → USDT (SunSwap v2)"
                    />
                    <DetailRow
                      label="Min received"
                      value={`${(usdtOut * (1 - slippageBps / 10000)).toFixed(4)} USDT`}
                    />
                    <DetailRow
                      label="Slippage tolerance"
                      value={`${slippageBps / 100}%`}
                    />
                    {priceImpact !== null && (
                      <DetailRow
                        label="Price impact"
                        value={`~${priceImpact.toFixed(2)}%`}
                        warn={highImpact}
                      />
                    )}
                    <DetailRow label="Network fee" value="~1–5 TRX" />
                  </motion.div>
                )}

                {/* High impact warning */}
                {highImpact && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 p-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 flex items-start gap-2.5"
                  >
                    <Warning size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300 leading-relaxed">
                      High price impact ({priceImpact!.toFixed(1)}%). Consider splitting the trade
                      into smaller amounts.
                    </p>
                  </motion.div>
                )}

                {/* Approval/swap status */}
                {(step === 'approving' || step === 'swapping') && (
                  <div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/20">
                    <span className="w-4 h-4 rounded-full border-[1.5px] border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                    <span className="text-sm text-cyan-600 dark:text-cyan-300">
                      {step === 'approving'
                        ? 'Approving USBT… confirm in wallet'
                        : 'Swapping via SunSwap… confirm in wallet'}
                    </span>
                  </div>
                )}

                {/* Info note */}
                <div className="mb-5 flex items-start gap-2 text-[11px] text-slate-400 dark:text-[#4a4a6a]">
                  <Info size={12} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Sale is routed through the SunSwap v2 pool. Output depends on current
                    pool reserves. Review the{' '}
                    <a
                      href={SUNSWAP_PAIR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-500/60 hover:text-cyan-400 underline underline-offset-2 transition-colors"
                    >
                      pair on SunSwap
                    </a>{' '}
                    before transacting.
                  </span>
                </div>

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
                    onClick={handleSell}
                  >
                    {step === 'approving'
                      ? 'Approving USBT…'
                      : step === 'swapping'
                      ? 'Swapping…'
                      : `Sell USBT${parsedUsbt > 0 ? ` · ${parsedUsbt} USBT` : ''}`}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-[#3f3f52] text-center mt-4 leading-relaxed px-2">
        Sale routes through SunSwap v2. Output determined by on-chain pool reserves.
        Transactions are irreversible.
      </p>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500 dark:text-[#6b6b88]">{label}</span>
      <span className={`text-xs font-medium ${warn ? 'text-amber-400' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </span>
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
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sale complete</h3>
      <p className="text-sm text-slate-500 dark:text-[#8b8ba8] mb-5">
        USDT has been sent to your wallet.
      </p>
      {txid && (
        <a
          href={TRONSCAN_TX_URL(txid)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
        >
          {txid.slice(0, 10)}…{txid.slice(-8)}
          <ArrowSquareOut size={12} />
        </a>
      )}
      <Button variant="secondary" onClick={onReset}>
        Make another sale
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
        <p className="text-sm text-red-400 mb-5 max-w-[280px] leading-relaxed">{message}</p>
      )}
      <Button variant="secondary" onClick={onReset}>
        Try again
      </Button>
    </motion.div>
  );
}
