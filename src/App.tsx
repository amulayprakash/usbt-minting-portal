import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Component,
  type ReactNode,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import type { SessionTypes } from '@walletconnect/types';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AnimatedBackground from './components/layout/AnimatedBackground';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import Dashboard from './pages/Dashboard';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './hooks/useAuth';
import { WalletContext, type WalletContextValue, type ConnectionType } from './hooks/useWallet';
import { ThemeProvider } from './hooks/useTheme';
import { broadcastTransaction } from './lib/tronGrid';
import { wcConnect, wcSignTx, wcDisconnect, tronAddressFromSession } from './lib/wcSignClient';

// ─── Error Boundary ───────────────────────────────────────────────────────────

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-base font-semibold text-white">Something went wrong.</p>
          <p className="text-sm text-slate-500">Please refresh the page to try again.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: 'rgba(6,182,212,0.18)', border: '1px solid rgba(6,182,212,0.35)' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Wallet Provider ──────────────────────────────────────────────────────────

function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wcConnecting, setWcConnecting] = useState(false);
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tronWebReady, setTronWebReady] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>('none');
  const wcSessionRef = useRef<SessionTypes.Struct | null>(null);

  // ── TronLink detection ──────────────────────────────────────────────────

  useEffect(() => {
    const init = () => {
      if (window.tronWeb?.defaultAddress?.base58) {
        setAccount(window.tronWeb.defaultAddress.base58);
        setIsConnected(true);
        setTronWebReady(true);
        setConnectionType('tronlink');
      } else if (window.tronWeb) {
        setTronWebReady(true);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(init, 200);
    } else {
      window.addEventListener('load', () => setTimeout(init, 200));
    }

    const onAccountChange = () => {
      if (window.tronWeb?.defaultAddress?.base58) {
        setAccount(window.tronWeb.defaultAddress.base58);
        setIsConnected(true);
        setConnectionType('tronlink');
      } else if (connectionType === 'tronlink') {
        setAccount(null);
        setIsConnected(false);
        setConnectionType('none');
      }
    };

    if (window.tronLink && typeof window.tronLink.on === 'function') {
      window.tronLink.on('accountsChanged', onAccountChange);
    }
    return () => {
      if (window.tronLink && typeof window.tronLink.off === 'function') {
        window.tronLink.off('accountsChanged', onAccountChange);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── TronLink connect ────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.tronLink && !window.tronWeb) {
        window.open('https://www.tronlink.org/', '_blank', 'noopener,noreferrer');
        throw new Error('TronLink not detected. Install TronLink and reload the page.');
      }
      if (window.tronLink) {
        const accounts = await window.tronLink.request({ method: 'tron_requestAccounts' });
        if (accounts?.[0]) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setTronWebReady(true);
          setConnectionType('tronlink');
          setIsConnecting(false);
          return;
        }
      }
      if (window.tronWeb?.defaultAddress?.base58) {
        setAccount(window.tronWeb.defaultAddress.base58);
        setIsConnected(true);
        setTronWebReady(true);
        setConnectionType('tronlink');
        setIsConnecting(false);
        return;
      }
      throw new Error('Could not connect. Unlock TronLink and try again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
      setIsConnecting(false);
      throw err;
    }
  }, []);

  // ── Direct extension connect (non-TronLink installed wallets) ──────────

  const connectExtension = useCallback(async (walletName: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      let address: string | null = null;

      // ── Tron-compatible wallets ─────────────────────────────────────
      if (walletName === 'OKX Wallet') {
        const provider = (window as any).okxwallet?.tronLink;
        if (!provider) throw new Error('OKX Wallet extension not found.');
        const res = await provider.request({ method: 'tron_requestAccounts' });
        address = (Array.isArray(res) ? res[0] : null) ?? provider.defaultAddress?.base58 ?? null;
        if (address) {
          setAccount(address);
          setIsConnected(true);
          setTronWebReady(true);
          setConnectionType('tronlink');
          setIsConnecting(false);
          return;
        }
      }

      if (walletName === 'Bitget Wallet') {
        const provider = (window as any).bitkeep?.tronLink;
        if (!provider) throw new Error('Bitget Wallet extension not found.');
        const res = await provider.request({ method: 'tron_requestAccounts' });
        address = (Array.isArray(res) ? res[0] : null) ?? provider.defaultAddress?.base58 ?? null;
        if (address) {
          setAccount(address);
          setIsConnected(true);
          setTronWebReady(true);
          setConnectionType('tronlink');
          setIsConnecting(false);
          return;
        }
      }

      // ── EVM wallets (MetaMask, Coinbase, Trust, etc.) ───────────────
      const eth = (window as any).ethereum;
      if (!eth) throw new Error(`${walletName} extension not found.`);
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      address = accounts?.[0] ?? null;
      if (!address) throw new Error(`${walletName} did not return an account.`);
      setAccount(address);
      setIsConnected(true);
      setConnectionType('evm');
      setIsConnecting(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed.';
      setError(msg);
      setIsConnecting(false);
      throw err;
    }
  }, []);

  // ── WalletConnect connect ───────────────────────────────────────────────
  // Creates a WC session proposal via SignClient, surfaces the pairing URI
  // (for QR display and wallet deep-links) immediately, then awaits approval.

  const connectWC = useCallback(async (chainType: 'tron' | 'evm' = 'tron') => {
    setWcConnecting(true);
    setWcUri(null);
    setError(null);
    try {
      const { uri, approval } = await wcConnect(chainType);

      // Expose URI right away — WalletModal reads this to render QR + deep-links
      setWcUri(uri);

      // Await wallet approval in background
      const session = await approval();
      wcSessionRef.current = session;

      // Prefer TRON address; fall back to EVM address
      const tronAddr = tronAddressFromSession(session);
      const evmAccounts = session.namespaces?.eip155?.accounts ?? [];
      const evmAddr = evmAccounts.length > 0 ? (evmAccounts[0].split(':')[2] ?? null) : null;

      const address = tronAddr ?? evmAddr;
      if (!address) throw new Error('Wallet did not return a supported address.');

      setAccount(address);
      setIsConnected(true);
      // 'evm' = only EVM namespace returned (no TRON); 'walletconnect' = TRON via WC
      setConnectionType(tronAddr ? 'walletconnect' : 'evm');
      setWcUri(null);
      setWcConnecting(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'WalletConnect failed.';
      if (!msg.toLowerCase().includes('closed') && !msg.toLowerCase().includes('rejected')) {
        setError(msg);
      }
      setWcUri(null);
      setWcConnecting(false);
      throw err;
    }
  }, []);

  // ── Disconnect ──────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    if (connectionType === 'walletconnect' && wcSessionRef.current) {
      await wcDisconnect(wcSessionRef.current.topic);
      wcSessionRef.current = null;
    }
    setAccount(null);
    setIsConnected(false);
    setConnectionType('none');
    setWcUri(null);
    setError(null);
  }, [connectionType]);

  // ── WC sign + broadcast ─────────────────────────────────────────────────

  const wcSignAndBroadcast = useCallback(async (unsignedTx: object): Promise<string> => {
    const session = wcSessionRef.current;
    if (!session || connectionType !== 'walletconnect') {
      throw new Error('Not connected via WalletConnect.');
    }
    const signedTx = await wcSignTx(session, unsignedTx);
    return broadcastTransaction(signedTx);
  }, [connectionType]);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const getTronWeb = useCallback(() => window.tronWeb, []);

  const shortenAddress = useCallback((addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }, []);

  const value: WalletContextValue = {
    account,
    isConnected,
    isConnecting,
    error,
    tronWebReady,
    connectionType,
    wcConnecting,
    wcUri,
    _wcSession: wcSessionRef.current,
    connect,
    connectWC,
    connectExtension,
    disconnect,
    getTronWeb,
    shortenAddress,
    wcSignAndBroadcast,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

// ─── Scroll to top on route change ───────────────────────────────────────────

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ─── Animated routes ──────────────────────────────────────────────────────────

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <WalletProvider>
            <ToastProvider>
              <BrowserRouter>
                <ScrollToTop />
                <AnimatedBackground />
                <div className="noise-overlay" aria-hidden />
                <Navbar />
                <AnimatedRoutes />
                <Footer />
              </BrowserRouter>
            </ToastProvider>
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
