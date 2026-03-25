/**
 * USBT Portal — Contract & Network Constants
 * Tron Mainnet
 */

export const CONTRACTS = {
  /** SunSwap v2 Router */
  ROUTER: import.meta.env.VITE_CONTRACT_ROUTER as string,
  /** USBT/USDT liquidity pair on SunSwap */
  PAIR: import.meta.env.VITE_CONTRACT_PAIR as string,
  /** USBT token / minting contract */
  STABLE: import.meta.env.VITE_CONTRACT_STABLE as string,
  /** USDT TRC-20 collateral */
  COLLATERAL: import.meta.env.VITE_CONTRACT_COLLATERAL as string,
};

export const TRON_MAINNET_FULL_NODE = import.meta.env.VITE_TRON_FULL_NODE as string;
export const TRON_MAINNET_CHAIN_ID = import.meta.env.VITE_TRON_CHAIN_ID as string;

export const SUNSWAP_PAIR_URL = import.meta.env.VITE_SUNSWAP_PAIR_URL as string;

export const TRONSCAN_TX_URL = (txid: string) =>
  `https://tronscan.org/#/transaction/${txid}`;

export const TRONSCAN_CONTRACT_URL =
  `https://tronscan.org/#/contract/${import.meta.env.VITE_CONTRACT_STABLE}/code`;

/** USDT TRC-20: approve + balanceOf + allowance */
export const TRC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'Function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'Function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'Function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'Function',
  },
] as const;

/**
 * USBT minting contract ABI
 * buyTokens selector: 0x3610724e → buyTokens(uint256 usdtAmount)
 * Returns amount of USBT minted.
 */
export const STABLE_ABI = [
  {
    constant: false,
    inputs: [{ name: 'usdtAmount', type: 'uint256' }],
    name: 'buyTokens',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'Function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getPrice',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'Function',
  },
  {
    constant: true,
    inputs: [],
    name: 'tokenPrice',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'Function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'Function',
  },
] as const;

/** SunSwap v2 Router — getAmountsOut + swapExactTokensForTokens */
export const ROUTER_ABI = [
  {
    constant: true,
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsOut',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    type: 'Function',
  },
  {
    constant: false,
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactTokensForTokens',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    type: 'Function',
  },
] as const;

/** SunSwap pair ABI — for reading reserves */
export const PAIR_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: '_reserve0', type: 'uint112' },
      { name: '_reserve1', type: 'uint112' },
      { name: '_blockTimestampLast', type: 'uint32' },
    ],
    type: 'Function',
  },
  {
    constant: true,
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    type: 'Function',
  },
  {
    constant: true,
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    type: 'Function',
  },
] as const;

/** Token decimals assumption — USDT TRC-20 = 6, USBT = 6 */
export const TOKEN_DECIMALS = 6;
export const DECIMALS_FACTOR = 1_000_000;

export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
export const DEFAULT_DEADLINE_MINUTES = 20;
export const FEE_LIMIT_SUN = 50_000_000; // 50 TRX
