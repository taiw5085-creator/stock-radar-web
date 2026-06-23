import type { ScoredStock, SortMode } from "@/lib/stock-radar/types";
import { SORT_MODE_LABELS } from "@/lib/stock-radar/sort-stocks";
import { OverviewRow } from "./OverviewRow";

interface OverviewListProps {
  stocks: ScoredStock[];
  sortMode: SortMode;
  isWatchlisted: (symbol: string) => boolean;
  onToggleWatchlist: (symbol: string) => void;
}

export function OverviewList({
  stocks,
  sortMode,
  isWatchlisted,
  onToggleWatchlist,
}: OverviewListProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-700">
          全部股票 · {stocks.length} 檔
        </h2>
        <span className="text-xs text-zinc-400">
          {SORT_MODE_LABELS[sortMode]}排序
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {stocks.map((stock) => (
          <OverviewRow
            key={stock.symbol}
            stock={stock}
            watchlisted={isWatchlisted(stock.symbol)}
            onToggleWatchlist={() => onToggleWatchlist(stock.symbol)}
          />
        ))}
      </div>
    </section>
  );
}
