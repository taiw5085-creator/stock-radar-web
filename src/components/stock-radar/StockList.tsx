import type { ScoredStock, SortMode } from "@/lib/stock-radar/types";
import { SORT_MODE_LABELS } from "@/lib/stock-radar/sort-stocks";
import { StockCard } from "./StockCard";

interface StockListProps {
  stocks: ScoredStock[];
  sortMode: SortMode;
  isWatchlisted: (symbol: string) => boolean;
  onToggleWatchlist: (symbol: string) => void;
}

export function StockList({
  stocks,
  sortMode,
  isWatchlisted,
  onToggleWatchlist,
}: StockListProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-zinc-700">
        今日股票健檢 · 共 {stocks.length} 檔
      </h2>
      <p className="text-sm text-zinc-500">
        {SORT_MODE_LABELS[sortMode]}排序 · 分數越高排越前面
      </p>
      <div className="flex flex-col gap-5">
        {stocks.map((stock) => (
          <StockCard
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
