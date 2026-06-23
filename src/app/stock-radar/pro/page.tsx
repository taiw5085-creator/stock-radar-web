import { ProDashboard } from "@/components/stock-radar/pro/ProDashboard";
import {
  buildRadarStats,
  getScoredStocks,
} from "@/lib/stock-radar/get-stocks";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StockRadarProPage() {
  const { stocks, meta } = await getScoredStocks();
  const stats = buildRadarStats(stocks);

  if (stocks.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="text-center">
          <p>無可用資料</p>
          <Link href="/stock-radar" className="mt-4 inline-block text-emerald-400">
            返回手機版
          </Link>
        </div>
      </div>
    );
  }

  return <ProDashboard initialStocks={stocks} stats={stats} meta={meta} />;
}
