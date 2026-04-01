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
import { ToastProvider } from './components/ui/Toast';
import { WalletContext, type WalletContextValue, type ConnectionType } from './hooks/useWallet';
import { ThemeProvider } from './hooks/useTheme';
import { broadcastTransaction } from './lib/tronGrid';
import { wcConnect, wcSignTx, wcDisconnect, tronAddressFromSession } from './lib/wcSignClient';

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

  // ── WalletConnect connect ───────────────────────────────────────────────
  // Creates a WC session proposal via SignClient, surfaces the pairing URI
  // (for QR display and wallet deep-links) immediately, then awaits approval.

  const connectWC = useCallback(async () => {
    setWcConnecting(true);
    setWcUri(null);
    setError(null);
    try {
      const { uri, approval } = await wcConnect();

      // Expose URI right away — WalletModal reads this to render QR + deep-links
      setWcUri(uri);

      // Await wallet approval in background
      const session = await approval();
      wcSessionRef.current = session;

      const address = tronAddressFromSession(session);
      if (!address) throw new Error('Wallet did not return a TRON address.');

      setAccount(address);
      setIsConnected(true);
      setConnectionType('walletconnect');
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
      </Routes>
    </AnimatePresence>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
