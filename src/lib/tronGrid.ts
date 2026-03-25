/**
 * TronGrid REST API helpers
 * Used when window.tronWeb is unavailable (WalletConnect-only sessions)
 * or to build raw unsigned transactions for WC signing.
 */

const TRON_GRID_URL = import.meta.env.VITE_TRON_FULL_NODE as string;

/** Encode a uint256 as a 32-byte ABI parameter (hex string, no 0x prefix) */
export function abiEncodeUint256(n: bigint | number | string): string {
  return BigInt(n).toString(16).padStart(64, '0');
}

/**
 * Encode a Tron address as a 32-byte ABI parameter.
 * Requires window.tronWeb to convert from base58, which is available
 * whenever TronLink is installed alongside WalletConnect.
 */
export function abiEncodeAddress(base58Addr: string): string {
  if (!window.tronWeb) throw new Error('TronWeb not available for address encoding');
  // tronWeb converts base58 → hex starting with "41"
  const fullHex: string = (window.tronWeb as any).address
    ? (window.tronWeb as any).address.toHex(base58Addr)
    : base58Addr;
  // Remove "41" Tron prefix to get 20-byte EVM address
  const evmHex = fullHex.startsWith('41') ? fullHex.slice(2) : fullHex;
  return evmHex.padStart(64, '0');
}

/**
 * Encode an address[] dynamic array for ABI calldata.
 * Layout: offset(32) + length(32) + elements...
 */
export function abiEncodeAddressArray(addrs: string[]): string {
  const offset = abiEncodeUint256(32); // points to length slot
  const length = abiEncodeUint256(addrs.length);
  const elements = addrs.map(abiEncodeAddress).join('');
  return offset + length + elements;
}

/**
 * Build an unsigned smart contract call via TronGrid.
 * Returns the raw transaction object, ready to be signed.
 */
export async function buildTriggerSmartContract(params: {
  ownerAddress: string;
  contractAddress: string;
  functionSelector: string;
  parameter: string; // ABI-encoded hex (no 0x prefix)
  feeLimit: number;
  callValue?: number;
}): Promise<object> {
  const body = {
    owner_address: params.ownerAddress,
    contract_address: params.contractAddress,
    function_selector: params.functionSelector,
    parameter: params.parameter,
    fee_limit: params.feeLimit,
    call_value: params.callValue ?? 0,
    visible: true, // accept base58 addresses
  };

  const res = await fetch(`${TRON_GRID_URL}/wallet/triggersmartcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`TronGrid error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.result?.result) {
    throw new Error(
      data.result?.message
        ? atob(data.result.message)
        : 'Failed to build transaction'
    );
  }

  return data.transaction;
}

/** Broadcast a signed transaction to the Tron network via TronGrid */
export async function broadcastTransaction(signedTx: object): Promise<string> {
  const res = await fetch(`${TRON_GRID_URL}/wallet/broadcasttransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signedTx),
  });

  if (!res.ok) {
    throw new Error(`Broadcast error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.result) {
    throw new Error(data.message || 'Broadcast failed');
  }

  return (data.txid as string) ?? '';
}

/**
 * Read the return value of a constant (view) contract call via TronGrid.
 * Returns a hex string of the result.
 */
export async function callContractConstant(params: {
  ownerAddress: string;
  contractAddress: string;
  functionSelector: string;
  parameter?: string;
}): Promise<string> {
  const body = {
    owner_address: params.ownerAddress,
    contract_address: params.contractAddress,
    function_selector: params.functionSelector,
    parameter: params.parameter ?? '',
    visible: true,
  };

  const res = await fetch(`${TRON_GRID_URL}/wallet/triggerconstantcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`TronGrid constant call error: ${res.status}`);
  const data = await res.json();
  return (data.constant_result?.[0] as string) ?? '';
}
