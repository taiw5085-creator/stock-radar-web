import type { ScoredStock } from "./types";
import { formatPercent } from "./format";

export type LiveSignalType =
  | "liveBreakout"
  | "liveVolumeSurge"
  | "breakout"
  | "volumeNotSpiked"
  | "accumulation";

export interface LiveSignal {
  id: string;
  symbol: string;
  name: string;
  type: LiveSignalType;
  message: string;
  changePercent: number;
  score: number;
  timestamp: string;
}

const SIGNAL_LABELS: Record<LiveSignalType, string> = {
  liveBreakout: "即時突破",
  liveVolumeSurge: "即時爆量",
  breakout: "剛突破",
  volumeNotSpiked: "爆量未噴",
  accumulation: "吸籌型",
};

export function getSignalLabel(type: LiveSignalType): string {
  return SIGNAL_LABELS[type];
}

export function buildLiveSignals(stocks: ScoredStock[]): LiveSignal[] {
  const now = new Date().toISOString();
  const signals: LiveSignal[] = [];

  for (const stock of stocks) {
    if (stock.liveBreakout && stock.quoteSource === "yahoo") {
      signals.push({
        id: `${stock.symbol}-liveBreakout`,
        symbol: stock.symbol,
        name: stock.name,
        type: "liveBreakout",
        message: `${stock.symbol} 即時價突破 20 日高，漲幅 ${formatPercent(stock.changePercent)}`,
        changePercent: stock.changePercent,
        score: stock.score,
        timestamp: now,
      });
    }
    if (stock.liveVolumeSurge && stock.quoteSource === "yahoo") {
      signals.push({
        id: `${stock.symbol}-liveVolumeSurge`,
        symbol: stock.symbol,
        name: stock.name,
        type: "liveVolumeSurge",
        message: `${stock.symbol} 即時爆量 ${stock.volumeMultiplier.toFixed(1)}x`,
        changePercent: stock.changePercent,
        score: stock.score,
        timestamp: now,
      });
    }
    if (stock.brokeHigh20 && stock.conditions.volumeSurge) {
      signals.push({
        id: `${stock.symbol}-breakout`,
        symbol: stock.symbol,
        name: stock.name,
        type: "breakout",
        message: `${stock.symbol} 突破 20 日高 + 量增`,
        changePercent: stock.changePercent,
        score: stock.score,
        timestamp: now,
      });
    }
  }

  return signals.sort((a, b) => b.score - a.score);
}
