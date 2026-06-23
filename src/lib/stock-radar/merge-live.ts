import type { ScoredStock } from "./types";
import type { LiveQuote } from "./live-types";

const VOLUME_SURGE_RATIO = 1.5;

/**
 * 將 Yahoo 即時報價疊加到已評分股票（不修改分數與 conditions）
 * Yahoo 失敗時維持 FinMind 歷史收盤資料
 */
export function applyLiveQuote(
  stock: ScoredStock,
  live: LiveQuote | null,
  historicalSource: "finmind" | "mock"
): ScoredStock {
  if (historicalSource === "mock") {
    return {
      ...stock,
      todayHigh: stock.closePrice,
      quoteSource: "mock",
      liveBreakout: stock.brokeHigh20,
      liveVolumeSurge: stock.conditions.volumeSurge,
    };
  }

  if (!live) {
    return {
      ...stock,
      todayHigh: stock.closePrice,
      quoteSource: "finmind",
      liveBreakout: stock.closePrice > stock.high20,
      liveVolumeSurge:
        stock.volume > stock.avgVolume20 * VOLUME_SURGE_RATIO,
    };
  }

  const liveBreakout = live.price > stock.high20;
  const liveVolumeSurge =
    live.volume > stock.avgVolume20 * VOLUME_SURGE_RATIO;

  return {
    ...stock,
    closePrice: live.price,
    volume: live.volume,
    changePercent: live.changePercent,
    todayHigh: live.todayHigh,
    quoteSource: "yahoo",
    volumeMultiplier:
      stock.avgVolume20 > 0 ? live.volume / stock.avgVolume20 : 0,
    volumeVsYesterday:
      stock.yesterdayVolume > 0 ? live.volume / stock.yesterdayVolume : 0,
    liveBreakout,
    liveVolumeSurge,
  };
}

/** 供 client 端盤中輪詢合併 */
export function mergeLiveIntoScored(
  stock: ScoredStock,
  live: LiveQuote
): ScoredStock {
  return applyLiveQuote(stock, live, "finmind");
}
