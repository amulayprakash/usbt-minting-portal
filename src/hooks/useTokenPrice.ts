import { useState, useEffect, useCallback } from 'react';
import {
  CONTRACTS,
  PAIR_ABI,
  DECIMALS_FACTOR,
} from '../constants/contracts';
import {
  callContractConstant,
  tronB58ToHex,
} from '../lib/tronGrid';

export interface PriceState {
  price: number | null;
  reserveUsbt: bigint | null;
  reserveUsdt: bigint | null;
  token0IsUsdt: boolean | null;
  priceLoading: boolean;
  priceError: string | null;
  lastUpdated: Date | null;
}

/**
 * Normalize any Tron/EVM address to a lowercase 40-char EVM hex string (no prefix).
 * Handles: "41"+hex (TronWeb internal), "0x"+hex, bare hex, base58check.
 */
function normalizeToEvmHex(addr: string): string {
  const s = addr.toLowerCase();
  if (s.startsWith('41') && s.length === 42) return s.slice(2);
  if (s.startsWith('0x') && s.length === 42) return s.slice(2);
  if (/^[0-9a-f]{40}$/.test(s)) return s;
  try { return tronB58ToHex(addr).slice(2); } catch { return s; }
}

/**
 * SunSwap v2 AMM formula (0.3% fee) using BigInt to avoid float precision loss.
 * amountOut = floor((amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997))
 */
