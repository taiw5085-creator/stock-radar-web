"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScoredStock } from "@/lib/stock-radar/types";
import { useWatchlist } from "@/hooks/useWatchlist";
import { formatPercent } from "@/lib/stock-radar/format";

const POLL_INTERVAL_MS = 60_000;

interface LiveAlert {
  symbol: string;
  name: string;
  kind: "breakout" | "volume";
  changePercent: number;
}

interface LiveWatchlistMonitorProps {
  initialStocks: ScoredStock[];
}

function buildAlerts(stocks: ScoredStock[], symbols: string[]): LiveAlert[] {
  const bySymbol = new Map(stocks.map((s) => [s.symbol, s]));
  const alerts: LiveAlert[] = [];

  for (const symbol of symbols) {
    const stock = bySymbol.get(symbol);
    if (!stock) continue;

    if (stock.liveBreakout) {
      alerts.push({
        symbol,
        name: stock.name,
        kind: "breakout",
        changePercent: stock.changePercent,
      });
    }
    if (stock.liveVolumeSurge) {
      alerts.push({
        symbol,
        name: stock.name,
        kind: "volume",
        changePercent: stock.changePercent,
      });
    }
  }

  return alerts;
}

export function LiveWatchlistMonitor({ initialStocks }: LiveWatchlistMonitorProps) {
  const { symbols, loaded } = useWatchlist();
  const [stocks, setStocks] = useState(initialStocks);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [polling, setPolling] = useState(false);

  const refreshLive = useCallback(async (watchSymbols: string[]) => {
    if (watchSymbols.length === 0) return;

    setPolling(true);
    try {
      const params = new URLSearchParams({ symbols: watchSymbols.join(",") });
      const response = await fetch(`/api/stock-radar/live?${params}`);
      if (!response.ok) return;

      const json = (await response.json()) as { stocks: ScoredStock[] };
      if (!Array.isArray(json.stocks)) return;

      setStocks((prev) => {
        const updated = new Map(json.stocks.map((s) => [s.symbol, s]));
        return prev.map((s) => updated.get(s.symbol) ?? s);
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.warn("[LiveWatchlistMonitor] 輪詢失敗:", error);
    } finally {
      setPolling(false);
    }
  }, []);

  useEffect(() => {
    if (!loaded || symbols.length === 0) return;

    void refreshLive(symbols);
    const timer = setInterval(() => void refreshLive(symbols), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loaded, symbols, refreshLive]);

  const alerts = useMemo(
    () => (loaded && symbols.length > 0 ? buildAlerts(stocks, symbols) : []),
    [stocks, symbols, loaded]
  );

  if (!loaded || symbols.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/80">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-zinc-900">自選股盤中監控</h2>
        <span className="text-xs text-zinc-400">
          {polling
            ? "更新中…"
            : lastUpdated
              ? `${lastUpdated.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })} 更新`
              : "每 60 秒更新"}
        </span>
      </div>

      {alerts.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">
          自選 {symbols.length} 檔，目前無即時突破或爆量訊號
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {alerts.map((alert) => (
            <li
              key={`${alert.symbol}-${alert.kind}`}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                alert.kind === "breakout"
                  ? "bg-red-50 text-red-800"
                  : "bg-blue-50 text-blue-800"
              }`}
            >
              <span>
                <span className="font-bold">{alert.symbol}</span>{" "}
                {alert.name} ·{" "}
                {alert.kind === "breakout" ? "即時突破 20 日高" : "即時爆量"}
              </span>
              <span className="font-semibold tabular-nums">
                {formatPercent(alert.changePercent)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
