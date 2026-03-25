import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showWordmark = true, className }: LogoProps) {
  const dim = size === 'sm' ? 30 : size === 'md' ? 38 : 52;
  const textClass = size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : 'text-2xl';

  return (
    <Link
      to="/"
      className={clsx('inline-flex items-center gap-2.5 group focus:outline-none', className)}
      aria-label="USBT Portal home"
    >
      <div
        className="relative flex-shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-[15deg]"
        style={{ width: dim, height: dim }}
      >
        <img
          src="/usbt-logo.png"
          alt="USBT"
          width={dim}
          height={dim}
          className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.45)]"
          draggable={false}
        />

        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />
      </div>

      {showWordmark && (
        <span className={clsx(textClass, 'font-bold tracking-tight text-white leading-none')}>
          US<span className="text-cyan-400">BT</span>
        </span>
      )}
    </Link>
  );
}
