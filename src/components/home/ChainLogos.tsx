/* ─────────────────────────────────────────────────────────────────────────────
   Chain Logos — monochrome SVG, cyan-tinted, shared between Hero + SupportedChains
───────────────────────────────────────────────────────────────────────────── */

export function EthLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <polygon points="16,2 16,12.8 7.5,16.8"  fill="currentColor" opacity="0.42"/>
      <polygon points="16,2 24.5,16.8 16,12.8" fill="currentColor" opacity="0.72"/>
      <polygon points="16,12.8 7.5,16.8 16,21"  fill="currentColor" opacity="0.58"/>
      <polygon points="16,12.8 24.5,16.8 16,21" fill="currentColor" opacity="0.95"/>
      <polygon points="16,21 7.5,16.8 16,30"    fill="currentColor" opacity="0.52"/>
      <polygon points="16,21 24.5,16.8 16,30"   fill="currentColor" opacity="0.74"/>
    </svg>
  );
}

export function BtcLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path
        d="M22.2 13.9c.55-3.7-2.3-5.2-5.2-5.65L17.6 4.3l-2.2-.55-.7 2.95c-.58-.15-1.18-.28-1.77-.42L13.6 3.3 11.4 2.76l-.72 2.92-1.38-.35-3.04-.76-.58 2.38s1.62.37 1.59.4c.88.22 1.04.82 1.01 1.28L7.4 14.78c-.06.28-.35.58-.85.46-.02 0-1.6-.4-1.6-.4L4 17.3l2.88.72 1.6.4-.76 3.26 2.2.55.76-3.3c.6.16 1.18.3 1.75.44l-.75 3.28 2.2.55.76-3.25c4.55.85 7.97.3 9.4-3.6.76-3.3-.04-5.2-2.48-6.44 1.44-.44 2.58-1.72 2.86-3.56zM17.6 22.3c-.57 2.56-4.64 1.18-5.95.84l1.06-4.26c1.32.32 5.56 1 4.9 3.42zm.62-8.5c-.52 2.28-3.72 1.12-4.76.84l.96-3.88c1.04.26 4.9.74 3.8 3.04z"
        fill="currentColor" opacity="0.9"
      />
    </svg>
  );
}

export function BnbLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path d="M16 4L19.46 7.46 12.54 14.38 9.08 10.92z" fill="currentColor" opacity="0.88"/>
      <path d="M6.92 13.08 10.38 9.62 13.84 13.08 10.38 16.54z" fill="currentColor" opacity="0.88"/>
      <path d="M16 10L22 16 16 22 10 16z" fill="currentColor" opacity="0.6"/>
      <path d="M25.08 13.08 28.54 16.54 25.08 20 21.62 16.54z" fill="currentColor" opacity="0.88"/>
      <path d="M16 21.5 19.46 25 16 28.54 12.54 25z" fill="currentColor" opacity="0.88"/>
    </svg>
  );
}

export function MaticLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path
        d="M20.5 12.1l-4.25-2.45a1.5 1.5 0 00-1.5 0L10.5 12.1a1.5 1.5 0 00-.75 1.3v4.9c0 .54.28 1.02.75 1.3l4.25 2.45c.46.27 1.04.27 1.5 0l4.25-2.45c.47-.28.75-.76.75-1.3v-4.9a1.5 1.5 0 00-.75-1.3zm-2.2 5.7-2.3 1.33-2.3-1.33V14.2l2.3-1.33 2.3 1.33z"
        fill="currentColor" opacity="0.92"
      />
      <path
        d="M16 4L5.07 10.33v11.34L16 28l10.93-6.33V10.33z"
        stroke="currentColor" strokeWidth="1.2" opacity="0.3" fill="none"
      />
    </svg>
  );
}

export function SolLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path d="M7.5 21h14.5l2.5-2.5H10z"   fill="currentColor" opacity="0.72"/>
      <path d="M7.5 16.25h14.5l2.5-2.5H10z" fill="currentColor" opacity="0.9"/>
      <path d="M10 11.5h14.5l-2.5-2.5H7.5z" fill="currentColor" opacity="0.58"/>
    </svg>
  );
}

export function AvaxLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path d="M16 4.5 8.2 27.5h3.2l4.6-8 4.6 8h3.2z" fill="currentColor" opacity="0.88"/>
      <rect x="10.5" y="23" width="11" height="2.2" rx="0.5" fill="currentColor" opacity="0.18"/>
    </svg>
  );
}

export function ArbLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <circle cx="16" cy="16" r="11.5" stroke="currentColor" strokeWidth="1.4" opacity="0.28"/>
      <path
        d="M10.5 21.5 13.5 12l3.2 6.5h-3.5l-1.2 3M18.5 21.5l-2-5.5 2.5-5 4.5 10.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.9"
      />
    </svg>
  );
}

export function OpLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <circle cx="16" cy="16" r="11.5" stroke="currentColor" strokeWidth="1.4" opacity="0.3"/>
      <circle cx="16" cy="16" r="5.8"  stroke="currentColor" strokeWidth="2"   opacity="0.88"/>
      <circle cx="16" cy="16" r="2.2"  fill="currentColor"                     opacity="0.78"/>
    </svg>
  );
}

export function TronLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <polygon points="16,2 29,11 24,28 8,28 3,11" stroke="currentColor" strokeWidth="1.3" fill="none" opacity="0.3"/>
      <rect x="10" y="10" width="12" height="2.2" rx="0.6" fill="currentColor" opacity="0.85"/>
      <rect x="14.9" y="12.2" width="2.2" height="9.5" rx="0.6" fill="currentColor" opacity="0.9"/>
      <circle cx="16" cy="24.5" r="1.2" fill="currentColor" opacity="0.55"/>
    </svg>
  );
}

export function BaseLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <circle cx="16" cy="16" r="11.5" stroke="currentColor" strokeWidth="1.4" opacity="0.28"/>
      <circle cx="16" cy="16" r="7"    stroke="currentColor" strokeWidth="1.8" opacity="0.65"/>
      <circle cx="16" cy="16" r="3"    fill="currentColor"                     opacity="0.88"/>
    </svg>
  );
}
