import { getMockRawStocks } from "@/data/mock-stocks";
import { STOCK_WATCHLIST } from "@/data/stock-watchlist";
import { fetchWatchlistRawStocks } from "./finmind";
import { applyLiveQuote } from "./merge-live";
import { fetchYahooQuotesBatch } from "./yahoo";
import { scoreStock, sortByScore } from "./scoring";
import type { DataSourceMeta } from "./live-types";
import type { RadarStats, ScoredStock } from "./types";

function scoreFromRaw(
  rawStocks: ReturnType<typeof getMockRawStocks>
): ScoredStock[] {
  return sortByScore(rawStocks.map(scoreStock));
}

function buildMeta(
  historical: "finmind" | "mock",
  stocks: ScoredStock[]
): DataSourceMeta {
  const yahooCount = stocks.filter((s) => s.quoteSource === "yahoo").length;
  const finmindFallbackCount = stocks.filter(
    (s) => s.quoteSource === "finmind"
  ).length;
  const mockCount = stocks.filter((s) => s.quoteSource === "mock").length;

  let live: DataSourceMeta["live"] = "mock";
  if (historical === "finmind") {
    live = yahooCount > 0 ? "yahoo" : "finmind";
  }

  return {
    historical,
    live,
    yahooCount,
    finmindFallbackCount,
    mockCount,
    total: stocks.length,
  };
}

/**
 * 雙資料源取得層
 * - FinMind：歷史日K、均線、20日高/均量、飆股分數
 * - Yahoo：盤中即時價量（失敗 fallback FinMind）
 * - 全失敗：mock
 */
export async function getScoredStocks(): Promise<{
  stocks: ScoredStock[];
  meta: DataSourceMeta;
}> {
  const historicalSource: "finmind" | "mock" = "finmind";
  let rawStocks: Awaited<ReturnType<typeof fetchWatchlistRawStocks>> = [];

  try {
    rawStocks = await fetchWatchlistRawStocks();
  } catch (error) {
    console.error("[getScoredStocks] FinMind 失敗:", error);
  }

  if (rawStocks.length === 0) {
    console.warn("[getScoredStocks] 使用 mock fallback");
    const mockScored = scoreFromRaw(getMockRawStocks()).map((s) =>
      applyLiveQuote(s, null, "mock")
    );
    return {
      stocks: mockScored,
      meta: {
        historical: "mock",
        live: "mock",
        yahooCount: 0,
        finmindFallbackCount: 0,
        mockCount: mockScored.length,
        total: mockScored.length,
      },
    };
  }

  const scored = sortByScore(rawStocks.map(scoreStock));
  const yahooQuotes = await fetchYahooQuotesBatch(STOCK_WATCHLIST);

  const withLive = scored.map((stock) =>
    applyLiveQuote(
      stock,
      yahooQuotes.get(stock.symbol) ?? null,
      historicalSource
    )
  );

  return {
    stocks: withLive,
    meta: buildMeta(historicalSource, withLive),
  };
}

/** 僅更新即時報價（供 API / client 輪詢） */
export async function fetchLiveQuotesForSymbols(symbols: string[]) {
  return fetchYahooQuotesBatch(symbols);
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
    liveBreakout: stock.liveBreakout,
    bullishAlignment: stock.isBullishMA,
    quoteSource: stock.quoteSource,
  };
}
