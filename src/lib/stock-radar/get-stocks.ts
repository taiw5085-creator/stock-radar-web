import { mockStocks } from "@/data/mock-stocks";
import { scoreStock, sortByScore } from "./scoring";
import type { RadarStats, ScoredStock } from "./types";

/**
 * 股票資料取得層
 *
 * 第一階段：使用 mock data
 * 第二階段：改為 fetch 台股 API
 * 第三階段：改為從 Supabase (stock-radar-db) 讀取每日快取
 */
export async function getScoredStocks(): Promise<ScoredStock[]> {
  // TODO: 替換為正式 API / Supabase 查詢
  const scored = mockStocks.map(scoreStock);
  return sortByScore(scored);
}

export function buildRadarStats(stocks: ScoredStock[]): RadarStats {
  const highScoreCount = stocks.filter((s) => s.score >= 75).length;

  const topStock =
    stocks.length > 0
      ? {
          symbol: stocks[0].symbol,
          name: stocks[0].name,
          score: stocks[0].score,
        }
      : null;

  const avgVolumeMultiplier =
    stocks.length > 0
      ? stocks.reduce((sum, s) => sum + s.volumeMultiplier, 0) / stocks.length
      : 0;

  return { highScoreCount, topStock, avgVolumeMultiplier };
}
