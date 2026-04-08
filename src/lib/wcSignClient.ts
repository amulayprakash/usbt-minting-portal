/**
 * WalletConnect SignClient wrapper for TRON
 * Uses @walletconnect/sign-client v2 directly so we can get the
 * pairing URI and deep-link users into their chosen wallet.
 */
import SignClient from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';

export type { SessionTypes };

// TRON CAIP-2 chain IDs
export const TRON_CHAIN = 'tron:0x2b6653dc';       // mainnet
export const TRON_CHAIN_SHASTA = 'tron:0x94a9059e'; // testnet
// EVM chains
export const EIP155_CHAINS = ['eip155:1', 'eip155:56', 'eip155:137'];

let _client: Awaited<ReturnType<typeof SignClient.init>> | null = null;

export async function getSignClient() {
  if (_client) return _client;
  _client = await SignClient.init({
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string,
    metadata: {
      name: 'USBT Exchange',
      description: 'Mint and trade USBT on Tron Mainnet',
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.svg`],
    },
  });
  return _client;
}

/**
 * Creates a new WalletConnect session proposal.
 * Returns the pairing URI (for QR / deep-link) and an approval promise
 * that resolves once the wallet approves.
 */
export async function wcConnect(chainType: 'tron' | 'evm' = 'tron'): Promise<{
  uri: string;
  approval: () => Promise<SessionTypes.Struct>;
}> {
  const client = await getSignClient();

  const tronNamespace = {
    methods: ['tron_signTransaction', 'tron_signMessage'],
    chains: [TRON_CHAIN],
    events: ['chainChanged', 'accountsChanged'],
  };

  const evmNamespace = {
    methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4'],
    chains: EIP155_CHAINS,
    events: ['chainChanged', 'accountsChanged'],
  };

  // Required namespaces ensure the wallet registers and approves these methods.
  // Optional namespaces are often ignored by wallets like Trust Wallet, causing
  // "unknown methods called" errors when tron_signTransaction is invoked.
  const result = chainType === 'tron'
    ? await client.connect({ requiredNamespaces: { tron: tronNamespace } })
    : await client.connect({ optionalNamespaces: { eip155: evmNamespace } });
  if (!result.uri) throw new Error('WalletConnect did not return a pairing URI.');
  return result as { uri: string; approval: () => Promise<SessionTypes.Struct> };
}

/**
 * Signs a TRON transaction via an active WalletConnect session.
 * Returns the signed transaction object ready to broadcast.
 *
 * The Tron WalletConnect spec uses params as [tx] (array).
 * We strip `visible: true` before sending because some wallets (Trust Wallet)
 * fail to parse the base58 addresses that TronGrid includes when visible=true.
 * The wallet only needs raw_data_hex to compute the signature.
 */
export async function wcSignTx(
  session: SessionTypes.Struct,
  unsignedTx: object,
): Promise<object> {
  const client = await getSignClient();

  // Strip the `visible` flag — it causes base58 addresses in raw_data which
  // Trust Wallet's parser can't handle. The signing only uses raw_data_hex.
  const { visible: _visible, ...txForWallet } = unsignedTx as Record<string, unknown>;

  const signed = await client.request<object>({
    topic: session.topic,
    chainId: TRON_CHAIN,
    request: { method: 'tron_signTransaction', params: [txForWallet] },
  });
  return signed;
}

/**
 * Sends an EVM transaction via WalletConnect (for mobile wallets).
 * Returns the tx hash.
 */
export async function wcEvmSendTransaction(
  session: SessionTypes.Struct,
  chainId: string, // e.g. 'eip155:11155111'
  tx: { from: string; to: string; data: string },
): Promise<string> {
  const client = await getSignClient();
  return await client.request<string>({
    topic: session.topic,
    chainId,
    request: { method: 'eth_sendTransaction', params: [tx] },
  });
}

/**
 * Extracts the EVM address from a WalletConnect session (eip155 namespace).
 */
export function evmAddressFromSession(session: SessionTypes.Struct): string | null {
  const accounts = session.namespaces?.eip155?.accounts ?? [];
  if (!accounts.length) return null;
  return accounts[0].split(':')[2] ?? null;
}

/**
 * Returns the eip155 chainId string from the session (e.g. 'eip155:11155111')
 */
export function evmChainIdFromSession(session: SessionTypes.Struct): string | null {
  const chains = session.namespaces?.eip155?.chains ?? [];
  return chains[0] ?? null;
}

/** Terminates an active WalletConnect session. */
export async function wcDisconnect(topic: string): Promise<void> {
  try {
    const client = await getSignClient();
    await client.disconnect({ topic, reason: { code: 6000, message: 'User disconnected' } });
  } catch { /* session may already be gone */ }
}

/**
 * Extracts the TRON base58 address from a WalletConnect session.
 * Accounts are stored as CAIP-10 strings: "tron:0x2b6653dc:TAddress"
 */
export function tronAddressFromSession(session: SessionTypes.Struct): string | null {
  const accounts = session.namespaces?.tron?.accounts ?? [];
  if (!accounts.length) return null;
  return accounts[0].split(':')[2] ?? null;
}
