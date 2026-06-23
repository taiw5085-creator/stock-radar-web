import { ScoreGuide } from "@/components/stock-radar/ScoreGuide";
import { StatsCards } from "@/components/stock-radar/StatsCards";
import { StockRadarView } from "@/components/stock-radar/StockRadarView";
import {
  buildRadarStats,
  getScoredStocks,
} from "@/lib/stock-radar/get-stocks";

export const dynamic = "force-dynamic";

export default async function StockRadarPage() {
  const stocks = await getScoredStocks();
  const stats = buildRadarStats(stocks);

  return (
    <div className="min-h-full bg-zinc-100">
      <div className="mx-auto w-full max-w-lg px-4 pb-12 pt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            今日飆股雷達
          </h1>
          <p className="mt-2 text-base leading-relaxed text-zinc-600">
            幫你快速找出量價轉強、突破、均線多頭的股票
          </p>
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-100">
            本工具只做條件篩選，不代表投資建議。
          </p>
        </header>

        <div className="mb-6">
          <StatsCards stats={stats} />
        </div>

        <div className="mb-6">
          <ScoreGuide />
        </div>

        <StockRadarView stocks={stocks} />

        <footer className="mt-10 text-center text-sm text-zinc-400">
          資料來源：FinMind API · 每日盤後更新
        </footer>
      </div>
    </div>
  );
}
