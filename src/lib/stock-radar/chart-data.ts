import { fetchStockPrices } from "./finmind";
import type {
  ChartCandle,
  ChartMaLine,
  ChartSeriesPayload,
  ChartVolumeBar,
} from "./chart-types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function buildMaLine(
  candles: ChartCandle[],
  period: number
): ChartMaLine[] {
  const lines: ChartMaLine[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    lines.push({
      time: candles[i].time,
      value: average(slice.map((c) => c.close)),
    });
  }
  return lines;
}

function mapRowsToCandles(
  rows: Awaited<ReturnType<typeof fetchStockPrices>>
): ChartCandle[] {
  return rows.map((row) => ({
    time: row.date,
    open: row.open,
    high: row.max,
    low: row.min,
    close: row.close,
  }));
}

function mapVolumes(candles: ChartCandle[], rows: Awaited<ReturnType<typeof fetchStockPrices>>): ChartVolumeBar[] {
  return rows.map((row, i) => {
    const candle = candles[i];
    const up = candle && candle.close >= candle.open;
    return {
      time: row.date,
      value: row.Trading_Volume,
      color: up ? "#ef444488" : "#22c55e88",
    };
  });
}

/** 產生 mock K 線（FinMind 失敗時） */
function buildMockChart(symbol: string): ChartSeriesPayload {
  const candles: ChartCandle[] = [];
  const base = 500 + (parseInt(symbol, 10) % 100) * 2;
  let price = base;

  for (let i = 60; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const time = date.toISOString().slice(0, 10);
    const change = (Math.random() - 0.48) * 8;
    const open = price;
    const close = Math.max(10, open + change);
    const high = Math.max(open, close) + Math.random() * 4;
    const low = Math.min(open, close) - Math.random() * 4;
    candles.push({ time, open, high, low, close });
    price = close;
  }

  const volumes: ChartVolumeBar[] = candles.map((c) => ({
    time: c.time,
    value: Math.floor(800_000 + Math.random() * 2_000_000),
    color: c.close >= c.open ? "#ef444488" : "#22c55e88",
  }));

  return {
    symbol,
    candles,
    volumes,
    ma5: buildMaLine(candles, 5),
    ma20: buildMaLine(candles, 20),
    ma60: buildMaLine(candles, 60),
    source: "mock",
  };
}

export async function fetchChartSeries(symbol: string): Promise<ChartSeriesPayload> {
  try {
    const rows = await fetchStockPrices(symbol);
    if (rows.length < 20) {
      return buildMockChart(symbol);
    }

    const candles = mapRowsToCandles(rows);
    return {
      symbol,
      candles,
      volumes: mapVolumes(candles, rows),
      ma5: buildMaLine(candles, 5),
      ma20: buildMaLine(candles, 20),
      ma60: buildMaLine(candles, 60),
      source: "finmind",
    };
  } catch (error) {
    console.error(`[chart-data] ${symbol} 失敗:`, error);
    return buildMockChart(symbol);
  }
}
