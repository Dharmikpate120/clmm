import { TickData } from "../types";

export const tickToPrice = (tick: number): number => {
  return Math.pow(1.0001, tick);
};

export const calculateDeltaA = (priceLow: number, priceHigh: number, liquidity: number): number => {
  return liquidity * (Math.sqrt(priceHigh) - Math.sqrt(priceLow));
};

export const calculateDeltaB = (priceLow: number, priceHigh: number, liquidity: number): number => {
  const sqrtLow = Math.sqrt(priceLow);
  const sqrtHigh = Math.sqrt(priceHigh);
  if (sqrtLow === 0 || sqrtHigh === 0) return 0;
  return liquidity * (1 / sqrtLow - 1 / sqrtHigh);
};

export const getNextPriceFromA = (deltaA: number, liquidity: number, lowerPrice: number): number => {
  return Math.pow(deltaA / liquidity + Math.sqrt(lowerPrice), 2);
};

export const getNextPriceFromB = (deltaB: number, liquidity: number, higherPrice: number): number => {
  const sqrtHP = Math.sqrt(higherPrice);
  if (sqrtHP === 0) return 0;
  return Math.pow((liquidity * sqrtHP) / (deltaB * sqrtHP + liquidity), 2);
};

export interface SwapSimulationResult {
  amountOut: number;
  remainingIn: number;
  finalPrice: number;
  priceImpact: number;
}

/**
 * Simulates a swap forward (Exact Input)
 */
export function simulateSwap(
  amountIn: number,
  isTokenAIn: boolean,
  currentPrice: number,
  currentLiquidity: number,
  ticks: TickData[]
): SwapSimulationResult {
  let remainingIn = amountIn;
  let totalOut = 0;
  let currPrice = currentPrice;
  let currLiquidity = currentLiquidity;

  const sortedTicks = [...ticks].sort((a, b) => a.tick - b.tick);
  const initialPrice = currentPrice;

  if (isTokenAIn) {
    // Price increases: Move up through ticks
    const ticksAbove = sortedTicks.filter(t => t.tick > Math.log(currPrice) / Math.log(1.0001));
    
    for (const tick of ticksAbove) {
      if (remainingIn <= 0) break;
      
      const targetPrice = tickToPrice(tick.tick);
      const maxDeltaA = calculateDeltaA(currPrice, targetPrice, currLiquidity);
      
      if (maxDeltaA <= remainingIn) {
        totalOut += calculateDeltaB(currPrice, targetPrice, currLiquidity);
        remainingIn -= maxDeltaA;
        currPrice = targetPrice;
        currLiquidity += tick.liquidity;
      } else {
        const finalPrice = getNextPriceFromA(remainingIn, currLiquidity, currPrice);
        totalOut += calculateDeltaB(currPrice, finalPrice, currLiquidity);
        remainingIn = 0;
        currPrice = finalPrice;
        break;
      }
    }
  } else {
    // Price decreases: Move down through ticks
    const ticksBelow = sortedTicks.filter(t => t.tick <= Math.log(currPrice) / Math.log(1.0001)).reverse();
    
    for (const tick of ticksBelow) {
      if (remainingIn <= 0) break;
      
      const targetPrice = tickToPrice(tick.tick);
      const maxDeltaB = calculateDeltaB(targetPrice, currPrice, currLiquidity);
      
      if (maxDeltaB <= remainingIn) {
        totalOut += calculateDeltaA(targetPrice, currPrice, currLiquidity);
        remainingIn -= maxDeltaB;
        currPrice = targetPrice;
        currLiquidity -= tick.liquidity;
      } else {
        const finalPrice = getNextPriceFromB(remainingIn, currLiquidity, currPrice);
        totalOut += calculateDeltaA(finalPrice, currPrice, currLiquidity);
        remainingIn = 0;
        currPrice = finalPrice;
        break;
      }
    }
  }

  return {
    amountOut: totalOut,
    remainingIn,
    finalPrice: currPrice,
    priceImpact: Math.abs((currPrice - initialPrice) / initialPrice) * 100
  };
}

/**
 * Simulates a swap backward (Exact Output)
 */
export function simulateSwapInverse(
  amountOut: number,
  isTokenAIn: boolean,
  currentPrice: number,
  currentLiquidity: number,
  ticks: TickData[]
): SwapSimulationResult {
  let remainingOut = amountOut;
  let totalIn = 0;
  let currPrice = currentPrice;
  let currLiquidity = currentLiquidity;

  const sortedTicks = [...ticks].sort((a, b) => a.tick - b.tick);
  const initialPrice = currentPrice;

  if (isTokenAIn) {
    // Price increases. Token Out is B.
    const ticksAbove = sortedTicks.filter(t => t.tick > Math.log(currPrice) / Math.log(1.0001));
    
    for (const tick of ticksAbove) {
      if (remainingOut <= 0) break;
      
      const targetPrice = tickToPrice(tick.tick);
      const maxDeltaB = calculateDeltaB(currPrice, targetPrice, currLiquidity);
      
      if (maxDeltaB <= remainingOut) {
        totalIn += calculateDeltaA(currPrice, targetPrice, currLiquidity);
        remainingOut -= maxDeltaB;
        currPrice = targetPrice;
        currLiquidity += tick.liquidity;
      } else {
        // Find price where deltaB is remainingOut
        // deltaB = L * (1/sqrt(P_low) - 1/sqrt(P_high))
        // 1/sqrt(P_high) = 1/sqrt(P_low) - deltaB/L
        // sqrt(P_high) = 1 / (1/sqrt(P_low) - deltaB/L)
        const sqrtPlow = Math.sqrt(currPrice);
        const finalPrice = Math.pow(1 / (1 / sqrtPlow - remainingOut / currLiquidity), 2);
        
        totalIn += calculateDeltaA(currPrice, finalPrice, currLiquidity);
        remainingOut = 0;
        currPrice = finalPrice;
        break;
      }
    }
  } else {
    // Price decreases. Token Out is A.
    const ticksBelow = sortedTicks.filter(t => t.tick <= Math.log(currPrice) / Math.log(1.0001)).reverse();
    
    for (const tick of ticksBelow) {
      if (remainingOut <= 0) break;
      
      const targetPrice = tickToPrice(tick.tick);
      const maxDeltaA = calculateDeltaA(targetPrice, currPrice, currLiquidity);
      
      if (maxDeltaA <= remainingOut) {
        totalIn += calculateDeltaB(targetPrice, currPrice, currLiquidity);
        remainingOut -= maxDeltaA;
        currPrice = targetPrice;
        currLiquidity -= tick.liquidity;
      } else {
        // Find price where deltaA is remainingOut
        // deltaA = L * (sqrt(P_high) - sqrt(P_low))
        // sqrt(P_low) = sqrt(P_high) - deltaA/L
        const sqrtPhigh = Math.sqrt(currPrice);
        const finalPrice = Math.pow(sqrtPhigh - remainingOut / currLiquidity, 2);
        
        totalIn += calculateDeltaB(finalPrice, currPrice, currLiquidity);
        remainingOut = 0;
        currPrice = finalPrice;
        break;
      }
    }
  }

  return {
    amountOut: amountOut - remainingOut,
    remainingIn: totalIn,
    finalPrice: currPrice,
    priceImpact: Math.abs((currPrice - initialPrice) / initialPrice) * 100
  };
}
