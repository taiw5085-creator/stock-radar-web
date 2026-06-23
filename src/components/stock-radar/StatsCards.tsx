import type { RadarStats } from "@/lib/stock-radar/types";
import { formatMultiplier } from "@/lib/stock-radar/format";

interface StatsCardsProps {
  stats: RadarStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
        <p className="text-sm font-medium text-zinc-500">今日強勢候選</p>
        <p className="mt-2 text-3xl font-bold text-emerald-600">
          {stats.highScoreCount}
          <span className="ml-1.5 text-base font-medium text-zinc-400">檔</span>
        </p>
        <p className="mt-1 text-sm text-zinc-500">130 分以上，值得優先關注</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
        <p className="text-sm font-medium text-zinc-500">最強股票</p>
        {stats.topStock ? (
          <div className="mt-2">
            <p className="text-xl font-bold text-zinc-900">
              {stats.topStock.symbol}{" "}
              <span className="text-base font-semibold text-zinc-600">
                {stats.topStock.name}
              </span>
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-600">
              {stats.topStock.score} 分
            </p>
          </div>
        ) : (
          <p className="mt-2 text-base text-zinc-400">暫無資料</p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
        <p className="text-sm font-medium text-zinc-500">平均量能</p>
        <p className="mt-2 text-3xl font-bold text-blue-600">
          {formatMultiplier(stats.avgVolumeMultiplier)}
        </p>
        <p className="mt-1 text-sm text-zinc-500">相較 20 日均量的放大倍數</p>
      </div>
    </section>
  );
}
