'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Warning, X, ArrowSquareOut, ShieldCheck, Wallet,
} from '@phosphor-icons/react';
import Button from '../ui/Button';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../../hooks/useToast';
import {
  CONTRACTS, DECIMALS_FACTOR, FEE_LIMIT_SUN, TRONSCAN_TX_URL,
} from '../../constants/contracts';
import {
  buildTriggerSmartContract, broadcastTransaction, callContractConstant,
  abiEncodeUint256, abiEncodeAddress,
} from '../../lib/tronGrid';

type WithdrawStep = 'idle' | 'signing' | 'success' | 'error';

/** TRON base58 address: starts with T, 34 chars, base58 charset */
const TRON_ADDR_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const isValidTronAddress = (addr: string) => TRON_ADDR_RE.test(addr);

export default function WithdrawPanel() {
  const {
    account, isConnected, connect, connectWC, isConnecting,
    connectionType, wcSignAndBroadcast, shortenAddress,
  } = useWallet();
  const { addToast } = useToast();

  const [usbtAmount, setUsbtAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [usbtBalance, setUsbtBalance] = useState<number | null>(null);
  const [txStep, setTxStep] = useState<WithdrawStep>('idle');
  const [txid, setTxid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addressTouched, setAddressTouched] = useState(false);

  useEffect(() => {
    if (!isConnected || !account) return;
    fetchBalance();
  }, [isConnected, account]);

  const fetchBalance = useCallback(async () => {
    if (!account) return;
    try {
      const hex = await callContractConstant({
        ownerAddress: account,
        contractAddress: CONTRACTS.STABLE,
        functionSelector: 'balanceOf(address)',
        parameter: abiEncodeAddress(account),
      });
      if (hex) setUsbtBalance(Number(BigInt('0x' + hex)) / DECIMALS_FACTOR);
    } catch { /* silent */ }
  }, [account]);

  const handleMaxUsbt = () => {
    if (usbtBalance !== null) setUsbtAmount(usbtBalance.toFixed(6));
  };

  const handleWithdraw = async () => {
    if (!account) return;
    const parsed = parseFloat(usbtAmount);
    if (!parsed || parsed <= 0 || !isValidTronAddress(recipientAddress)) return;

    setErrorMsg(null);
    setTxid(null);
    setTxStep('signing');

    const amountUnits = BigInt(Math.floor(parsed * DECIMALS_FACTOR));
    let transferParam: string;
    try {
      transferParam = abiEncodeAddress(recipientAddress) + abiEncodeUint256(amountUnits);
    } catch {
      setErrorMsg('Invalid recipient address. Please check and try again.');
      setTxStep('error');
      return;
    }

    try {
      if (connectionType === 'walletconnect') {
        const txObj = await buildTriggerSmartContract({
          ownerAddress: account,
          contractAddress: CONTRACTS.STABLE,
          functionSelector: 'transfer(address,uint256)',
          parameter: transferParam,
          feeLimit: FEE_LIMIT_SUN,
        });
        const hash = await wcSignAndBroadcast(txObj);
        setTxid(hash);
        setTxStep('success');
        setUsbtAmount('');
        setRecipientAddress('');
        setAddressTouched(false);
        fetchBalance();
        addToast({
          type: 'success',
          title: 'Withdrawal complete',
          message: 'USBT has been sent to the recipient.',
          txid: hash,
          duration: 8000,
        });
        return;
      }

      if (!window.tronWeb) throw new Error('TronLink not detected. Please install TronLink.');
      const tronWeb: any = window.tronWeb;

      const txObj = await buildTriggerSmartContract({
        ownerAddress: account,
        contractAddress: CONTRACTS.STABLE,
        functionSelector: 'transfer(address,uint256)',
        parameter: transferParam,
        feeLimit: FEE_LIMIT_SUN,
      });
      const signedTx = await tronWeb.trx.sign(txObj);
      const hash = await broadcastTransaction(signedTx);

      setTxid(hash);
      setTxStep('success');
      setUsbtAmount('');
      setRecipientAddress('');
      setAddressTouched(false);
      fetchBalance();
      addToast({
        type: 'success',
        title: 'Withdrawal complete',
        message: 'USBT has been sent to the recipient.',
        txid: hash,
        duration: 8000,
      });
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : 'Transaction rejected or failed. Please try again.';
      setErrorMsg(msg);
      setTxStep('error');
      addToast({ type: 'error', title: 'Withdrawal failed', message: msg });
    }
  };

  const reset = () => {
    setTxStep('idle');
    setErrorMsg(null);
    setTxid(null);
  };

  const parsedUsbt = parseFloat(usbtAmount) || 0;
  const insufficient = usbtBalance !== null && parsedUsbt > usbtBalance;
  const addressValid = isValidTronAddress(recipientAddress);
  const addressInvalid = addressTouched && recipientAddress.length > 0 && !addressValid;
  const canSubmit =
    isConnected &&
    parsedUsbt > 0 &&
    !insufficient &&
    addressValid &&
    txStep === 'idle';

  return (
    <div className="w-full" id="withdraw-panel">
      {/* Card */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {txStep === 'success' ? (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SuccessState txid={txid} onReset={reset} />
            </motion.div>
          ) : txStep === 'error' ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorState message={errorMsg} onReset={reset} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {/* Network Badge */}
              <div
                className="flex items-center gap-3 p-3.5 rounded-xl mb-5"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)' }}
                >
                  <span className="text-[8px] font-black text-red-400">TRX</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-300">Network: TRON only</p>
                  <p className="text-[11px] text-slate-500">
                    Withdrawals are available on TRON only. Use a TRON-compatible wallet.
                  </p>
                </div>
              </div>

              {!isConnected ? (
                /* ── Not Connected ── */
                <div className="space-y-3">
                  <div className="text-center py-6">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Wallet size={24} className="text-slate-500" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1.5">Connect your wallet</p>
                    <p className="text-xs text-slate-500 mb-5">
                      Connect a TRON wallet to withdraw USBT.
                    </p>
                    <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isConnecting}
                        onClick={connect}
                      >
                        Connect TronLink
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        loading={isConnecting}
                        onClick={connectWC}
                      >
                        WalletConnect
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Connected: Show Form ── */
                <div className="space-y-4">
                  {/* Wallet status */}
                  <div
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      style={{ boxShadow: '0 0 4px rgba(52,211,153,0.7)' }}
                    />
                    <span className="text-[11px] font-mono text-cyan-400 flex-1">
                      {account ? shortenAddress(account) : ''}
                    </span>
                    <ShieldCheck size={12} weight="fill" className="text-emerald-400" />
                  </div>

                  {/* Amount input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-400">Amount (USBT)</label>
                      {usbtBalance !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            Balance&nbsp;
                            <span className="font-mono text-slate-400">{usbtBalance.toFixed(2)}</span>
                          </span>
                          <button
                            onClick={handleMaxUsbt}
                            className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors px-2 py-0.5 rounded"
                            style={{ background: 'rgba(6,182,212,0.10)' }}
                          >
                            MAX
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: insufficient
                          ? '1px solid rgba(239,68,68,0.30)'
                          : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <img src="/usbt-logo.png" alt="USBT" className="w-5 h-5 rounded-full" />
                        <span className="text-sm font-bold text-white">USBT</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={usbtAmount}
                        onChange={(e) => setUsbtAmount(e.target.value)}
                        disabled={txStep === 'signing'}
                        className="flex-1 bg-transparent text-right text-xl font-bold text-white
                          placeholder-slate-700 outline-none border-none"
                        style={{ fontFamily: 'Geist Mono, monospace' }}
                      />
                    </div>
                    {insufficient && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
                        <Warning size={11} /> Insufficient USBT balance
                      </p>
                    )}
                  </div>

                  {/* Recipient address input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-2 block">
                      Recipient address
                    </label>
                    <div
                      className="rounded-xl px-4 py-3.5"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: addressInvalid
                          ? '1px solid rgba(239,68,68,0.30)'
                          : addressValid && recipientAddress
                          ? '1px solid rgba(52,211,153,0.25)'
                          : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="T... (TRON address)"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        onBlur={() => setAddressTouched(true)}
                        disabled={txStep === 'signing'}
                        className="w-full bg-transparent text-sm font-mono text-white
                          placeholder-slate-700 outline-none border-none"
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                      />
                    </div>
                    {addressInvalid && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
                        <Warning size={11} />
                        Invalid TRON address. Must start with T and be 34 characters.
                      </p>
                    )}
                    {addressValid && recipientAddress && (
                      <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1.5">
                        <CheckCircle size={11} weight="fill" /> Valid TRON address
                      </p>
                    )}
                  </div>

                  {/* Safety warning */}
                  <div
                    className="p-3.5 rounded-xl flex items-start gap-2.5"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
                  >
                    <Warning size={13} weight="fill" className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-amber-400/70">
                      Always verify the recipient address. Sending USBT to the wrong address is
                      irreversible. Only send to TRON-compatible wallets.
                    </p>
                  </div>

                  {/* TX status */}
                  {txStep === 'signing' && (
                    <div
                      className="flex items-center gap-2.5 p-3 rounded-xl"
                      style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.18)' }}
                    >
                      <span className="w-4 h-4 rounded-full border-[1.5px] border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                      <span className="text-sm text-cyan-300">
                        Sending USBT… confirm in wallet
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={txStep === 'signing'}
                    disabled={!canSubmit}
                    onClick={handleWithdraw}
                  >
                    {txStep === 'signing'
                      ? 'Withdrawing…'
                      : parsedUsbt > 0 && addressValid
                      ? `Withdraw ${parsedUsbt.toLocaleString()} USBT`
                      : 'Withdraw USBT'}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-slate-700 text-center mt-4 leading-relaxed px-2">
        Withdrawals are processed on the TRON network.
        Transactions are irreversible — always double-check the address.
      </p>
    </div>
  );
}

// ─── Success / Error States ───────────────────────────────────────────────────

function SuccessState({ txid, onReset }: { txid: string | null; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="flex flex-col items-center text-center py-8"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)' }}
      >
        <CheckCircle size={32} weight="fill" className="text-emerald-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Withdrawal complete</h3>
      <p className="text-sm text-slate-400 mb-5">
        USBT has been sent to the recipient address.
      </p>
      {txid && (
        <a
          href={TRONSCAN_TX_URL(txid)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400
            hover:text-cyan-300 mb-6 transition-colors"
        >
          {txid.slice(0, 10)}…{txid.slice(-8)}
          <ArrowSquareOut size={11} />
        </a>
      )}
      <Button variant="secondary" onClick={onReset}>Make another withdrawal</Button>
    </motion.div>
  );
}

function ErrorState({ message, onReset }: { message: string | null; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="flex flex-col items-center text-center py-8"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)' }}
      >
        <X size={28} className="text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Withdrawal failed</h3>
      {message && (
        <p className="text-sm text-red-400 mb-5 max-w-[280px] leading-relaxed">{message}</p>
      )}
      <Button variant="secondary" onClick={onReset}>Try again</Button>
    </motion.div>
  );
}