function calcAmmOut(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint | null {
  if (reserveIn === 0n || reserveOut === 0n || amountIn === 0n) return null;
  const numerator = amountIn * 997n * reserveOut;
  const denominator = reserveIn * 1000n + amountIn * 997n;
  return numerator / denominator;
}

const collateralEvmHex = tronB58ToHex(CONTRACTS.COLLATERAL).slice(2).toLowerCase();

export function useTokenPrice() {
  const [state, setState] = useState<PriceState>({
    price: null,
    reserveUsbt: null,
    reserveUsdt: null,
    token0IsUsdt: null,
    priceLoading: false,
    priceError: null,
    lastUpdated: null,
  });

  /**
   * Fetch reserves + token orientation from pair via TronGrid REST (no window.tronWeb needed).
   * Returns { reserveUsbt, reserveUsdt } or null on failure.
   */
  const fetchReservesViaGrid = useCallback(async (): Promise<{
    reserveUsbt: bigint;
    reserveUsdt: bigint;
    token0IsUsdt: boolean;
  } | null> => {
    try {
      const [t0Result, rResult] = await Promise.all([
        callContractConstant({
          ownerAddress: CONTRACTS.STABLE,
          contractAddress: CONTRACTS.PAIR,
          functionSelector: 'token0()',
          parameter: '',
        }),
        callContractConstant({
          ownerAddress: CONTRACTS.STABLE,
          contractAddress: CONTRACTS.PAIR,
          functionSelector: 'getReserves()',
          parameter: '',
        }),
      ]);

      if (!rResult || rResult.length < 128) return null;

      // ABI-encoded address: 32 bytes (64 hex chars), last 20 bytes = EVM address
      const token0Hex = t0Result.slice(24).toLowerCase();
      const isUsdt = token0Hex === collateralEvmHex;

      const r0 = BigInt('0x' + rResult.slice(0, 64));
      const r1 = BigInt('0x' + rResult.slice(64, 128));

      const reserveUsdt = isUsdt ? r0 : r1;
      const reserveUsbt = isUsdt ? r1 : r0;

      if (reserveUsbt === 0n || reserveUsdt === 0n) return null;

      return { reserveUsbt, reserveUsdt, token0IsUsdt: isUsdt };
    } catch {
      return null;
    }
  }, []);

  const fetchPrice = useCallback(async () => {
    setState((prev) => ({ ...prev, priceLoading: true, priceError: null }));

    try {
      let r0: bigint;
      let r1: bigint;
      let token0IsUsdt: boolean;

      if (window.tronWeb) {
        // TronLink path
        const pair = await window.tronWeb.contract(
          PAIR_ABI as unknown as object[],
          CONTRACTS.PAIR
        );

        const [token0Raw, reserves] = await Promise.all([
          pair.token0().call() as Promise<string>,
          pair.getReserves().call() as Promise<{
            _reserve0: string | bigint;
            _reserve1: string | bigint;
          }>,
        ]);

        // normalizeToEvmHex handles ALL TronLink address return formats
        const token0Hex = normalizeToEvmHex(token0Raw as string);
        token0IsUsdt = token0Hex === collateralEvmHex;

        r0 = BigInt((reserves._reserve0 as bigint | string).toString());
        r1 = BigInt((reserves._reserve1 as bigint | string).toString());
      } else {
        // TronGrid REST path (WalletConnect / no TronLink)
        const result = await fetchReservesViaGrid();
        if (!result) {
          setState((prev) => ({
            ...prev,
            priceLoading: false,
            priceError: 'Could not read pool reserves',
          }));
          return;
        }
        setState({
          price: Number(result.reserveUsdt) / Number(result.reserveUsbt),
          reserveUsbt: result.reserveUsbt,
          reserveUsdt: result.reserveUsdt,
          token0IsUsdt: result.token0IsUsdt,
          priceLoading: false,
          priceError: null,
          lastUpdated: new Date(),
        });
        return;
      }

      const reserveUsdt = token0IsUsdt ? r0 : r1;
      const reserveUsbt = token0IsUsdt ? r1 : r0;

      if (reserveUsbt === 0n) {
        setState((prev) => ({
          ...prev,
          priceLoading: false,
          priceError: 'Pool has no liquidity',
        }));
        return;
      }

      setState({
        price: Number(reserveUsdt) / Number(reserveUsbt),
        reserveUsbt,
        reserveUsdt,
        token0IsUsdt,
        priceLoading: false,
        priceError: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        priceLoading: false,
        priceError: err instanceof Error ? err.message : 'Price fetch failed',
      }));
    }
  }, [fetchReservesViaGrid]);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  /**
   * Compute expected output using the SunSwap v2 AMM formula directly from pool reserves.
   * isUsbtToUsdt: true = selling USBT for USDT, false = buying USBT with USDT.
   */
  const getAmountsOut = useCallback(
    async (amountIn: number, isUsbtToUsdt: boolean): Promise<number | null> => {
      if (amountIn <= 0) return null;

      const amountInUnits = BigInt(Math.floor(amountIn * DECIMALS_FACTOR));

      // Step 1: Use cached reserves if available
      if (state.reserveUsbt !== null && state.reserveUsdt !== null) {
        const reserveIn = isUsbtToUsdt ? state.reserveUsbt : state.reserveUsdt;
        const reserveOut = isUsbtToUsdt ? state.reserveUsdt : state.reserveUsbt;
        const out = calcAmmOut(amountInUnits, reserveIn, reserveOut);
        if (out !== null) {
          const result = Number(out) / DECIMALS_FACTOR;
          return isNaN(result) ? null : result;
        }
      }

      // Step 2: Fetch fresh reserves via TronGrid
      const reserves = await fetchReservesViaGrid();
      if (reserves !== null) {
        const reserveIn = isUsbtToUsdt ? reserves.reserveUsbt : reserves.reserveUsdt;
        const reserveOut = isUsbtToUsdt ? reserves.reserveUsdt : reserves.reserveUsbt;
        const out = calcAmmOut(amountInUnits, reserveIn, reserveOut);
        if (out !== null) {
          const result = Number(out) / DECIMALS_FACTOR;
          return isNaN(result) ? null : result;
        }
      }

      // Step 3: Last resort — spot price estimate (imprecise, no fee/impact)
      if (state.price && state.price > 0) {
        return isUsbtToUsdt ? amountIn * state.price : amountIn / state.price;
      }

      return null;
    },
    [state.price, state.reserveUsbt, state.reserveUsdt, fetchReservesViaGrid]
  );

  return { ...state, fetchPrice, getAmountsOut };
}
