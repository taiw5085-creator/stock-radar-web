import { fetchStockPrices } from "./finmind";
import {
  TAIEX_DISPLAY_NAME,
  TAIEX_FINMIND_ID,
} from "./index-constants";
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

function buildMaLine(candles: ChartCandle[], period: number): ChartMaLine[] {
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

function buildMockIndexChart(): ChartSeriesPayload {
  const candles: ChartCandle[] = [];
  let price = 21800;

  for (let i = 60; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const time = date.toISOString().slice(0, 10);
    const change = (Math.random() - 0.48) * 80;
    const open = price;
    const close = Math.max(15000, open + change);
    const high = Math.max(open, close) + Math.random() * 40;
    const low = Math.min(open, close) - Math.random() * 40;
    candles.push({ time, open, high, low, close });
    price = close;
  }

  const volumes: ChartVolumeBar[] = candles.map((c) => ({
    time: c.time,
    value: Math.floor(150_000_000_000 + Math.random() * 80_000_000_000),
    color: c.close >= c.open ? "#ef444488" : "#22c55e88",
  }));

  return {
    symbol: TAIEX_FINMIND_ID,
    name: TAIEX_DISPLAY_NAME,
    candles,
    volumes,
    ma5: buildMaLine(candles, 5),
    ma20: buildMaLine(candles, 20),
    ma60: buildMaLine(candles, 60),
    source: "mock",
  };
}

/** FinMind TAIEX 歷史 K 線（失敗 fallback mock） */
export async function fetchIndexChartSeries(): Promise<ChartSeriesPayload> {
  try {
    const rows = await fetchStockPrices(TAIEX_FINMIND_ID);
    if (rows.length < 20) return buildMockIndexChart();

    const candles: ChartCandle[] = rows.map((row) => ({
      time: row.date,
      open: row.open,
      high: row.max,
      low: row.min,
      close: row.close,
    }));

    const volumes: ChartVolumeBar[] = rows.map((row, i) => {
      const candle = candles[i];
      const up = candle && candle.close >= candle.open;
      return {
        time: row.date,
        value: row.Trading_Volume,
        color: up ? "#ef444488" : "#22c55e88",
      };
    });

    return {
      symbol: TAIEX_FINMIND_ID,
      name: TAIEX_DISPLAY_NAME,
      candles,
      volumes,
      ma5: buildMaLine(candles, 5),
      ma20: buildMaLine(candles, 20),
      ma60: buildMaLine(candles, 60),
      source: "finmind",
    };
  } catch (error) {
    console.error("[index-chart] FinMind TAIEX 失敗:", error);
    return buildMockIndexChart();
  }
}
