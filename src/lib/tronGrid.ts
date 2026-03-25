/**
 * TronGrid REST API helpers
 * Used to build/broadcast raw transactions and read contract state
 * without relying on window.tronWeb, which TronLink wraps in an async
 * Proxy that breaks synchronous utility calls like address.toHex().
 */

const TRON_GRID_URL = import.meta.env.VITE_TRON_FULL_NODE as string;
const TRONGRID_API_KEY = (import.meta.env.VITE_TRONGRID_API_KEY as string | undefined) ?? '';

function tronGridHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  if (TRONGRID_API_KEY) headers['TRON-PRO-API-KEY'] = TRONGRID_API_KEY;
  return headers;
}

/**
 * Convert a Tron base58check address to the 42-char hex TronWeb uses
 * internally (e.g. "41a614f803b6fd780986a42c78ec9c7f77e6ded13c").
 *
 * Pure synchronous JS — never touches window.tronWeb so it is safe to call
 * even when TronLink's Proxy wraps every tronWeb method as async.
 *
 * Tron address = base58check 25 bytes: [0x41 version][20-byte addr][4-byte checksum]
 * Hex form = first 21 bytes → "41" + 40 hex chars = 42 chars total.
 */
export function tronB58ToHex(addr: string): string {
  const ALPHA = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = 0n;
  for (const ch of addr) {
    const i = ALPHA.indexOf(ch);
    if (i < 0) throw new Error(`Invalid base58 char: ${ch}`);
    n = n * 58n + BigInt(i);
  }
  return n.toString(16).padStart(50, '0').slice(0, 42);
}

/** Encode a uint256 as a 32-byte ABI parameter (hex string, no 0x prefix) */
export function abiEncodeUint256(n: bigint | number | string): string {
  return BigInt(n).toString(16).padStart(64, '0');
}

/**
 * Encode a Tron base58 address as a 32-byte ABI parameter.
 * Uses pure-JS base58 decode — no dependency on window.tronWeb.
 */
export function abiEncodeAddress(base58Addr: string): string {
  const fullHex = tronB58ToHex(base58Addr); // "41" + 40 chars
  const evmHex = fullHex.slice(2);          // remove "41" → 20-byte EVM address
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
    headers: tronGridHeaders(),
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
    headers: tronGridHeaders(),
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
    headers: tronGridHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`TronGrid constant call error: ${res.status}`);
  const data = await res.json();
  return (data.constant_result?.[0] as string) ?? '';
}
