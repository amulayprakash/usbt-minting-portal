import { createContext, useContext } from 'react';
import type { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect';

export type ConnectionType = 'none' | 'tronlink' | 'walletconnect';

export interface WalletState {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  tronWebReady: boolean;
  connectionType: ConnectionType;
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  connectWC: () => Promise<void>;
  disconnect: () => void;
  getTronWeb: () => typeof window.tronWeb;
  shortenAddress: (addr: string) => string;
  /**
   * Signs an unsigned Tron transaction via WalletConnect adapter and
   * broadcasts it via TronGrid. Throws if not in WC mode.
   * Returns txid on success.
   */
  wcSignAndBroadcast: (unsignedTx: object) => Promise<string>;
  /** Whether a WalletConnect session is in progress (modal open) */
  wcConnecting: boolean;
  _wcAdapter: WalletConnectAdapter | null;
}

export const WalletContext = createContext<WalletContextValue>({
  account: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  tronWebReady: false,
  connectionType: 'none',
  wcConnecting: false,
  _wcAdapter: null,
  connect: async () => {},
  connectWC: async () => {},
  disconnect: () => {},
  getTronWeb: () => undefined,
  shortenAddress: (a) => a,
  wcSignAndBroadcast: async () => { throw new Error('Not in WalletConnect mode'); },
});

export function useWallet() {
  return useContext(WalletContext);
}
