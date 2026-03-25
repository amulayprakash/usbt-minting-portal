'use client';
import {
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Warning,
  Info,
  X,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { ToastContext, type ToastItem, type ToastType } from '../../hooks/useToast';
import { TRONSCAN_TX_URL } from '../../constants/contracts';

// ─── Provider ───────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    const dur = toast.duration ?? 5000;
    if (dur > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, dur);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastStack toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ─── Stack renderer ──────────────────────────────────────────────────────────

function ToastStack({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9990] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-24px)] pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Individual card ─────────────────────────────────────────────────────────

const iconMap: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={18} weight="fill" className="text-emerald-400" />,
  error: <XCircle size={18} weight="fill" className="text-red-400" />,
  warning: <Warning size={18} weight="fill" className="text-amber-400" />,
  info: <Info size={18} weight="fill" className="text-cyan-400" />,
};

const borderMap: Record<ToastType, string> = {
  success: 'border-emerald-500/20',
  error: 'border-red-500/20',
  warning: 'border-amber-500/20',
  info: 'border-cyan-500/20',
};

function ToastCard({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className={`
        pointer-events-auto
        glass-card rounded-2xl border p-4
        ${borderMap[toast.type]}
        shadow-[0_8px_32px_rgba(0,0,0,0.5)]
      `}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-[#8b8ba8] mt-0.5 leading-relaxed">{toast.message}</p>
          )}
          {toast.txid && (
            <a
              href={TRONSCAN_TX_URL(toast.txid)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1.5 transition-colors"
            >
              <span className="font-mono">{toast.txid.slice(0, 8)}…{toast.txid.slice(-6)}</span>
              <ArrowSquareOut size={11} />
            </a>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 rounded-lg text-[#4a4a6a] hover:text-white hover:bg-white/8 transition-colors"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </motion.div>
  );
}
