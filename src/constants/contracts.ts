/**
 * USBT Portal — Contract & Network Constants
 * Network is controlled by VITE_TRON_NETWORK env var (shasta | mainnet)
 */

export const TRON_NETWORK = (import.meta.env.VITE_TRON_NETWORK as string) || 'mainnet';
export const IS_TESTNET = TRON_NETWORK === 'shasta';

export const CONTRACTS = {
  /** SunSwap v2 Router (mainnet only) */
  ROUTER: (import.meta.env.VITE_CONTRACT_ROUTER as string) || '',
  /** USBT/USDT liquidity pair on SunSwap (mainnet only) */
  PAIR: (import.meta.env.VITE_CONTRACT_PAIR as string) || '',
  /** USBT token / minting contract (mainnet only) */
  STABLE: (import.meta.env.VITE_CONTRACT_STABLE as string) || '',
  /** USDT TRC-20 collateral */
  COLLATERAL: import.meta.env.VITE_CONTRACT_COLLATERAL as string,
};

/** Master wallet — receives deposits, sends withdrawals */
export const MASTER_TRON_ADDRESS = import.meta.env.VITE_MASTER_TRON_ADDRESS as string;

export const TRON_FULL_NODE = import.meta.env.VITE_TRON_FULL_NODE as string;
export const TRON_CHAIN_ID = import.meta.env.VITE_TRON_CHAIN_ID as string;

export const SUNSWAP_PAIR_URL = import.meta.env.VITE_SUNSWAP_PAIR_URL as string;

const TRONSCAN_BASE = IS_TESTNET
  ? 'https://shasta.tronscan.org/#/transaction/'
  : 'https://tronscan.org/#/transaction/';

export const TRONSCAN_TX_URL = (txid: string) => `${TRONSCAN_BASE}${txid}`;

export const TRONSCAN_CONTRACT_URL = IS_TESTNET
  ? `https://shasta.tronscan.org/#/contract/${MASTER_TRON_ADDRESS}`
  : `https://tronscan.org/#/contract/${import.meta.env.VITE_CONTRACT_STABLE}/code`;

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
 * buyTokens selector:    0x3610724e → buyTokens(uint256 usdtAmount)
 * exchangeRate selector: 0x3ba0b9a9 → exchangeRate() → uint256
 * Returns amount of USBT minted.
 */
export const STABLE_ABI = [
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
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'Function',
  },
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
    name: 'exchangeRate',
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

/** EVM master wallet — receives EVM deposits */
export const MASTER_EVM_ADDRESS = import.meta.env.VITE_MASTER_EVM_ADDRESS as string;

type EvmChainConfig = {
  chainId: string;     // hex chain ID for wallet_switchEthereumChain
  rpcUrl: string;      // public RPC for verification
  tokenAddress: string;// USDT/USDC contract
  tokenSymbol: string;
  tokenDecimals: number;
  label: string;       // human-readable name shown in explorer links
  explorerTx: string;  // base URL for tx explorer
};

// On testnet all EVM networks map to Sepolia — swap entire object for mainnet
export const EVM_CHAINS: Record<string, EvmChainConfig> = IS_TESTNET
  ? {
    ethereum:  {
      chainId: '0xaa36a7',
      rpcUrl: 'https://eth-sepolia.public.blastapi.io',
      tokenAddress: import.meta.env.VITE_EVM_TOKEN_SEPOLIA as string,
      tokenSymbol: 'USDT',
      tokenDecimals: 6,
      label: 'Sepolia',
      explorerTx: 'https://sepolia.etherscan.io/tx/',
    },
    bsc:       { chainId: '0xaa36a7', rpcUrl: 'https://eth-sepolia.public.blastapi.io', tokenAddress: import.meta.env.VITE_EVM_TOKEN_SEPOLIA as string, tokenSymbol: 'USDT', tokenDecimals: 6, label: 'Sepolia', explorerTx: 'https://sepolia.etherscan.io/tx/' },
    polygon:   { chainId: '0xaa36a7', rpcUrl: 'https://eth-sepolia.public.blastapi.io', tokenAddress: import.meta.env.VITE_EVM_TOKEN_SEPOLIA as string, tokenSymbol: 'USDT', tokenDecimals: 6, label: 'Sepolia', explorerTx: 'https://sepolia.etherscan.io/tx/' },
    solana:    { chainId: '0xaa36a7', rpcUrl: 'https://eth-sepolia.public.blastapi.io', tokenAddress: import.meta.env.VITE_EVM_TOKEN_SEPOLIA as string, tokenSymbol: 'USDT', tokenDecimals: 6, label: 'Sepolia', explorerTx: 'https://sepolia.etherscan.io/tx/' },
    avalanche: { chainId: '0xaa36a7', rpcUrl: 'https://eth-sepolia.public.blastapi.io', tokenAddress: import.meta.env.VITE_EVM_TOKEN_SEPOLIA as string, tokenSymbol: 'USDT', tokenDecimals: 6, label: 'Sepolia', explorerTx: 'https://sepolia.etherscan.io/tx/' },
  }
  : {
    ethereum:  { chainId: '0x1',      rpcUrl: 'https://eth.llamarpc.com',              tokenAddress: import.meta.env.VITE_EVM_TOKEN_ETHEREUM as string, tokenSymbol: 'USDT', tokenDecimals: 6, label: 'Ethereum', explorerTx: 'https://etherscan.io/tx/' },
    bsc:       { chainId: '0x38',     rpcUrl: 'https://bsc-dataseed.binance.org',       tokenAddress: import.meta.env.VITE_EVM_TOKEN_BSC as string,      tokenSymbol: 'USDT', tokenDecimals: 18, label: 'BNB Chain', explorerTx: 'https://bscscan.com/tx/' },
    polygon:   { chainId: '0x89',     rpcUrl: 'https://polygon-rpc.com',               tokenAddress: import.meta.env.VITE_EVM_TOKEN_POLYGON as string,   tokenSymbol: 'USDT', tokenDecimals: 6, label: 'Polygon', explorerTx: 'https://polygonscan.com/tx/' },
    solana:    { chainId: '0x0',      rpcUrl: '',                                       tokenAddress: '',                                                  tokenSymbol: 'USDT', tokenDecimals: 6, label: 'Solana',   explorerTx: 'https://solscan.io/tx/' },
    avalanche: { chainId: '0xa86a',   rpcUrl: 'https://api.avax.network/ext/bc/C/rpc', tokenAddress: import.meta.env.VITE_EVM_TOKEN_AVALANCHE as string, tokenSymbol: 'USDT', tokenDecimals: 6, label: 'Avalanche', explorerTx: 'https://snowtrace.io/tx/' },
  };

/** Token decimals assumption — USDT TRC-20 = 6, USBT = 6 */
export const TOKEN_DECIMALS = 6;
export const DECIMALS_FACTOR = 1_000_000;

export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
export const DEFAULT_DEADLINE_MINUTES = 20;
export const FEE_LIMIT_SUN = 50_000_000; // 50 TRX
