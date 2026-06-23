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
} from "lightweight-charts";
import type { ScoredStock } from "@/lib/stock-radar/types";
import type { IndexQuote } from "@/lib/stock-radar/index-types";
import type { LiveFlashField } from "@/lib/stock-radar/live-flash";
import type { ChartSeriesPayload } from "@/lib/stock-radar/chart-types";
import {
  formatChangePoints,
  formatPercent,
  formatPrice,
  formatVolume,
} from "@/lib/stock-radar/format";
import { QuoteSourceBadge } from "../QuoteSourceBadge";
import { LiveFlashSpan } from "./LiveFlashSpan";

export type ProMainViewMode = "index" | "stock";

interface ProChartProps {
  viewMode: ProMainViewMode;
  stock: ScoredStock | null;
  indexQuote: IndexQuote | null;
  onBackToIndex: () => void;
  isFlashing: (symbol: string, field: LiveFlashField) => boolean;
  indexFlashing: (field: LiveFlashField) => boolean;
}

function useChartSeries(viewMode: ProMainViewMode, stockSymbol: string | undefined) {
  const [series, setSeries] = useState<ChartSeriesPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSeries(null);

    const url =
      viewMode === "index"
        ? "/api/stock-radar/index/chart"
        : `/api/stock-radar/chart?symbol=${stockSymbol}`;

    if (viewMode === "stock" && !stockSymbol) {
      setLoading(false);
      return;
    }

    fetch(url)
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
  }, [viewMode, stockSymbol]);

  return { series, loading, error };
}

function ChartCanvas({ series }: { series: ChartSeriesPayload }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !series) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
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

    for (const [data, color] of [
      [series.ma5, "#fbbf24"],
      [series.ma20, "#60a5fa"],
      [series.ma60, "#c084fc"],
    ] as const) {
      const line = chart.addSeries(LineSeries, {
        color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      line.setData(data);
    }

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

  return <div ref={containerRef} className="h-full w-full min-h-[320px]" />;
}

export function ProChart({
  viewMode,
  stock,
  indexQuote,
  onBackToIndex,
  isFlashing,
  indexFlashing,
}: ProChartProps) {
  const { series, loading, error } = useChartSeries(
    viewMode,
    stock?.symbol
  );

  const isIndex = viewMode === "index";

  if (isIndex && !indexQuote) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/80 text-slate-500">
        載入加權指數中…
      </div>
    );
  }

  if (!isIndex && !stock) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/80 text-slate-500">
        請從左側雷達清單選擇股票
      </div>
    );
  }

  const isUp = isIndex
    ? (indexQuote?.changePercent ?? 0) > 0
    : (stock?.changePercent ?? 0) > 0;
  const isDown = isIndex
    ? (indexQuote?.changePercent ?? 0) < 0
    : (stock?.changePercent ?? 0) < 0;

  return (
    <section className="flex h-full min-h-0 flex-col rounded-xl border border-slate-700/60 bg-slate-900/80">
      <div className="flex items-start justify-between border-b border-slate-700/60 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              {isIndex ? (
                "加權指數"
              ) : (
                <>
                  {stock!.symbol}{" "}
                  <span className="text-sm font-medium text-slate-400">
                    {stock!.name}
                  </span>
                </>
              )}
            </h2>
            {isIndex ? (
              indexQuote && (
                <QuoteSourceBadge source={indexQuote.quoteSource} />
              )
            ) : (
              stock && <QuoteSourceBadge source={stock.quoteSource} />
            )}
            {!isIndex && (
              <button
                type="button"
                onClick={onBackToIndex}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                回到大盤
              </button>
            )}
          </div>

          {isIndex && indexQuote ? (
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
              <div>
                <span className="text-[10px] text-slate-500">即時指數</span>
                <LiveFlashSpan
                  active={indexFlashing("price")}
                  className="block text-xl font-bold text-white"
                >
                  {formatPrice(indexQuote.price)}
                </LiveFlashSpan>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">漲跌點數</span>
                <LiveFlashSpan
                  active={indexFlashing("changePercent")}
                  className={`block font-semibold tabular-nums ${
                    isUp ? "text-red-400" : isDown ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {formatChangePoints(indexQuote.changePoints)}
                </LiveFlashSpan>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">漲跌幅</span>
                <LiveFlashSpan
                  active={indexFlashing("changePercent")}
                  className={`block font-semibold tabular-nums ${
                    isUp ? "text-red-400" : isDown ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {formatPercent(indexQuote.changePercent)}
                </LiveFlashSpan>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">成交量</span>
                <LiveFlashSpan
                  active={indexFlashing("volume")}
                  className="block font-semibold text-slate-300"
                >
                  {formatVolume(indexQuote.volume)}
                </LiveFlashSpan>
              </div>
              {series && (
                <span className="self-end text-[10px] text-slate-500">
                  K線：{series.source === "finmind" ? "FinMind" : "Mock"}（盤中不刷新）
                </span>
              )}
            </div>
          ) : (
            stock && (
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <LiveFlashSpan
                  active={isFlashing(stock.symbol, "price")}
                  className="text-xl font-bold text-white"
                >
                  {formatPrice(stock.closePrice)}
                </LiveFlashSpan>
                <LiveFlashSpan
                  active={isFlashing(stock.symbol, "changePercent")}
                  className={`font-semibold ${
                    isUp ? "text-red-400" : isDown ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {formatPercent(stock.changePercent)}
                </LiveFlashSpan>
                <LiveFlashSpan
                  active={isFlashing(stock.symbol, "volume")}
                  className="text-slate-300"
                >
                  量 {formatVolume(stock.volume)}
                </LiveFlashSpan>
                <LiveFlashSpan
                  active={isFlashing(stock.symbol, "score")}
                  className="text-emerald-400"
                >
                  {stock.score} 分
                </LiveFlashSpan>
                {series && (
                  <span className="text-[10px] text-slate-500">
                    K線：{series.source === "finmind" ? "FinMind" : "Mock"}（盤中不刷新）
                  </span>
                )}
              </div>
            )
          )}
        </div>
        <div className="hidden shrink-0 gap-3 text-[10px] text-slate-500 sm:flex">
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
        {series && <ChartCanvas series={series} />}
      </div>
    </section>
  );
}
