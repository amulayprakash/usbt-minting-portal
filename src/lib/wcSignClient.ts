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
 * Params format follows @tronweb3/walletconnect-tron (the official Tron WC adapter):
 *   - v2 (default): { address, transaction: { transaction: rawTx } }
 *   - v1 (legacy):  { address, transaction: rawTx }
 *     determined by session.sessionProperties?.tron_method_version === 'v1'
 *
 * The wallet signs raw_data_hex; we strip `visible` to avoid base58 address
 * confusion in wallets that expect hex-format raw_data.
 */
export async function wcSignTx(
  session: SessionTypes.Struct,
  unsignedTx: object,
): Promise<object> {
  const client = await getSignClient();

  // Tron address from session (CAIP-10: "tron:chainId:TAddress")
  const tronAccounts = session.namespaces?.tron?.accounts ?? [];
  const address = tronAccounts[0]?.split(':')[2] ?? '';

  // Use the actual chain ID from the approved session (avoids chain-ID mismatch)
  const chainId = tronAccounts[0]?.split(':').slice(0, 2).join(':') ?? TRON_CHAIN;

  // Strip `visible` — base58 addresses in raw_data confuse some wallet parsers
  const { visible: _visible, ...tx } = unsignedTx as Record<string, unknown>;

  // v1 wallets use flat { address, transaction: tx }
  // v2 wallets (default) wrap: { address, transaction: { transaction: tx } }
  const sessionProps = (session as any).sessionProperties;
  const isV1 = sessionProps?.tron_method_version === 'v1';
  const params = isV1
    ? { address, transaction: tx }
    : { address, transaction: { transaction: tx } };

  const result = await client.request<any>({
    topic: session.topic,
    chainId,
    request: { method: 'tron_signTransaction', params },
  });

  // Official adapter returns result.result when present, otherwise result
  return result?.result ?? result;
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
