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
import type { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect';
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

// ─── WalletConnect adapter singleton ─────────────────────────────────────────
// Dynamically imported to keep the 930 kB WalletConnect chunk out of the
// initial bundle — it only loads when the user clicks "WalletConnect".
let _wcAdapterInstance: WalletConnectAdapter | null = null;

async function getWCAdapter(): Promise<WalletConnectAdapter> {
  if (!_wcAdapterInstance) {
    // Dynamic import — Vite will code-split this into the walletconnect chunk
    const { WalletConnectAdapter } = await import(
      /* webpackChunkName: "walletconnect" */
      '@tronweb3/tronwallet-adapter-walletconnect'
    );
    _wcAdapterInstance = new WalletConnectAdapter({
      network: 'Mainnet',
      options: {
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string,
        metadata: {
          name: 'USBT Exchange',
          description: 'Mint and trade USBT on Tron Mainnet',
          url: window.location.origin,
          icons: [`${window.location.origin}/favicon.svg`],
        },
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-z-index': 9990,
        '--w3m-accent': '#06b6d4',
        '--w3m-border-radius-master': '3px',
      },
    });
  }
  return _wcAdapterInstance;
}

// ─── Wallet Provider ──────────────────────────────────────────────────────────

function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wcConnecting, setWcConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tronWebReady, setTronWebReady] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>('none');
  const wcAdapterRef = useRef<WalletConnectAdapter | null>(null);

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
        // TronLink disconnected
        setAccount(null);
        setIsConnected(false);
        setConnectionType('none');
      }
    };

    // Guard: TronLink in some versions does not expose .on()
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
        throw new Error(
          'TronLink not detected. Install TronLink and reload the page.'
        );
      }
      if (window.tronLink) {
        const accounts = await window.tronLink.request({
          method: 'tron_requestAccounts',
        });
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
      const msg = err instanceof Error ? err.message : 'Connection failed.';
      setError(msg);
      setIsConnecting(false);
      throw err;
    }
  }, []);

  // ── WalletConnect connect ───────────────────────────────────────────────

  const connectWC = useCallback(async () => {
    setWcConnecting(true);
    setError(null);
    try {
      const adapter = await getWCAdapter();
      wcAdapterRef.current = adapter;

      // Subscribe to adapter events
      const onConnect = (addr: unknown) => {
        const address = addr as string;
        setAccount(address);
        setIsConnected(true);
        setConnectionType('walletconnect');
        setWcConnecting(false);
      };

      const onDisconnect = () => {
        setAccount(null);
        setIsConnected(false);
        setConnectionType('none');
        wcAdapterRef.current = null;
      };

      const onError = (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'WalletConnect error';
        setError(msg);
        setWcConnecting(false);
      };

      // Remove stale listeners before re-attaching
      adapter.off('connect', onConnect as (addr: string) => void);
      adapter.off('disconnect', onDisconnect);
      adapter.off('error', onError as (err: Error) => void);

      adapter.on('connect', onConnect as (addr: string) => void);
      adapter.on('disconnect', onDisconnect);
      adapter.on('error', onError as (err: Error) => void);

      // Opens the WalletConnect AppKit modal (QR code / deep link)
      await adapter.connect();

      // If connect() resolved without emitting 'connect' yet, read address
      if (adapter.address) {
        setAccount(adapter.address);
        setIsConnected(true);
        setConnectionType('walletconnect');
      }
      setWcConnecting(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'WalletConnect failed.';
      // Suppress "user closed modal" as a non-error UX action
      if (!msg.toLowerCase().includes('closed')) {
        setError(msg);
      }
      setWcConnecting(false);
      throw err;
    }
  }, []);

  // ── Disconnect ──────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    if (connectionType === 'walletconnect' && wcAdapterRef.current) {
      try {
        await wcAdapterRef.current.disconnect();
      } catch {
        // ignore
      }
      wcAdapterRef.current = null;
    }
    setAccount(null);
    setIsConnected(false);
    setConnectionType('none');
    setError(null);
  }, [connectionType]);

  // ── WC sign + broadcast ─────────────────────────────────────────────────

  const wcSignAndBroadcast = useCallback(async (unsignedTx: object): Promise<string> => {
    const adapter = wcAdapterRef.current;
    if (!adapter || connectionType !== 'walletconnect') {
      throw new Error('Not connected via WalletConnect.');
    }
    // adapter.signTransaction expects Tron's raw transaction format
    const signedTx = await adapter.signTransaction(unsignedTx as Parameters<typeof adapter.signTransaction>[0]);
    const txid = await broadcastTransaction(signedTx as object);
    return txid;
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
    _wcAdapter: wcAdapterRef.current,
    connect,
    connectWC,
    disconnect,
    getTronWeb,
    shortenAddress,
    wcSignAndBroadcast,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
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
