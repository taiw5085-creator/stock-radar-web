import { ScoreGuide } from "@/components/stock-radar/ScoreGuide";
import { StatsCards } from "@/components/stock-radar/StatsCards";
import { StockRadarView } from "@/components/stock-radar/StockRadarView";
import { TopTen } from "@/components/stock-radar/TopTen";
import { DataSourceBanner } from "@/components/stock-radar/DataSourceBanner";
import { LiveWatchlistMonitor } from "@/components/stock-radar/LiveWatchlistMonitor";
import { getTopTen } from "@/lib/stock-radar/categories";
import {
  buildRadarStats,
  getScoredStocks,
} from "@/lib/stock-radar/get-stocks";

export const dynamic = "force-dynamic";

export default async function StockRadarPage() {
  const { stocks, meta } = await getScoredStocks();
  const stats = buildRadarStats(stocks);
  const topTen = getTopTen(stocks);

  const footerHistorical =
    meta.historical === "mock" ? "Mock 假資料" : "FinMind API";
  const footerLive =
    meta.live === "yahoo"
      ? "Yahoo Finance 即時"
      : meta.live === "finmind"
        ? "FinMind 收盤 fallback"
        : "Mock 假資料";

  return (
    <div className="min-h-full bg-zinc-100">
      <div className="mx-auto w-full max-w-lg px-4 pb-12 pt-6">
        <header className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                今日飆股雷達
              </h1>
              <p className="mt-2 text-base leading-relaxed text-zinc-600">
                幫你快速找出量價轉強、突破、均線多頭的股票
              </p>
            </div>
            <a
              href="/stock-radar/pro"
              className="hidden shrink-0 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white sm:inline-block"
            >
              Pro 版 →
            </a>
          </div>
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-100">
            本工具只做條件篩選，不代表投資建議。
          </p>
        </header>

        <div className="mb-6">
          <DataSourceBanner meta={meta} />
        </div>

        <div className="mb-6">
          <LiveWatchlistMonitor initialStocks={stocks} />
        </div>

        <div className="mb-6">
          <TopTen stocks={topTen} />
        </div>

        <div className="mb-6">
          <StatsCards stats={stats} />
        </div>

        <div className="mb-6">
          <ScoreGuide />
        </div>

        <StockRadarView stocks={stocks} />

        <footer className="mt-10 text-center text-sm text-zinc-400">
          歷史資料：{footerHistorical} · 即時報價：{footerLive}
        </footer>
      </div>
    </div>
  );
}
