import { STOCK_WATCHLIST } from "@/data/stock-watchlist";
import { buildFinMindAuthHeader } from "./finmind-auth";
import type { RawStockData } from "./types";

const FINMIND_API = "https://api.finmindtrade.com/api/v4/data";
const LOOKBACK_CALENDAR_DAYS = 120;
const CONSOLIDATION_DAYS = 10;
const CONSOLIDATION_RANGE_PCT = 8;

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

interface InstitutionalWideRow {
  date: string;
  stock_id: string;
  Foreign_Investor_buy: number;
  Foreign_Investor_sell: number;
  Investment_Trust_buy: number;
  Investment_Trust_sell: number;
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

async function finmindFetch<T>(params: Record<string, string>): Promise<T[]> {
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

export async function fetchInstitutionalWide(
  stockId: string
): Promise<InstitutionalWideRow[]> {
  const { startDate, endDate } = getDateRange();
  const rows = await finmindFetch<InstitutionalWideRow>({
    dataset: "TaiwanStockInstitutionalInvestorsBuySellWide",
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

function countConsecutiveBuyDays(nets: number[]): number {
  let count = 0;
  for (let i = nets.length - 1; i >= 0; i--) {
    if (nets[i] > 0) count++;
    else break;
  }
  return count;
}

/** 近 10 日橫盤後突破：10 日振幅 ≤ 8%，且今日收盤突破 10 日高 */
export function detectConsolidationBreakout(
  rows: TaiwanStockPriceRow[]
): boolean {
  if (rows.length < CONSOLIDATION_DAYS + 1) return false;

  const today = rows[rows.length - 1];
  const prior10 = rows.slice(-(CONSOLIDATION_DAYS + 1), -1);
  const high10 = Math.max(...prior10.map((r) => r.max));
  const low10 = Math.min(...prior10.map((r) => r.min));
  const avgClose = average(prior10.map((r) => r.close));

  if (avgClose <= 0) return false;

  const rangePct = ((high10 - low10) / avgClose) * 100;
  const isSideways = rangePct <= CONSOLIDATION_RANGE_PCT;
  const isBreakout = today.close > high10;

  return isSideways && isBreakout;
}

function calcPriceRange10Pct(rows: TaiwanStockPriceRow[]): number {
  if (rows.length < 10) return 100;
  const recent10 = rows.slice(-10);
  const high = Math.max(...recent10.map((r) => r.max));
  const low = Math.min(...recent10.map((r) => r.min));
  const avgClose = average(recent10.map((r) => r.close));
  return avgClose > 0 ? ((high - low) / avgClose) * 100 : 100;
}

/** 近 10 日後半段均量 > 前半段均量 */
function calcVolumeTrendUp(rows: TaiwanStockPriceRow[]): boolean {
  if (rows.length < 10) return false;
  const recent10 = rows.slice(-10).map((r) => r.Trading_Volume);
  const firstHalf = average(recent10.slice(0, 5));
  const secondHalf = average(recent10.slice(5, 10));
  return secondHalf > firstHalf;
}

function mapInstitutional(rows: InstitutionalWideRow[]) {
  const foreignNets = rows.map(
    (r) => r.Foreign_Investor_buy - r.Foreign_Investor_sell
  );
  const trustNets = rows.map(
    (r) => r.Investment_Trust_buy - r.Investment_Trust_sell
  );

  return {
    foreignNetToday: foreignNets[foreignNets.length - 1] ?? 0,
    trustNetToday: trustNets[trustNets.length - 1] ?? 0,
    foreignConsecutiveBuyDays: countConsecutiveBuyDays(foreignNets),
    trustConsecutiveBuyDays: countConsecutiveBuyDays(trustNets),
  };
}

export function mapToRawStock(
  stockId: string,
  stockName: string,
  prices: TaiwanStockPriceRow[],
  institutional: InstitutionalWideRow[]
): RawStockData | null {
  if (prices.length < 61) return null;

  const today = prices[prices.length - 1];
  const yesterday = prices[prices.length - 2];
  const prior20 = prices.slice(-21, -1);
  const prevClose = yesterday?.close ?? today.close - today.spread;
  const recentCloses = prices.map((r) => r.close);
  const chip = mapInstitutional(institutional);

  return {
    symbol: stockId,
    name: stockName,
    closePrice: today.close,
    changePercent:
      prevClose > 0 ? ((today.close - prevClose) / prevClose) * 100 : 0,
    volume: today.Trading_Volume,
    yesterdayVolume: yesterday?.Trading_Volume ?? 0,
    avgVolume20: average(prior20.map((r) => r.Trading_Volume)),
    ma5: average(recentCloses.slice(-5)),
    ma10: average(recentCloses.slice(-10)),
    ma20: average(recentCloses.slice(-20)),
    ma60: average(recentCloses.slice(-60)),
    high20: Math.max(...prior20.map((r) => r.max)),
    consolidationBreakout: detectConsolidationBreakout(prices),
    priceRange10Pct: calcPriceRange10Pct(prices),
    volumeTrendUp: calcVolumeTrendUp(prices),
    ...chip,
  };
}

export async function fetchWatchlistRawStocks(): Promise<RawStockData[]> {
  const nameMap = await fetchStockNameMap();

  const results = await Promise.all(
    STOCK_WATCHLIST.map(async (stockId) => {
      try {
        const [prices, institutional] = await Promise.all([
          fetchStockPrices(stockId),
          fetchInstitutionalWide(stockId),
        ]);
        const stockName = nameMap.get(stockId) ?? stockId;
        return mapToRawStock(stockId, stockName, prices, institutional);
      } catch (error) {
        console.error(`[FinMind] 抓取 ${stockId} 失敗:`, error);
        return null;
      }
    })
  );

  return results.filter((item): item is RawStockData => item !== null);
}

// 保留舊函式名稱供測試
export const mapPricesToRawStock = mapToRawStock;
