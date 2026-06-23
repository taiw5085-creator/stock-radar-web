/**
 * 台股飆股雷達 — 型別定義（v2 + 雙資料源）
 */

import type { QuoteSource } from "./live-types";

export type { QuoteSource, DataSourceMeta, LiveQuote, QuotesApiResponse } from "./live-types";

/** 原始行情 + 籌碼資料（FinMind） */
export interface RawStockData {
  symbol: string;
  name: string;
  closePrice: number;
  changePercent: number;
  volume: number;
  yesterdayVolume: number;
  avgVolume20: number;
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  high20: number;
  /** 外資今日買賣超（股） */
  foreignNetToday: number;
  /** 投信今日買賣超（股） */
  trustNetToday: number;
  /** 外資連買天數 */
  foreignConsecutiveBuyDays: number;
  /** 投信連買天數 */
  trustConsecutiveBuyDays: number;
  /** 近 10 日橫盤後突破 */
  consolidationBreakout: boolean;
  /** 近 10 日股價震盪幅度（%） */
  priceRange10Pct: number;
  /** 近 10 日均量是否逐漸放大 */
  volumeTrendUp: boolean;
}

/** v1 四項飆股條件 */
export interface StockConditions {
  volumeSurge: boolean;
  breakoutHigh20: boolean;
  bullishMA: boolean;
  strongGain: boolean;
}

/** 單項計分 */
export interface ScoreBreakdownItem {
  id: string;
  category: "v1" | "chip" | "volume" | "breakout" | "ma";
  label: string;
  points: number;
  maxPoints: number;
  met: boolean;
  detail: string;
}

/** 分數細項與排序用子分數 */
export interface ScoreBreakdown {
  items: ScoreBreakdownItem[];
  total: number;
  sortScores: {
    momentum: number;
    chip: number;
    volumeBreakout: number;
    readyRise: number;
  };
}

export type SortMode = "momentum" | "chip" | "volumeBreakout" | "readyRise";

/** 首頁分類篩選 */
export type CategoryKey =
  | "all"
  | "top10"
  | "breakout"
  | "volumeFirst"
  | "accumulation"
  | "watchlist";

/** Pro 桌面版分類 */
export type ProCategoryKey =
  | "top10"
  | "breakout"
  | "volumeNotSpiked"
  | "accumulation";

/** 分類標籤（不影響評分） */
export type SpotlightTag =
  | "剛突破"
  | "量先出來"
  | "吸籌觀察"
  | "即時突破"
  | "即時爆量";

/** 計分後的完整股票資料 */
export interface ScoredStock extends RawStockData {
  volumeMultiplier: number;
  volumeVsYesterday: number;
  brokeHigh20: boolean;
  isBullishMA: boolean;
  isMaStructure: boolean;
  conditions: StockConditions;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  label: StockLabel;
  /** 今日最高價（Yahoo 即時） */
  todayHigh: number;
  /** 即時報價來源 */
  quoteSource: QuoteSource;
  /** 即時價突破 20 日高（Yahoo 價 vs FinMind 高點） */
  liveBreakout: boolean;
  /** 即時量增（Yahoo 量 vs FinMind 20 日均量） */
  liveVolumeSurge: boolean;
}

export type StockLabel =
  | "強勢飆股候選"
  | "觀察突破"
  | "條件普通"
  | "暫不追蹤";

export interface RadarStats {
  highScoreCount: number;
  topStock: { symbol: string; name: string; score: number } | null;
  avgVolumeMultiplier: number;
}
