"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import type { ScoredStock } from "@/lib/stock-radar/types";
import type { ChartSeriesPayload } from "@/lib/stock-radar/chart-types";
import { formatPercent, formatPrice } from "@/lib/stock-radar/format";
import { QuoteSourceBadge } from "../QuoteSourceBadge";

interface ProChartProps {
  stock: ScoredStock | null;
}

export function ProChart({ stock }: ProChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [series, setSeries] = useState<ChartSeriesPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stock) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/stock-radar/chart?symbol=${stock.symbol}`)
      .then((res) => {
        if (!res.ok) throw new Error("K 線載入失敗");
        return res.json() as Promise<ChartSeriesPayload>;
      })
      .then((data) => {
        if (!cancelled) setSeries(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "載入失敗");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stock?.symbol]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !series) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    }

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "#0f172a" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#334155" },
      timeScale: { borderColor: "#334155", timeVisible: false },
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#22c55e",
      borderUpColor: "#ef4444",
      borderDownColor: "#22c55e",
      wickUpColor: "#ef4444",
      wickDownColor: "#22c55e",
    });

    candleSeries.setData(series.candles);

    const ma5 = chart.addSeries(LineSeries, {
      color: "#fbbf24",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ma5.setData(series.ma5);

    const ma20 = chart.addSeries(LineSeries, {
      color: "#60a5fa",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ma20.setData(series.ma20);

    const ma60 = chart.addSeries(LineSeries, {
      color: "#c084fc",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ma60.setData(series.ma60);

    chart.priceScale("").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.setData(series.volumes);

    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;

    const observer = new ResizeObserver(() => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [series]);

  if (!stock) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/80 text-slate-500">
        請從左側選擇股票
      </div>
    );
  }

  const isUp = stock.changePercent > 0;
  const isDown = stock.changePercent < 0;

  return (
    <section className="flex h-full min-h-0 flex-col rounded-xl border border-slate-700/60 bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              {stock.symbol}{" "}
              <span className="text-sm font-medium text-slate-400">
                {stock.name}
              </span>
            </h2>
            <QuoteSourceBadge source={stock.quoteSource} />
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <span className="text-xl font-bold tabular-nums text-white">
              {formatPrice(stock.closePrice)}
            </span>
            <span
              className={`font-semibold tabular-nums ${
                isUp ? "text-red-400" : isDown ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              {formatPercent(stock.changePercent)}
            </span>
            <span className="text-emerald-400">{stock.score} 分</span>
            {series && (
              <span className="text-[10px] text-slate-500">
                K線：{series.source === "finmind" ? "FinMind" : "Mock"}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-amber-400" /> MA5
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-blue-400" /> MA20
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-purple-400" /> MA60
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 text-sm text-slate-400">
            載入 K 線中…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-red-400">
            {error}
          </div>
        )}
        <div ref={containerRef} className="h-full w-full min-h-[320px]" />
      </div>
    </section>
  );
}
