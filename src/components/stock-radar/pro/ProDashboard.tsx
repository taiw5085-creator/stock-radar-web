"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DataSourceMeta,
  RadarListKey,
  RadarStats,
  ScoredStock,
} from "@/lib/stock-radar/types";
import type { LiveQuote } from "@/lib/stock-radar/live-types";
import type { QuotesApiResponse } from "@/lib/stock-radar/live-types";
import { useLiveFlash } from "@/hooks/useLiveFlash";
import {
  countRadarCategories,
  filterByRadarCategory,
  getTopTen,
  isLiveJustBreakout,
} from "@/lib/stock-radar/pro-categories";
import { applyLiveQuote } from "@/lib/stock-radar/merge-live";
import { detectLiveChanges, isFieldFlashing } from "@/lib/stock-radar/live-flash";
import { buildLiveSignals, type LiveSignal } from "@/lib/stock-radar/live-signals";
import {
  getInitialLinePushLog,
  mergeLinePushLog,
  type LinePushEntry,
} from "@/lib/stock-radar/line-push-log";
import { ProMarketOverview } from "./ProMarketOverview";
import { ProRadarList } from "./ProRadarList";
import { ProTopTenButton } from "./ProTopTenButton";
import { ProChart } from "./ProChart";
import { ProAiPanel } from "./ProAiPanel";
import { ProLiveSignals } from "./ProLiveSignals";
import { ProLinePushLog } from "./ProLinePushLog";
import { ProLiveStatusBar } from "./ProLiveStatusBar";

const POLL_INTERVAL_SEC = 10;
const POLL_INTERVAL_MS = POLL_INTERVAL_SEC * 1000;

interface ProDashboardProps {
  initialStocks: ScoredStock[];
  stats: RadarStats;
  meta: DataSourceMeta;
}

function pickInitialSymbol(stocks: ScoredStock[]): string {
  const breakout = stocks.filter(isLiveJustBreakout);
  return breakout[0]?.symbol ?? stocks[0]?.symbol ?? "";
}

function mergeQuotesIntoStocks(
  baseStocks: ScoredStock[],
  quotes: Record<string, LiveQuote>,
  historicalSource: "finmind" | "mock"
): ScoredStock[] {
  return baseStocks.map((stock) => {
    const live = quotes[stock.symbol] ?? null;
    return applyLiveQuote(stock, live, historicalSource);
  });
}

