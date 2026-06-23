import { STOCK_WATCHLIST } from "@/data/stock-watchlist";
import { buildFinMindAuthHeader } from "./finmind-auth";
import type { RawStockData } from "./types";

const FINMIND_API = "https://api.finmindtrade.com/api/v4/data";
const LOOKBACK_CALENDAR_DAYS = 60;

interface FinMindResponse<T> {
  msg: string;
  status: number;
  data: T[];
}

interface TaiwanStockPriceRow {
  date: string;
  stock_id: string;
  Trading_Volume: number;
  open: number;
  max: number;
  min: number;
  close: number;
  spread: number;
}

interface TaiwanStockInfoRow {
  stock_id: string;
  stock_name: string;
}

/** FinMind 評分輸出格式（供 API 層對照） */
export interface StockRadarApiOutput {
  stockId: string;
  stockName: string;
  score: number;
  changePercent: number;
  volumeRatio: number;
  breakout: boolean;
  bullishAlignment: boolean;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - LOOKBACK_CALENDAR_DAYS);
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

async function finmindFetch<T>(
  params: Record<string, string>
): Promise<T[]> {
  const url = new URL(FINMIND_API);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: buildFinMindAuthHeader(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FinMind API 錯誤：${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as FinMindResponse<T>;
  if (json.status !== 200 || json.msg !== "success") {
    throw new Error(`FinMind API 回傳失敗：${json.msg}`);
  }

  return json.data ?? [];
}

/** 取得台股代號對名稱對照表 */
export async function fetchStockNameMap(): Promise<Map<string, string>> {
  const rows = await finmindFetch<TaiwanStockInfoRow>({
    dataset: "TaiwanStockInfo",
  });

  const map = new Map<string, string>();
  for (const row of rows) {
    map.set(row.stock_id, row.stock_name);
  }
  return map;
}

/** 取得單一股票日 K（含成交量、收盤價） */
export async function fetchStockPrices(
  stockId: string
): Promise<TaiwanStockPriceRow[]> {
  const { startDate, endDate } = getDateRange();
  const rows = await finmindFetch<TaiwanStockPriceRow>({
    dataset: "TaiwanStockPrice",
    data_id: stockId,
    start_date: startDate,
    end_date: endDate,
  });

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** 由 FinMind 日 K 計算 RawStockData 所需欄位 */
export function mapPricesToRawStock(
  stockId: string,
  stockName: string,
  rows: TaiwanStockPriceRow[]
): RawStockData | null {
  if (rows.length < 21) return null;

  const today = rows[rows.length - 1];
  const prior20 = rows.slice(-21, -1);
  const prevClose = rows[rows.length - 2]?.close ?? today.close - today.spread;

  const avgVolume20 = average(prior20.map((r) => r.Trading_Volume));
  const high20 = Math.max(...prior20.map((r) => r.max));
  const recentCloses = rows.map((r) => r.close);

  const ma5 = average(recentCloses.slice(-5));
  const ma10 = average(recentCloses.slice(-10));
  const ma20 = average(recentCloses.slice(-20));

  const changePercent =
    prevClose > 0 ? ((today.close - prevClose) / prevClose) * 100 : 0;

  return {
    symbol: stockId,
    name: stockName,
    closePrice: today.close,
    changePercent,
    volume: today.Trading_Volume,
    avgVolume20,
    ma5,
    ma10,
    ma20,
    high20,
  };
}

/** 批次抓取追蹤清單並轉為 RawStockData */
export async function fetchWatchlistRawStocks(): Promise<RawStockData[]> {
  const nameMap = await fetchStockNameMap();

  const results = await Promise.all(
    STOCK_WATCHLIST.map(async (stockId) => {
      try {
        const prices = await fetchStockPrices(stockId);
        const stockName = nameMap.get(stockId) ?? stockId;
        return mapPricesToRawStock(stockId, stockName, prices);
      } catch (error) {
        console.error(`[FinMind] 抓取 ${stockId} 失敗:`, error);
        return null;
      }
    })
  );

  return results.filter((item): item is RawStockData => item !== null);
}
