import type { ScoredStock } from "@/lib/stock-radar/types";
import { StockCard } from "./StockCard";

interface StockListProps {
  stocks: ScoredStock[];
}

export function StockList({ stocks }: StockListProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-zinc-700">
        今日股票健檢 · 共 {stocks.length} 檔
      </h2>
      <p className="text-sm text-zinc-500">分數越高排越前面</p>
      <div className="flex flex-col gap-5">
        {stocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} />
        ))}
      </div>
    </section>
  );
}
