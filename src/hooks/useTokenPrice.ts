import { useState, useEffect, useCallback } from 'react';
import {
  CONTRACTS,
  PAIR_ABI,
  ROUTER_ABI,
  DECIMALS_FACTOR,
} from '../constants/contracts';

export interface PriceState {
  price: number | null;
  priceLoading: boolean;
  priceError: string | null;
  lastUpdated: Date | null;
}

export function useTokenPrice() {
  const [state, setState] = useState<PriceState>({
    price: null,
    priceLoading: false,
    priceError: null,
    lastUpdated: null,
  });

  const fetchPrice = useCallback(async () => {
    if (!window.tronWeb) return;

    setState((prev) => ({ ...prev, priceLoading: true, priceError: null }));

    try {
      const pair = await window.tronWeb.contract(
        PAIR_ABI as unknown as object[],
        CONTRACTS.PAIR
      );

      const token0 = (await pair.token0().call()) as string;
      const reserves = (await pair.getReserves().call()) as {
        _reserve0: string | bigint;
        _reserve1: string | bigint;
      };

      const r0 = BigInt(reserves._reserve0.toString());
      const r1 = BigInt(reserves._reserve1.toString());

      // Determine orientation: which reserve is USDT (COLLATERAL)
      const collateralLower = CONTRACTS.COLLATERAL.toLowerCase();
      const token0Lower = token0.toLowerCase().replace(/^41/, '');
      const collateralStripped = collateralLower.replace(/^41/, '');

      let usdtReserve: bigint;
      let usbtReserve: bigint;

      if (token0Lower === collateralStripped || token0 === CONTRACTS.COLLATERAL) {
        usdtReserve = r0;
        usbtReserve = r1;
      } else {
        usbtReserve = r0;
        usdtReserve = r1;
      }

      if (usbtReserve === BigInt(0)) {
        setState((prev) => ({
          ...prev,
          priceLoading: false,
          priceError: 'Pool has no liquidity',
        }));
        return;
      }

      const price = Number(usdtReserve) / Number(usbtReserve);

      setState({
        price,
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
  }, []);

  useEffect(() => {
    if (window.tronWeb) {
      fetchPrice();
    }
    const interval = setInterval(() => {
      if (window.tronWeb) fetchPrice();
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  /**
   * Get expected output amount using on-chain AMM router.
   * isUsbtToUsdt: true = selling USBT for USDT, false = buying USBT with USDT
   */
  const getAmountsOut = useCallback(
    async (amountIn: number, isUsbtToUsdt: boolean): Promise<number | null> => {
      if (!window.tronWeb || amountIn <= 0) return null;

      try {
        const router = await window.tronWeb.contract(
          ROUTER_ABI as unknown as object[],
          CONTRACTS.ROUTER
        );

        const amountInUnits = BigInt(Math.floor(amountIn * DECIMALS_FACTOR));
        const path = isUsbtToUsdt
          ? [CONTRACTS.STABLE, CONTRACTS.COLLATERAL]
          : [CONTRACTS.COLLATERAL, CONTRACTS.STABLE];

        const amounts = (await router
          .getAmountsOut(amountInUnits, path)
          .call()) as bigint[];

        const result = Number(amounts[amounts.length - 1]) / DECIMALS_FACTOR;
        return isNaN(result) ? null : result;
      } catch {
        // Fall back to spot price estimate
        if (state.price && state.price > 0) {
          return isUsbtToUsdt ? amountIn * state.price : amountIn / state.price;
        }
        return null;
      }
    },
    [state.price]
  );

  return { ...state, fetchPrice, getAmountsOut };
}
