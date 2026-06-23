import { getMockRawStocks } from "@/data/mock-stocks";
import { scoreStock, sortByScore } from "./scoring";
import { fetchWatchlistRawStocks } from "./finmind";
import type { RadarStats, ScoredStock } from "./types";

export type DataSource = "finmind" | "mock";

function scoreFromRaw(rawStocks: ReturnType<typeof getMockRawStocks>): ScoredStock[] {
  return sortByScore(rawStocks.map(scoreStock));
}

/**
 * 股票資料取得層
 * API 失敗或無資料時 fallback 至 mock
 */
export async function getScoredStocks(): Promise<{
  stocks: ScoredStock[];
  source: DataSource;
}> {
  try {
    const rawStocks = await fetchWatchlistRawStocks();
    if (rawStocks.length === 0) {
      console.warn("[getScoredStocks] FinMind 無資料，使用 mock fallback");
      return { stocks: scoreFromRaw(getMockRawStocks()), source: "mock" };
    }
    return {
      stocks: sortByScore(rawStocks.map(scoreStock)),
      source: "finmind",
    };
  } catch (error) {
    console.error("[getScoredStocks] FinMind 失敗，使用 mock fallback:", error);
    return { stocks: scoreFromRaw(getMockRawStocks()), source: "mock" };
  }
}

export function buildRadarStats(stocks: ScoredStock[]): RadarStats {
  const highScoreCount = stocks.filter((s) => s.score >= 130).length;

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
