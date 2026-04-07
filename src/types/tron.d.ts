export interface TronContractMethod {
  call: () => Promise<unknown>;
  send: (options?: {
    from?: string;
    feeLimit?: number;
    callValue?: number;
    shouldPollResponse?: boolean;
  }) => Promise<{
    transaction?: { txID: string };
    txid?: string;
    result?: unknown;
  }>;
}

export interface TronContract {
  [method: string]: (...args: unknown[]) => TronContractMethod;
}

export interface TronWebInstance {
  defaultAddress: {
    base58: string;
    hex: string;
  };
  ready: boolean;
  fullNode: { host: string };
  address: {
    toHex: (base58: string) => string;
    fromHex: (hex: string) => string;
  };
  contract: (abi: object[], address: string) => Promise<TronContract>;
  trx: {
    getBalance: (address: string) => Promise<number>;
    sign: (transaction: object) => Promise<object>;
  };
  toSun: (amount: string | number) => string;
  fromSun: (amount: string | number) => string;
  BigNumber: new (n: number | string) => { toFixed: (d: number) => string };
}

export interface TronLinkProvider {
  request: (params: {
    method: string;
    params?: unknown[];
  }) => Promise<string[]>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
  ready: boolean;
}

export interface EthereumProvider {
  request: (params: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  selectedAddress?: string | null;
}

declare global {
  interface Window {
    tronWeb: TronWebInstance | undefined;
    tronLink: TronLinkProvider | undefined;
    ethereum: EthereumProvider | undefined;
  }
}
