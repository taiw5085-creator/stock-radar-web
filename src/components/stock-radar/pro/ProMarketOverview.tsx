"use client";

import type { DataSourceMeta, RadarStats } from "@/lib/stock-radar/types";
import { formatMultiplier } from "@/lib/stock-radar/format";

interface ProMarketOverviewProps {
  stats: RadarStats;
  meta: DataSourceMeta;
  stockCount: number;
  signalCount: number;
}

export function ProMarketOverview({
  stats,
  meta,
  stockCount,
  signalCount,
}: ProMarketOverviewProps) {
  const historicalLabel =
    meta.historical === "mock" ? "Mock" : "FinMind";
  const liveLabel =
    meta.live === "yahoo"
      ? `Yahoo ${meta.yahooCount}/${meta.total}`
      : meta.live === "finmind"
        ? "FinMind"
        : "Mock";

  return (
    <section className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        市場總覽
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-slate-500">監控標的</p>
          <p className="text-xl font-bold tabular-nums text-white">{stockCount}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500">即時訊號</p>
          <p className="text-xl font-bold tabular-nums text-emerald-400">
            {signalCount}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500">高分標的</p>
          <p className="text-lg font-bold tabular-nums text-amber-400">
            {stats.highScoreCount}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500">平均量能</p>
          <p className="text-lg font-bold tabular-nums text-blue-400">
            {formatMultiplier(stats.avgVolumeMultiplier)}
          </p>
        </div>
      </div>
      {stats.topStock && (
        <div className="mt-3 rounded-lg bg-slate-800/80 px-3 py-2">
          <p className="text-[10px] text-slate-500">最強標的</p>
          <p className="text-sm font-semibold text-white">
            {stats.topStock.symbol}{" "}
            <span className="text-slate-400">{stats.topStock.name}</span>
            <span className="ml-2 text-emerald-400">{stats.topStock.score} 分</span>
          </p>
        </div>
      )}
      <p className="mt-3 text-[10px] text-slate-500">
        歷史 {historicalLabel} · 即時 {liveLabel}
      </p>
    </section>
  );
}
