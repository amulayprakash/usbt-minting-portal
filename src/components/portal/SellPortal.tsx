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
  ShieldCheck,
  ShieldWarning,
  Gear,
  CaretDown,
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
  DEFAULT_DEADLINE_MINUTES,
  FEE_LIMIT_SUN,
  TRONSCAN_TX_URL,
  SUNSWAP_PAIR_URL,
} from '../../constants/contracts';
import {
  buildTriggerSmartContract,
  broadcastTransaction,
  callContractConstant,
  abiEncodeUint256,
  abiEncodeAddress,
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
  const [slippageBps] = useState(DEFAULT_SLIPPAGE_BPS);
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

        const swapParam =
          abiEncodeUint256(amountUnits) +
          abiEncodeUint256(minOut) +
          abiEncodeUint256(5 * 32) +
          abiEncodeAddress(account) +
          abiEncodeUint256(deadline) +
          abiEncodeUint256(path.length) +
          path.map(abiEncodeAddress).join('');

        const swapParamFixed =
          abiEncodeUint256(amountUnits) +
          abiEncodeUint256(minOut) +
          abiEncodeUint256(160) +
          abiEncodeAddress(account) +
          abiEncodeUint256(deadline) +
          abiEncodeUint256(path.length) +
          path.map(abiEncodeAddress).join('');

        void swapParam;

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

      if (!window.tronWeb) throw new Error('TronLink not detected. Please connect TronLink.');

      // Check allowance via TronGrid REST to avoid TronLink proxy issues
      const allowanceHex = await callContractConstant({
        ownerAddress: account,
        contractAddress: CONTRACTS.STABLE,
        functionSelector: 'allowance(address,address)',
        parameter: abiEncodeAddress(account) + abiEncodeAddress(CONTRACTS.ROUTER),
      });
      const currentAllowance = allowanceHex ? BigInt('0x' + allowanceHex) : 0n;

      if (currentAllowance < amountUnits) {
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
        const signedApproveTx = await window.tronWeb.trx.sign(approveTx);
        await broadcastTransaction(signedApproveTx);

        addToast({
          type: 'info',
          title: 'USBT approved',
          message: 'You can now confirm the sale.',
        });
      }

      setStep('swapping');

      const swapParam =
        abiEncodeUint256(amountUnits) +
        abiEncodeUint256(minOut) +
        abiEncodeUint256(160) +
        abiEncodeAddress(account) +
        abiEncodeUint256(deadline) +
        abiEncodeUint256(path.length) +
        path.map(abiEncodeAddress).join('');

      const swapTx = await buildTriggerSmartContract({
        ownerAddress: account,
        contractAddress: CONTRACTS.ROUTER,
        functionSelector: 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
        parameter: swapParam,
        feeLimit: FEE_LIMIT_SUN,
      });
      const signedSwapTx = await window.tronWeb.trx.sign(swapTx);
      const hash: string = (signedSwapTx as { txID?: string }).txID ?? '';
      await broadcastTransaction(signedSwapTx);

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
      {/* Card */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white tracking-tight">Sell</h2>
          <div className="flex items-center gap-3">
            {price !== null && (
              <span className="text-xs font-mono text-cyan-400">
                Pool ${price.toFixed(4)}
              </span>
            )}
            <a
              href={SUNSWAP_PAIR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-slate-400 hover:text-slate-200"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
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
              {/* From — USBT */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: insufficient ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-400">From</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}
                    >
                      <ShieldCheck size={11} weight="fill" className="text-cyan-400" />
                      <span className="text-[11px] font-semibold text-cyan-400">Trustified</span>
                    </div>
                    <a
                      href={`https://tronscan.org/#/contract/${CONTRACTS.STABLE}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <ArrowSquareOut size={13} />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Token pill */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <img src="/usbt-logo.png" alt="USBT" width="20" height="20" className="rounded-full" />
                    <span className="text-sm font-bold text-white">USBT</span>
                  </div>
                  {/* Amount input */}
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter an Amount"
                    value={usbtAmount}
                    onChange={(e) => setUsbtAmount(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 min-w-0 bg-transparent text-right text-xl font-bold text-white placeholder-slate-600 outline-none border-none"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">
                    Balance&nbsp;&nbsp;{usbtBalance !== null ? usbtBalance.toFixed(2) : '--'}
                  </span>
                  <div className="flex items-center gap-2">
                    {insufficient && (
                      <span className="text-[10px] text-red-400 flex items-center gap-1">
                        <Warning size={10} />Insufficient
                      </span>
                    )}
                    {usbtBalance !== null && (
                      <button
                        onClick={handleMaxUsbt}
                        className="text-[10px] font-semibold text-cyan-500 hover:text-cyan-400 transition-colors px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(6,182,212,0.1)' }}
                      >
                        MAX
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center relative z-10 py-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '2px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <ArrowDown size={14} weight="bold" className="text-white" />
                </div>
              </div>

              {/* To — USDT */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-400">To</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}
                    >
                      <ShieldCheck size={11} weight="fill" className="text-cyan-400" />
                      <span className="text-[11px] font-semibold text-cyan-400">OK</span>
                    </div>
                    <a
                      href={`https://tronscan.org/#/contract/${CONTRACTS.COLLATERAL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <ArrowSquareOut size={13} />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Token pill */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <img src="/usdt-logo.png" className="w-5 h-5 rounded-full" alt="USDT" />
                    <span className="text-sm font-bold text-white">USDT</span>
                  </div>
                  {/* Amount output */}
                  <div className="flex-1 text-right" style={{ fontFamily: 'Geist Mono, monospace' }}>
                    {quoteLoading ? (
                      <span className="skeleton inline-block w-24 h-7 rounded" />
                    ) : (
                      <span
                        className={`text-xl font-bold ${
                          usdtOut !== null ? 'text-white' : 'text-slate-600'
                        }`}
                      >
                        {usdtOut !== null ? usdtOut.toFixed(4) : '0'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">
                    Balance&nbsp;&nbsp;{usdtBalance !== null ? usdtBalance.toFixed(2) : '--'}
                  </span>
                  <span className="text-xs text-slate-600">--</span>
                </div>
              </div>

              {/* Details */}
              {parsedUsbt > 0 && usdtOut !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 px-1 space-y-1.5"
                >
                  <DetailRow label="Route" value="USBT → USDT (SunSwap v2)" />
                  <DetailRow
                    label="Min received"
                    value={`${(usdtOut * (1 - slippageBps / 10000)).toFixed(4)} USDT`}
                  />
                  <DetailRow label="Slippage tolerance" value={`${slippageBps / 100}%`} />
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
                    High price impact ({priceImpact!.toFixed(1)}%). Consider splitting the trade into smaller amounts.
                  </p>
                </motion.div>
              )}

              {/* Status */}
              {(step === 'approving' || step === 'swapping') && (
                <div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/20">
                  <span className="w-4 h-4 rounded-full border-[1.5px] border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                  <span className="text-sm text-cyan-300">
                    {step === 'approving'
                      ? 'Approving USBT… confirm in wallet'
                      : 'Swapping via SunSwap… confirm in wallet'}
                  </span>
                </div>
              )}

              {/* Info note */}
              <div className="mb-5 flex items-start gap-2 text-[11px] text-slate-500">
                <Info size={12} className="flex-shrink-0 mt-0.5" />
                <span>
                  Sale routes through SunSwap v2. Output depends on pool reserves.{' '}
                  <a
                    href={SUNSWAP_PAIR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-500/60 hover:text-cyan-400 underline underline-offset-2 transition-colors"
                  >
                    View pair
                  </a>
                  .
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

      <p className="text-xs text-slate-600 text-center mt-4 leading-relaxed px-2">
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
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-medium ${warn ? 'text-amber-400' : 'text-slate-300'}`}>
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
      <h3 className="text-xl font-bold text-white mb-2">Sale complete</h3>
      <p className="text-sm text-slate-400 mb-5">
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
      <h3 className="text-xl font-bold text-white mb-2">Transaction failed</h3>
      {message && (
        <p className="text-sm text-red-400 mb-5 max-w-[280px] leading-relaxed">{message}</p>
      )}
      <Button variant="secondary" onClick={onReset}>
        Try again
      </Button>
    </motion.div>
  );
}
