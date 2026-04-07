import { createContext, useContext } from 'react';
import type { SessionTypes } from '@walletconnect/types';

export type ConnectionType = 'none' | 'tronlink' | 'walletconnect' | 'evm';

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
  connectWC: (chainType?: 'tron' | 'evm') => Promise<void>;
  connectExtension: (walletName: string) => Promise<void>;
  disconnect: () => void;
  getTronWeb: () => typeof window.tronWeb;
  shortenAddress: (addr: string) => string;
  /**
   * Signs an unsigned Tron transaction via WalletConnect and
   * broadcasts it via TronGrid. Throws if not in WC mode.
   * Returns txid on success.
   */
  wcSignAndBroadcast: (unsignedTx: object) => Promise<string>;
  /** Whether a WalletConnect session is in progress */
  wcConnecting: boolean;
  /**
   * The current WalletConnect pairing URI — set as soon as
   * the session proposal is created so the modal can display
   * a QR code and wallet deep-links before the wallet approves.
   * Cleared to null once connected or on error.
   */
  wcUri: string | null;
  /** The active WalletConnect session (for advanced use). */
  _wcSession: SessionTypes.Struct | null;
}

export const WalletContext = createContext<WalletContextValue>({
  account: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  tronWebReady: false,
  connectionType: 'none',
  wcConnecting: false,
  wcUri: null,
  _wcSession: null,
  connect: async () => {},
  connectWC: async (_chainType?: 'tron' | 'evm') => {},
  connectExtension: async () => {},
  disconnect: () => {},
  getTronWeb: () => undefined,
  shortenAddress: (a) => a,
  wcSignAndBroadcast: async () => { throw new Error('Not in WalletConnect mode'); },
});

export function useWallet() {
  return useContext(WalletContext);
}
