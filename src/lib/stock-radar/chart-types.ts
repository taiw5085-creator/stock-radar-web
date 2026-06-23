/** K 線圖資料型別（Lightweight Charts） */

export interface ChartCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ChartVolumeBar {
  time: string;
  value: number;
  color?: string;
}

export interface ChartMaLine {
  time: string;
  value: number;
}

export interface ChartSeriesPayload {
  symbol: string;
  candles: ChartCandle[];
  volumes: ChartVolumeBar[];
  ma5: ChartMaLine[];
  ma20: ChartMaLine[];
  ma60: ChartMaLine[];
  source: "finmind" | "mock";
}
