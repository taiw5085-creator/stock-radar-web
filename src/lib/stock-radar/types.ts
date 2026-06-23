/**
 * 台股飆股雷達 — 型別定義
 *
 * 之後串接正式 API / Supabase 時，可讓 API 回傳 RawStockData，
 * 再由 scoring 模組計算分數與標籤。
 */

/** 原始行情資料（來自 mock 或未來 API） */
export interface RawStockData {
  symbol: string;
  name: string;
  closePrice: number;
  changePercent: number;
  volume: number;
  avgVolume20: number;
  ma5: number;
  ma10: number;
  ma20: number;
  high20: number;
}

/** 四項飆股條件是否成立 */
export interface StockConditions {
  /** 今日成交量 > 20 日均量 × 1.5 */
  volumeSurge: boolean;
  /** 收盤價 > 最近 20 日高點 */
  breakoutHigh20: boolean;
  /** 收盤價 > 5 日線 > 10 日線 > 20 日線 */
  bullishMA: boolean;
  /** 今日漲幅 > 3% */
  strongGain: boolean;
}

/** 計分後的完整股票資料 */
export interface ScoredStock extends RawStockData {
  volumeMultiplier: number;
  brokeHigh20: boolean;
  isBullishMA: boolean;
  conditions: StockConditions;
  score: number;
  label: StockLabel;
}

export type StockLabel =
  | "強勢飆股候選"
  | "觀察突破"
  | "條件普通"
  | "暫不追蹤";

/** 頁面頂部統計卡片資料 */
export interface RadarStats {
  highScoreCount: number;
  topStock: { symbol: string; name: string; score: number } | null;
  avgVolumeMultiplier: number;
}
