'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Warning, X, ArrowSquareOut, SignIn,
} from '@phosphor-icons/react';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { TRONSCAN_TX_URL } from '../../constants/contracts';
import { useAuth } from '../../hooks/useAuth';

const EDGE_URL = import.meta.env.VITE_EDGE_FUNCTION_URL as string;

type WithdrawStep = 'idle' | 'signing' | 'success' | 'error';

/** TRON base58 address: starts with T, 34 chars, base58 charset */
const TRON_ADDR_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const isValidTronAddress = (addr: string) => TRON_ADDR_RE.test(addr);

export default function WithdrawPanel() {
  const { addToast } = useToast();
  const { user, session, usbtBalance, refreshBalance, signInWithGoogle } = useAuth();

  const [usbtAmount, setUsbtAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [txStep, setTxStep] = useState<WithdrawStep>('idle');
  const [txid, setTxid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addressTouched, setAddressTouched] = useState(false);

  const handleMaxUsbt = () => {
    if (usbtBalance > 0) setUsbtAmount(usbtBalance.toFixed(6));
  };

  const handleWithdraw = async () => {
    if (!user || !session) return;
    const parsed = parseFloat(usbtAmount);
    if (!parsed || parsed <= 0 || !isValidTronAddress(recipientAddress)) return;

    setErrorMsg(null);
    setTxid(null);
    setTxStep('signing');

    try {
      const res = await fetch(`${EDGE_URL}execute-withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tron_address: recipientAddress, usbt_amount: parsed }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Withdrawal failed. Please try again.');

      setTxid(json.tx_hash ?? null);
      setTxStep('success');
      setUsbtAmount('');
      setRecipientAddress('');
      setAddressTouched(false);
      await refreshBalance();
      addToast({
        type: 'success',
        title: 'Withdrawal complete',
        message: 'USBT has been sent to the recipient.',
        txid: json.tx_hash,
        duration: 8000,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed. Please try again.';
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
  const insufficient = parsedUsbt > usbtBalance;
  const addressValid = isValidTronAddress(recipientAddress);
  const addressInvalid = addressTouched && recipientAddress.length > 0 && !addressValid;
  const canSubmit =
    !!user &&
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

              {!user ? (
                /* ── Not Signed In ── */
                <div className="space-y-3">
                  <div className="text-center py-6">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <SignIn size={24} className="text-slate-500" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1.5">Sign in to withdraw</p>
                    <p className="text-xs text-slate-500 mb-5">
                      Sign in with Google to access your USBT balance and withdraw.
                    </p>
                    <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={signInWithGoogle}
                      >
                        Sign in with Google
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Signed In: Show Form ── */
                <div className="space-y-4">
                  {/* Account status */}
                  <div
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      style={{ boxShadow: '0 0 4px rgba(52,211,153,0.7)' }}
                    />
                    <span className="text-[11px] text-cyan-400 flex-1 truncate">
                      {user.email}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-cyan-300 flex-shrink-0">
                      {usbtBalance.toFixed(2)} USBT
                    </span>
                  </div>

                  {/* Amount input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-400">Amount (USBT)</label>
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
                        {/* Tether-style SVG icon matching USDT look */}
                        <svg width="20" height="20" viewBox="0 0 2000 2000" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="1000" cy="1000" r="1000" fill="#26A17B"/>
                          <path d="M1122.7 866.8V747H1463.1V534H536.9V747H877.3V866.7C601.5 879.3 393 934.1 393 999.8C393 1065.5 601.5 1120.3 877.3 1133V1466H1122.7V1133C1398.3 1120.4 1607 1065.5 1607 999.8C1607 934.1 1398.3 879.3 1122.7 866.8ZM1122.7 1093.2V1093C1116.4 1093.4 1082.7 1095.4 1001.9 1095.4C937.3 1095.4 892 1093.6 877.3 1093V1093.2C625.8 1082.3 439 1036.7 439 981.9C439 927.1 625.8 881.5 877.3 870.6V1028C892.2 1029.1 938.5 1031.9 1003 1031.9C1080.3 1031.9 1116.6 1028.6 1122.7 1028V870.6C1373.8 881.5 1560.4 927.1 1560.4 981.9C1560.4 1036.7 1373.8 1082.2 1122.7 1093.2Z" fill="white"/>
                        </svg>
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
                        Processing withdrawal…
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
