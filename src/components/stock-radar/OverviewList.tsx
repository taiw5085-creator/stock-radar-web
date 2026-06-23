import type { ScoredStock } from "@/lib/stock-radar/types";
import { OverviewRow } from "./OverviewRow";

interface OverviewListProps {
  stocks: ScoredStock[];
}

export function OverviewList({ stocks }: OverviewListProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-700">
          全部股票 · {stocks.length} 檔
        </h2>
        <span className="text-xs text-zinc-400">依分數排序</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {stocks.map((stock) => (
          <OverviewRow key={stock.symbol} stock={stock} />
        ))}
      </div>
    </section>
  );
}
