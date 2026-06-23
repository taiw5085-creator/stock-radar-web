import {
  filterByCategory,
  getTopTen,
  isAccumulation,
  isJustBreakout,
} from "./categories";
import type { ProCategoryKey, ScoredStock } from "./types";

export const PRO_CATEGORY_LABELS: Record<ProCategoryKey, string> = {
  top10: "TOP 10",
  breakout: "剛突破",
  volumeNotSpiked: "爆量未噴",
  accumulation: "吸籌型",
};

/** 爆量未噴：量能放大但漲幅 ≤ 3% 且未突破 20 日高 */
export function isVolumeNotSpiked(stock: ScoredStock): boolean {
  return (
    stock.conditions.volumeSurge &&
    stock.changePercent >= 0 &&
    stock.changePercent <= 3 &&
    !stock.brokeHigh20
  );
}

export function filterByProCategory(
  stocks: ScoredStock[],
  category: ProCategoryKey
): ScoredStock[] {
  switch (category) {
    case "top10":
      return getTopTen(stocks);
    case "breakout":
      return stocks.filter(isJustBreakout);
    case "volumeNotSpiked":
      return stocks.filter(isVolumeNotSpiked);
    case "accumulation":
      return stocks.filter(isAccumulation);
    default:
      return stocks;
  }
}

export function filterProWithWatchlist(
  stocks: ScoredStock[],
  category: ProCategoryKey,
  watchlistSymbols: string[]
): ScoredStock[] {
  const filtered = filterByProCategory(stocks, category);
  if (watchlistSymbols.length === 0) return filtered;
  return filtered;
}

/** 自選股排序：自選優先 */
export function sortWatchlistFirst(
  stocks: ScoredStock[],
  watchlistSymbols: string[]
): ScoredStock[] {
  if (watchlistSymbols.length === 0) return stocks;
  const watchSet = new Set(watchlistSymbols);
  return [...stocks].sort((a, b) => {
    const aW = watchSet.has(a.symbol) ? 0 : 1;
    const bW = watchSet.has(b.symbol) ? 0 : 1;
    if (aW !== bW) return aW - bW;
    return b.score - a.score;
  });
}

export { filterByCategory, getTopTen, isJustBreakout, isAccumulation };
