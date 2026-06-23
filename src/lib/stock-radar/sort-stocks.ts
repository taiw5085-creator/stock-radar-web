import type { ScoredStock, SortMode } from "./types";

const SORT_KEY: Record<SortMode, keyof ScoredStock["scoreBreakdown"]["sortScores"]> = {
  momentum: "momentum",
  chip: "chip",
  volumeBreakout: "volumeBreakout",
  readyRise: "readyRise",
};

export const SORT_MODE_LABELS: Record<SortMode, string> = {
  momentum: "最強飆股",
  chip: "主力卡位",
  volumeBreakout: "爆量突破",
  readyRise: "準備起漲",
};

export function sortStocks(stocks: ScoredStock[], mode: SortMode): ScoredStock[] {
  const key = SORT_KEY[mode];
  return [...stocks].sort((a, b) => {
    const diff = b.scoreBreakdown.sortScores[key] - a.scoreBreakdown.sortScores[key];
    return diff !== 0 ? diff : b.score - a.score;
  });
}

export function getTopStocks(stocks: ScoredStock[], count = 3): ScoredStock[] {
  return sortStocks(stocks, "momentum").slice(0, count);
}
