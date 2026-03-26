'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
  ArrowSquareOut,
  CheckCircle,
  Warning,
  X,
  Gift,
  ShieldCheck,
  ShieldWarning,
  Gear,
  CaretDown,
} from '@phosphor-icons/react';
import Button from '../ui/Button';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../../hooks/useToast';
import {
  CONTRACTS,
  DECIMALS_FACTOR,
  FEE_LIMIT_SUN,
  TRONSCAN_TX_URL,
} from '../../constants/contracts';
import {
  buildTriggerSmartContract,
  broadcastTransaction,
  callContractConstant,
  abiEncodeUint256,
  abiEncodeAddress,
  tronB58ToHex,
} from '../../lib/tronGrid';

type TxStep = 'idle' | 'approving' | 'approved' | 'buying' | 'success' | 'error';


export default function BuyPortal({ prefillAmount }: { prefillAmount?: number | null }) {
  const { account, isConnected, connect, isConnecting, connectionType, wcSignAndBroadcast } = useWallet();
  const { addToast } = useToast();

  const [usdtAmount, setUsdtAmount] = useState('');
  const [usbtOut, setUsbtOut] = useState<number | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);
  const [usbtBalance, setUsbtBalance] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [step, setStep] = useState<TxStep>('idle');
  const [txid, setTxid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    if (!isConnected || !account) return;
    fetchBalances();
  }, [isConnected, account]);

  const fetchExchangeRate = useCallback(async () => {
    try {
      const hex = await callContractConstant({
        ownerAddress: CONTRACTS.STABLE,
        contractAddress: CONTRACTS.STABLE,
        functionSelector: 'exchangeRate()',
      });
      if (!hex) return;
      const rate = Number(BigInt('0x' + hex));
      if (!isNaN(rate) && rate > 0) setExchangeRate(rate);
    } catch {
      // Silently fail
    }
  }, []);

  const fetchBalances = useCallback(async () => {
    if (!account) return;
    try {
      const balanceParam = abiEncodeAddress(account);
      const [usdtHex, usbtHex] = await Promise.all([
        callContractConstant({
          ownerAddress: account,
          contractAddress: CONTRACTS.COLLATERAL,
          functionSelector: 'balanceOf(address)',
          parameter: balanceParam,
        }),
        callContractConstant({
          ownerAddress: account,
          contractAddress: CONTRACTS.STABLE,
          functionSelector: 'balanceOf(address)',
          parameter: balanceParam,
        }),
      ]);
      if (usdtHex) setUsdtBalance(Number(BigInt('0x' + usdtHex)) / DECIMALS_FACTOR);
      if (usbtHex) setUsbtBalance(Number(BigInt('0x' + usbtHex)) / DECIMALS_FACTOR);
      fetchExchangeRate();
    } catch {
      // Silently fail
    }
  }, [account, fetchExchangeRate]);

  useEffect(() => {
    const parsed = Number(usdtAmount);
    if (!usdtAmount || parsed <= 0) {
      setUsbtOut(null);
      return;
    }
    if (exchangeRate !== null) {
      setUsbtOut((parsed * exchangeRate) / 100_000);
      return;
    }
    setQuoteLoading(true);
    const t = setTimeout(async () => {
      try {
        const hex = await callContractConstant({
          ownerAddress: CONTRACTS.STABLE,
          contractAddress: CONTRACTS.STABLE,
          functionSelector: 'exchangeRate()',
        });
        if (hex) {
          const rate = Number(BigInt('0x' + hex));
          if (!isNaN(rate) && rate > 0) {
            setExchangeRate(rate);
            setUsbtOut((parsed * rate) / 100_000);
          }
        }
      } catch { /* ignore */ }
      setQuoteLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [usdtAmount, exchangeRate]);

  useEffect(() => {
    if (prefillAmount != null && prefillAmount > 0) {
      setUsdtAmount(String(prefillAmount));
    }
  }, [prefillAmount]);

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
      if (connectionType === 'walletconnect') {
        const wcApprovalKey = `usbt_approved_${account}_${CONTRACTS.STABLE}`;
        let wcNeedsApproval = localStorage.getItem(wcApprovalKey) !== 'true';

        if (wcNeedsApproval) {
          try {
            const wcAllowanceHex = await callContractConstant({
              ownerAddress: account,
              contractAddress: CONTRACTS.COLLATERAL,
              functionSelector: 'allowance(address,address)',
              parameter: abiEncodeAddress(account) + abiEncodeAddress(CONTRACTS.STABLE),
            });
            if (wcAllowanceHex) {
              const wcAllowance = BigInt('0x' + wcAllowanceHex);
              if (wcAllowance >= amountUnits) {
                wcNeedsApproval = false;
                localStorage.setItem(wcApprovalKey, 'true');
              }
            }
          } catch { /* ignore */ }
        }

        if (wcNeedsApproval) {
          setStep('approving');
          const approveParam = abiEncodeAddress(CONTRACTS.STABLE) + abiEncodeUint256(maxUint256);
          const approveTx = await buildTriggerSmartContract({
            ownerAddress: account,
            contractAddress: CONTRACTS.COLLATERAL,
            functionSelector: 'approve(address,uint256)',
            parameter: approveParam,
            feeLimit: FEE_LIMIT_SUN,
          });
          await wcSignAndBroadcast(approveTx);
          localStorage.setItem(wcApprovalKey, 'true');
          addToast({ type: 'info', title: 'USDT approved', message: 'Confirm purchase in wallet.' });
        }

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

      if (!window.tronWeb) throw new Error('TronLink not detected. Please connect TronLink.');
      const tronWeb: any = window.tronWeb;

      const approvalKey = `usbt_approved_${account}_${CONTRACTS.STABLE}`;
      let needsApproval = localStorage.getItem(approvalKey) !== 'true';

      if (needsApproval) {
        try {
          const allowanceHex = await callContractConstant({
            ownerAddress: account,
            contractAddress: CONTRACTS.COLLATERAL,
            functionSelector: 'allowance(address,address)',
            parameter: abiEncodeAddress(account) + abiEncodeAddress(CONTRACTS.STABLE),
          });
          if (allowanceHex) {
            const currentAllowance = BigInt('0x' + allowanceHex);
            if (currentAllowance >= amountUnits) {
              needsApproval = false;
              localStorage.setItem(approvalKey, 'true');
            }
          }
        } catch { /* ignore */ }
      }

      if (needsApproval) {
        setStep('approving');

        const approveParam = abiEncodeAddress(CONTRACTS.STABLE) + abiEncodeUint256(maxUint256);
        const approveTxObj = await buildTriggerSmartContract({
          ownerAddress: account,
          contractAddress: CONTRACTS.COLLATERAL,
          functionSelector: 'approve(address,uint256)',
          parameter: approveParam,
          feeLimit: FEE_LIMIT_SUN,
        });

        const signedApprove = await tronWeb.trx.sign(approveTxObj);
        await broadcastTransaction(signedApprove);

        localStorage.setItem(approvalKey, 'true');
        addToast({ type: 'info', title: 'USDT approved', message: 'Confirm purchase in wallet.' });
      }

      setStep('buying');

      const buyParam = abiEncodeUint256(amountUnits);
      const buyTxObj = await buildTriggerSmartContract({
        ownerAddress: account,
        contractAddress: CONTRACTS.STABLE,
        functionSelector: 'buyTokens(uint256)',
        parameter: buyParam,
        feeLimit: FEE_LIMIT_SUN,
      });

      const signedBuy = await tronWeb.trx.sign(buyTxObj);
      const hash = await broadcastTransaction(signedBuy);

      setTxid(hash);
      setStep('success');
      setUsdtAmount('');
      setUsbtOut(null);
      fetchBalances();

      addToast({
        type: 'success',
        title: 'Purchase complete',
        message: 'USBT has been added to your wallet.',
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

  const activeBonus =
    parsedUsdt >= 100_000 ? 20 :
    parsedUsdt >= 50_000  ? 15 :
    parsedUsdt >= 20_000  ? 10 : 0;
  const bonusUsbt = activeBonus > 0 && usbtOut !== null && !isNaN(usbtOut)
    ? (usbtOut * activeBonus) / 100
    : 0;

  return (
    <div className="w-full max-w-md mx-auto" id="buy-portal-card">
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
          <h2 className="text-base font-bold text-white tracking-tight">Buy</h2>
          <div className="flex items-center gap-3">
            {exchangeRate !== null && (
              <span className="text-xs font-mono text-cyan-400">
                1 USDT = {(exchangeRate / 100_000).toLocaleString()} USBT
              </span>
            )}
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="Settings"
            >
              <Gear size={15} className="text-slate-400" />
            </button>
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
              {/* From — USDT */}
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
                  {/* Amount input */}
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter an Amount"
                    value={usdtAmount}
                    onChange={(e) => setUsdtAmount(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 min-w-0 bg-transparent text-right text-xl font-bold text-white placeholder-slate-600 outline-none border-none"
                    style={{ fontFamily: 'Geist Mono, monospace' }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">
                    Balance&nbsp;&nbsp;{usdtBalance !== null ? usdtBalance.toFixed(2) : '--'}
                  </span>
                  <div className="flex items-center gap-2">
                    {insufficient && (
                      <span className="text-[10px] text-red-400 flex items-center gap-1">
                        <Warning size={10} />Insufficient
                      </span>
                    )}
                    {usdtBalance !== null && (
                      <button
                        onClick={handleMaxUsdt}
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
              <div className="flex justify-center -my-0.5 relative z-10 py-2">
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

              {/* To — USBT */}
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
                    <img src="/usbt-logo.png" className="w-5 h-5 rounded-full" alt="USBT" />
                    <span className="text-sm font-bold text-white">USBT</span>
                  </div>
                  {/* Amount output */}
                  <div className="flex-1 text-right" style={{ fontFamily: 'Geist Mono, monospace' }}>
                    {quoteLoading ? (
                      <span className="skeleton inline-block w-24 h-7 rounded" />
                    ) : (
                      <span
                        className={`text-xl font-bold ${
                          usbtOut !== null && !isNaN(usbtOut) ? 'text-cyan-300' : 'text-slate-600'
                        }`}
                      >
                        {usbtOut !== null && !isNaN(usbtOut) ? usbtOut.toFixed(4) : '0'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">
                    Balance&nbsp;&nbsp;{usbtBalance !== null ? usbtBalance.toFixed(2) : '--'}
                  </span>
                  <span className="text-xs text-slate-600">--</span>
                </div>
              </div>

              {/* Details row */}
              {parsedUsdt > 0 && usbtOut !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 px-1 space-y-1.5"
                >
                  <DetailRow
                    label="Exchange rate"
                    value={exchangeRate !== null ? `1 USDT = ${(exchangeRate / 100_000).toLocaleString()} USBT` : '—'}
                  />
                  <DetailRow label="Network fee" value="~1–5 TRX" />
                  <DetailRow
                    label="Contract"
                    value={`${CONTRACTS.STABLE.slice(0, 8)}…`}
                    link={`https://tronscan.org/#/contract/${CONTRACTS.STABLE}`}
                  />
                </motion.div>
              )}

              {/* Bonus banner */}
              <AnimatePresence>
                {activeBonus > 0 && bonusUsbt > 0 && (
                  <motion.div
                    key="bonus-banner"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className={`mb-4 p-3.5 rounded-xl border flex items-start gap-3 ${
                      activeBonus === 20
                        ? 'bg-amber-500/[0.08] border-amber-500/25'
                        : activeBonus === 15
                        ? 'bg-violet-500/[0.08] border-violet-500/25'
                        : 'bg-cyan-500/[0.08] border-cyan-500/25'
                    }`}
                  >
                    <Gift
                      size={16}
                      weight="fill"
                      className={`mt-0.5 flex-shrink-0 ${
                        activeBonus === 20 ? 'text-amber-400' : activeBonus === 15 ? 'text-violet-400' : 'text-cyan-400'
                      }`}
                    />
                    <div>
                      <p className={`text-xs font-semibold mb-0.5 ${
                        activeBonus === 20 ? 'text-amber-300' : activeBonus === 15 ? 'text-violet-300' : 'text-cyan-300'
                      }`}>
                        {activeBonus}% Bonus Active
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        You will receive an extra{' '}
                        <span className={`font-bold ${
                          activeBonus === 20 ? 'text-amber-400' : activeBonus === 15 ? 'text-violet-400' : 'text-cyan-400'
                        }`}>
                          {bonusUsbt.toLocaleString(undefined, { maximumFractionDigits: 4 })} USBT
                        </span>{' '}
                        after the transaction is completed.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status label */}
              {(step === 'approving' || step === 'buying') && (
                <div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/20">
                  <span className="w-4 h-4 rounded-full border-[1.5px] border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                  <span className="text-sm text-cyan-300">
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

      <p className="text-xs text-slate-600 text-center mt-4 leading-relaxed px-2">
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
      <span className="text-xs text-slate-500">{label}</span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          {value}
          <ArrowSquareOut size={10} />
        </a>
      ) : (
        <span className="text-xs font-medium text-slate-300">{value}</span>
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
      <h3 className="text-xl font-bold text-white mb-2">Purchase complete</h3>
      <p className="text-sm text-slate-400 mb-5">
        USBT has been sent to your wallet. It may take a moment to appear.
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
