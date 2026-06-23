/** 盤中即時報價（Yahoo Finance） */
export interface LiveQuote {
  symbol: string;
  price: number;
  volume: number;
  changePercent: number;
  todayHigh: number;
  previousClose: number;
}

export type QuoteSource = "yahoo" | "finmind" | "mock";

/** 頁面資料來源摘要 */
export interface DataSourceMeta {
  /** 歷史資料來源（評分用） */
  historical: "finmind" | "mock";
  /** 即時資料主要來源 */
  live: "yahoo" | "finmind" | "mock";
  yahooCount: number;
  finmindFallbackCount: number;
  mockCount: number;
  total: number;
}
