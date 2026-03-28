# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Type-check (tsc) then build for production
npm run preview  # Preview the production build locally
```

No test or lint scripts are configured.

## Architecture

### Stack
- **React 18 + TypeScript + Vite** SPA deployed on Netlify
- **Tailwind CSS** with dark/light mode (`.dark` class strategy)
- **Framer Motion** for animations (spring: `{ stiffness: 260, damping: 26 }`)
- **React Router v6** (BrowserRouter) — SPA fallback configured in `netlify.toml`
- **Tron blockchain** via TronLink extension (`window.tronWeb`) and WalletConnect (lazy-loaded ~930 kB chunk)

### Provider Hierarchy (App.tsx)
```
ThemeProvider → WalletProvider → ToastProvider → BrowserRouter → Routes
```
Pages are wrapped with `AnimatePresence` (mode="wait") for page transitions.

### Routes
- `/` — Home (marketing landing page, composed of section components)
- `/buy` — Mint USBT by depositing USDT (approve → mint flow)
- `/sell` — Redeem USBT for USDT

### Blockchain Layer
All on-chain interaction goes through **`src/lib/tronGrid.ts`** — no TronWeb SDK dependency:
- `buildTriggerSmartContract()` — builds unsigned transactions via TronGrid REST
- `broadcastTransaction()` — broadcasts signed txs
- `callContractConstant()` — reads contract state (view calls)
- Manual ABI encoding helpers (`abiEncodeUint256`, `abiEncodeAddress`, etc.)
- Pure-JS base58 helpers to avoid async `window.tronWeb` dependency

Contract addresses and ABIs live in **`src/constants/contracts.ts`**:
- USBT minting contract: `TK9y3cDCtVBQEdjTUWw1iuPZZKTxnuFWrH`
- USDT (collateral, TRC-20): `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
- SunSwap v2 Router: `TNJVzGqKBWkJxJB5XYSqGAwUTV15U24pPq`
- SunSwap USBT/USDT pair: `TEpLryVMYSALJkGJ3n8urG7iWzHDeLyrBS`

### Wallet Context (src/hooks/useWallet.ts)
Exposes: `account`, `isConnected`, `connectionType` (`'none' | 'tronlink' | 'walletconnect'`), `connect()`, `connectWC()`, `disconnect()`, `wcSignAndBroadcast()`

WalletConnect adapter is **dynamically imported** on first use to keep the initial bundle small.

### Path Aliases
`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

## Design System

Defined in `tailwind.config.js` and `src/index.css`:
- **Font**: Geist (sans) and Geist Mono — loaded from Google Fonts in `index.html`
- **Background**: `canvas` = `#07070e` (dark default)
- **Accent**: Cyan (`#06b6d4` / `#0ec9e5`) — no purple gradients
- **Cards**: Double-bezel pattern with inset shadows and glass-morphism (`backdrop-blur`)
- **Custom animations**: `float`, `marquee`, `shimmer`, `pulse-ring`, `fade-in-up`, `counter-in`
- **Custom shadows**: `glass`, `card`, `accent-glow`, `accent-ring`

Dark mode is the default; light mode overrides via CSS variables on `:root`.
