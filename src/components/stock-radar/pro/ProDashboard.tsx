"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DataSourceMeta,
  ProCategoryKey,
  RadarStats,
  ScoredStock,
} from "@/lib/stock-radar/types";
import { useWatchlist } from "@/hooks/useWatchlist";
import {
  filterByProCategory,
  isVolumeNotSpiked,
  isJustBreakout,
  isAccumulation,
  getTopTen,
} from "@/lib/stock-radar/pro-categories";
import { buildLiveSignals, type LiveSignal } from "@/lib/stock-radar/live-signals";
import {
  getInitialLinePushLog,
  mergeLinePushLog,
  type LinePushEntry,
} from "@/lib/stock-radar/line-push-log";
import { ProCategoryTabs } from "./ProCategoryTabs";
import { ProMarketOverview } from "./ProMarketOverview";
import { ProWatchlistPanel } from "./ProWatchlistPanel";
import { ProChart } from "./ProChart";
import { ProAiPanel } from "./ProAiPanel";
import { ProLiveSignals } from "./ProLiveSignals";
import { ProLinePushLog } from "./ProLinePushLog";

const POLL_INTERVAL_MS = 30_000;

interface ProDashboardProps {
  initialStocks: ScoredStock[];
  stats: RadarStats;
  meta: DataSourceMeta;
}

function countCategories(stocks: ScoredStock[]): Record<ProCategoryKey, number> {
  return {
    top10: getTopTen(stocks).length,
    breakout: stocks.filter(isJustBreakout).length,
    volumeNotSpiked: stocks.filter(isVolumeNotSpiked).length,
    accumulation: stocks.filter(isAccumulation).length,
  };
}

export function ProDashboard({
  initialStocks,
  stats,
  meta,
}: ProDashboardProps) {
  const [stocks, setStocks] = useState(initialStocks);
  const [category, setCategory] = useState<ProCategoryKey>("top10");
  const [selectedSymbol, setSelectedSymbol] = useState(
    initialStocks[0]?.symbol ?? ""
  );
  const [signals, setSignals] = useState<LiveSignal[]>(() =>
    buildLiveSignals(initialStocks)
  );
  const [lineLog, setLineLog] = useState<LinePushEntry[]>(() =>
    getInitialLinePushLog()
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [polling, setPolling] = useState(false);

  const { symbols, toggle, isWatchlisted, loaded } = useWatchlist();

  const categoryCounts = useMemo(() => countCategories(stocks), [stocks]);

  const filteredStocks = useMemo(
    () => filterByProCategory(stocks, category),
    [stocks, category]
  );

  const selectedStock = useMemo(
    () => stocks.find((s) => s.symbol === selectedSymbol) ?? null,
    [stocks, selectedSymbol]
  );

  const symbolKey = useMemo(
    () => initialStocks.map((s) => s.symbol).join(","),
    [initialStocks]
  );

  const refreshLive = useCallback(async () => {
    setPolling(true);
    try {
      const params = new URLSearchParams({ symbols: symbolKey });
      const response = await fetch(`/api/stock-radar/live?${params}`);
      if (!response.ok) return;

      const json = (await response.json()) as { stocks: ScoredStock[] };
      if (!Array.isArray(json.stocks)) return;

      setStocks((prev) => {
        const updated = new Map(json.stocks.map((s) => [s.symbol, s]));
        return prev.map((s) => updated.get(s.symbol) ?? s);
      });

      const newSignals = buildLiveSignals(json.stocks);
      setSignals(newSignals);
      setLineLog((prev) => mergeLinePushLog(prev, newSignals));
      setLastUpdated(new Date());
    } catch (error) {
      console.warn("[ProDashboard] 即時更新失敗:", error);
    } finally {
      setPolling(false);
    }
  }, [symbolKey]);

  useEffect(() => {
    void refreshLive();
    const timer = setInterval(() => void refreshLive(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refreshLive]);

  useEffect(() => {
    if (
      filteredStocks.length > 0 &&
      !filteredStocks.some((s) => s.symbol === selectedSymbol)
    ) {
      setSelectedSymbol(filteredStocks[0].symbol);
    }
  }, [filteredStocks, selectedSymbol]);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white">
            飆股雷達 <span className="text-emerald-400">Pro</span>
          </h1>
          <ProCategoryTabs
            active={category}
            onChange={setCategory}
            counts={categoryCounts}
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/stock-radar"
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
          >
            ← 手機版
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-64 xl:w-72">
          <ProMarketOverview
            stats={stats}
            meta={meta}
            stockCount={filteredStocks.length}
            signalCount={signals.length}
          />
          {loaded && (
            <ProWatchlistPanel
              stocks={filteredStocks}
              selectedSymbol={selectedSymbol}
              watchlistSymbols={symbols}
              onSelect={setSelectedSymbol}
              onToggleWatchlist={toggle}
              isWatchlisted={isWatchlisted}
            />
          )}
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div className="min-h-0 flex-1">
            <ProChart stock={selectedStock} />
          </div>
          <div className="grid h-48 shrink-0 grid-cols-1 gap-3 md:grid-cols-2">
            <ProLiveSignals
              signals={signals}
              lastUpdated={lastUpdated}
              polling={polling}
            />
            <ProLinePushLog entries={lineLog} />
          </div>
        </main>

        <aside className="hidden w-80 shrink-0 xl:flex xl:flex-col">
          <ProAiPanel stock={selectedStock} />
        </aside>
      </div>

      <div className="border-t border-slate-800 p-3 xl:hidden">
        <ProAiPanel stock={selectedStock} />
      </div>
    </div>
  );
}
