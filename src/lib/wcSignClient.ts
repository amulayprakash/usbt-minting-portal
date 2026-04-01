/**
 * WalletConnect SignClient wrapper for TRON
 * Uses @walletconnect/sign-client v2 directly so we can get the
 * pairing URI and deep-link users into their chosen wallet.
 */
import SignClient from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';

export type { SessionTypes };

// TRON Mainnet CAIP-2 chain ID
export const TRON_CHAIN = 'tron:0x2b6653dc';

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
export async function wcConnect(): Promise<{
  uri: string;
  approval: () => Promise<SessionTypes.Struct>;
}> {
  const client = await getSignClient();
  const result = await client.connect({
    requiredNamespaces: {
      tron: {
        methods: ['tron_signTransaction', 'tron_signMessage'],
        chains: [TRON_CHAIN],
        events: ['chainChanged', 'accountsChanged'],
      },
    },
  });
  if (!result.uri) throw new Error('WalletConnect did not return a pairing URI.');
  return result as { uri: string; approval: () => Promise<SessionTypes.Struct> };
}

/**
 * Signs a TRON transaction via an active WalletConnect session.
 * Returns the signed transaction object ready to broadcast.
 */
export async function wcSignTx(
  session: SessionTypes.Struct,
  unsignedTx: object,
): Promise<object> {
  const client = await getSignClient();
  const signed = await client.request<object>({
    topic: session.topic,
    chainId: TRON_CHAIN,
    request: { method: 'tron_signTransaction', params: [unsignedTx] },
  });
  return signed;
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
