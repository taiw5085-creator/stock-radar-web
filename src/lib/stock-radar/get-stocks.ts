import { scoreStock, sortByScore } from "./scoring";
import { fetchWatchlistRawStocks } from "./finmind";
import type { RadarStats, ScoredStock } from "./types";

/**
 * 股票資料取得層
 *
 * 資料來源：FinMind API（TaiwanStockPrice）
 * 之後可改為 Supabase (stock-radar-db) 每日快取
 */
export async function getScoredStocks(): Promise<ScoredStock[]> {
  try {
    const rawStocks = await fetchWatchlistRawStocks();
    const scored = rawStocks.map(scoreStock);
    return sortByScore(scored);
  } catch (error) {
    console.error("[getScoredStocks] FinMind 資料取得失敗:", error);
    return [];
  }
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

/** 轉為 API 輸出格式（stockId / volumeRatio / breakout 等） */
export function toStockRadarOutput(stock: ScoredStock) {
  return {
    stockId: stock.symbol,
    stockName: stock.name,
    score: stock.score,
    changePercent: stock.changePercent,
    volumeRatio: stock.volumeMultiplier,
    breakout: stock.brokeHigh20,
    bullishAlignment: stock.isBullishMA,
  };
}
