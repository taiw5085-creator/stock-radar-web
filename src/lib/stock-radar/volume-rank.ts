import type { ScoredStock } from "./types";

/** 依即時成交量排序取 TOP N */
export function getTopVolumeStocks(
  stocks: ScoredStock[],
  limit = 6
): ScoredStock[] {
  return [...stocks].sort((a, b) => b.volume - a.volume).slice(0, limit);
}
