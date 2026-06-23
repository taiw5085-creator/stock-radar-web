import type { CategoryKey, ScoredStock, SpotlightTag } from "./types";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  all: "全部",
  top10: "TOP 10",
  breakout: "剛突破",
  volumeFirst: "量先出來",
  accumulation: "吸籌型",
  watchlist: "自選股",
};

/** 剛突破：突破 20 日高 + 量增 1.5 倍 */
export function isJustBreakout(stock: ScoredStock): boolean {
  return stock.brokeHigh20 && stock.conditions.volumeSurge;
}

/** 量先出來：量增但漲幅 0~3% 且未突破 */
export function isVolumeFirst(stock: ScoredStock): boolean {
  return (
    stock.conditions.volumeSurge &&
    stock.changePercent >= 0 &&
    stock.changePercent <= 3 &&
    !stock.brokeHigh20
  );
}

/** 吸籌觀察：橫盤 + 均量放大 + 未大漲（技術模擬） */
export function isAccumulation(stock: ScoredStock): boolean {
  return (
    stock.priceRange10Pct < 8 &&
    stock.volumeTrendUp &&
    stock.changePercent >= 0 &&
    stock.changePercent <= 3
  );
}

export function getSpotlightTags(stock: ScoredStock): SpotlightTag[] {
  const tags: SpotlightTag[] = [];
  if (isJustBreakout(stock)) tags.push("剛突破");
  if (isVolumeFirst(stock)) tags.push("量先出來");
  if (isAccumulation(stock)) tags.push("吸籌觀察");
  if (stock.liveBreakout && stock.quoteSource === "yahoo") tags.push("即時突破");
  if (stock.liveVolumeSurge && stock.quoteSource === "yahoo") tags.push("即時爆量");
  return tags;
}

export function getTopTen(stocks: ScoredStock[]): ScoredStock[] {
  return [...stocks].sort((a, b) => b.score - a.score).slice(0, 10);
}

export function filterByCategory(
  stocks: ScoredStock[],
  category: CategoryKey,
  watchlistSymbols: string[]
): ScoredStock[] {
  switch (category) {
    case "all":
      return stocks;
    case "top10":
      return getTopTen(stocks);
    case "breakout":
      return stocks.filter(isJustBreakout);
    case "volumeFirst":
      return stocks.filter(isVolumeFirst);
    case "accumulation":
      return stocks.filter(isAccumulation);
    case "watchlist":
      return stocks.filter((s) => watchlistSymbols.includes(s.symbol));
    default:
      return stocks;
  }
}