export function ProDashboard({
  initialStocks,
  stats,
  meta,
}: ProDashboardProps) {
  const baseStocksRef = useRef(initialStocks);
  const historicalSource = meta.historical === "mock" ? "mock" : "finmind";

  const [stocks, setStocks] = useState(initialStocks);
  const [radarCategory, setRadarCategory] = useState<RadarListKey>("breakout");
  const [showTopTen, setShowTopTen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(() =>
    pickInitialSymbol(initialStocks)
  );
  const [signals, setSignals] = useState<LiveSignal[]>(() =>
    buildLiveSignals(initialStocks)
  );
  const [lineLog, setLineLog] = useState<LinePushEntry[]>(() =>
    getInitialLinePushLog()
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [polling, setPolling] = useState(false);
  const [countdown, setCountdown] = useState(POLL_INTERVAL_SEC);
  const [yahooError, setYahooError] = useState<string | null>(null);

  const { flashMap, triggerFlash } = useLiveFlash();

  const symbolKey = useMemo(
    () => initialStocks.map((s) => s.symbol).join(","),
    [initialStocks]
  );

  const radarCounts = useMemo(() => countRadarCategories(stocks), [stocks]);
  const topTenStocks = useMemo(() => getTopTen(stocks), [stocks]);

  const listStocks = useMemo(() => {
    if (showTopTen) return topTenStocks;
    return filterByRadarCategory(stocks, radarCategory);
  }, [stocks, radarCategory, showTopTen, topTenStocks]);

  const selectedStock = useMemo(
    () => stocks.find((s) => s.symbol === selectedSymbol) ?? null,
    [stocks, selectedSymbol]
  );

  const refreshLive = useCallback(async () => {
    setPolling(true);
    try {
      const params = new URLSearchParams({ symbols: symbolKey });
      const response = await fetch(`/api/stock-radar/quotes?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        setYahooError("Yahoo 即時資料暫時失敗，使用最近一次資料");
        return;
      }

      const json = (await response.json()) as QuotesApiResponse;

      if (!json.ok && json.yahooCount === 0) {
        setYahooError(
          json.message ?? "Yahoo 即時資料暫時失敗，使用最近一次資料"
        );
        return;
      }

      setYahooError(json.message ?? null);

      const next = mergeQuotesIntoStocks(
        baseStocksRef.current,
        json.quotes,
        historicalSource
      );

      setStocks((prev) => {
        triggerFlash(detectLiveChanges(prev, next));
        return next;
      });

      const newSignals = buildLiveSignals(next);
      setSignals(newSignals);
      setLineLog((log) => mergeLinePushLog(log, newSignals));
      setLastUpdated(new Date());
    } catch (error) {
      console.warn("[ProDashboard] 即時更新失敗:", error);
      setYahooError("Yahoo 即時資料暫時失敗，使用最近一次資料");
    } finally {
      setPolling(false);
      setCountdown(POLL_INTERVAL_SEC);
    }
  }, [symbolKey, historicalSource, triggerFlash]);

  const handleManualRefresh = useCallback(() => {
    setCountdown(POLL_INTERVAL_SEC);
    void refreshLive();
  }, [refreshLive]);

  const handleRadarCategoryChange = useCallback((key: RadarListKey) => {
    setShowTopTen(false);
    setRadarCategory(key);
  }, []);

  const handleTopTenToggle = useCallback(() => {
    setShowTopTen((prev) => !prev);
  }, []);

  useEffect(() => {
    void refreshLive();
  }, [refreshLive]);

  useEffect(() => {
    const pollTimer = setInterval(() => void refreshLive(), POLL_INTERVAL_MS);
    return () => clearInterval(pollTimer);
  }, [refreshLive]);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? POLL_INTERVAL_SEC : c - 1));
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, []);

  useEffect(() => {
    if (
      listStocks.length > 0 &&
      !listStocks.some((s) => s.symbol === selectedSymbol)
    ) {
      setSelectedSymbol(listStocks[0].symbol);
    }
  }, [listStocks, selectedSymbol]);

  const isFlashing = useCallback(
    (symbol: string, field: Parameters<typeof isFieldFlashing>[2]) =>
      isFieldFlashing(flashMap, symbol, field),
    [flashMap]
  );

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-800 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="shrink-0 text-lg font-bold text-white">
            飆股雷達 <span className="text-emerald-400">Pro</span>
          </h1>
          <ProTopTenButton
            active={showTopTen}
            count={topTenStocks.length}
            onClick={handleTopTenToggle}
          />
        </div>
        <div className="flex shrink-0 items-start gap-3">
          <ProLiveStatusBar
            polling={polling}
            lastUpdated={lastUpdated}
            countdown={countdown}
            yahooError={yahooError}
            onRefresh={handleManualRefresh}
          />
          <Link
            href="/stock-radar"
            className="mt-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
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
            stockCount={listStocks.length}
            signalCount={signals.length}
          />
          <ProRadarList
            stocks={listStocks}
            category={radarCategory}
            selectedSymbol={selectedSymbol}
            counts={radarCounts}
            onCategoryChange={handleRadarCategoryChange}
            onSelect={setSelectedSymbol}
            isFlashing={isFlashing}
            variant={showTopTen ? "top10" : "radar"}
          />
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div className="min-h-0 flex-1">
            <ProChart stock={selectedStock} isFlashing={isFlashing} />
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
