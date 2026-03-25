import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={clsx(
        // Base
        'relative inline-flex items-center justify-center gap-2.5 rounded-full font-semibold',
        'select-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40',
        'active:scale-[0.96] group overflow-hidden',
        // Variants
        variant === 'primary' && [
          'bg-cyan-500 text-white',
          'shadow-[0_0_20px_rgba(6,182,212,0.25),inset_0_1px_0_rgba(255,255,255,0.18)]',
          'hover:bg-cyan-400',
          'hover:shadow-[0_0_28px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]',
        ],
        variant === 'secondary' && [
          'bg-black/[0.05] dark:bg-white/[0.05]',
          'text-slate-700 dark:text-white',
          'border border-black/[0.09] dark:border-white/[0.09]',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
          'hover:bg-black/[0.09] dark:hover:bg-white/[0.09]',
          'hover:border-black/[0.16] dark:hover:border-white/[0.16]',
        ],
        variant === 'ghost' && [
          'text-slate-500 dark:text-[#8b8ba8] hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05]',
        ],
        variant === 'danger' && [
          'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20',
          'hover:bg-red-500/18 hover:border-red-500/30',
        ],
        // Sizes
        size === 'sm' && 'px-4 py-2 text-xs',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-7 py-3.5 text-[15px]',
        // State
        fullWidth && 'w-full',
        isDisabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 rounded-full border-[1.5px] border-current border-t-transparent animate-spin flex-shrink-0" />
          <span>Processing…</span>
        </>
      ) : (
        <>
          {leadingIcon && (
            <span className="flex-shrink-0">{leadingIcon}</span>
          )}
          <span className="relative z-10">{children}</span>
          {trailingIcon && (
            <span
              className={clsx(
                'relative z-10 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                'transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
                variant === 'primary'
                  ? 'bg-black/12'
                  : 'bg-black/[0.06] dark:bg-white/[0.08]'
              )}
            >
              {trailingIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
