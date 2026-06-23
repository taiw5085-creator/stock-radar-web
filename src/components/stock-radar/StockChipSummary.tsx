import type { ScoredStock } from "@/lib/stock-radar/types";
import { formatNetBuy } from "@/lib/stock-radar/format";

interface StockChipSummaryProps {
  stock: ScoredStock;
  className?: string;
}

export function StockChipSummary({ stock, className = "" }: StockChipSummaryProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-3 text-sm ${className}`}
    >
      <div>
        <p className="text-xs text-zinc-500">外資買賣超</p>
        <p
          className={`font-bold tabular-nums ${
            stock.foreignNetToday > 0
              ? "text-red-500"
              : stock.foreignNetToday < 0
                ? "text-emerald-600"
                : "text-zinc-600"
          }`}
        >
          {formatNetBuy(stock.foreignNetToday)}
        </p>
      </div>
      <div>
        <p className="text-xs text-zinc-500">投信買賣超</p>
        <p
          className={`font-bold tabular-nums ${
            stock.trustNetToday > 0
              ? "text-red-500"
              : stock.trustNetToday < 0
                ? "text-emerald-600"
                : "text-zinc-600"
          }`}
        >
          {formatNetBuy(stock.trustNetToday)}
        </p>
      </div>
      <div>
        <p className="text-xs text-zinc-500">外資連買</p>
        <p className="font-semibold text-zinc-800">
          {stock.foreignConsecutiveBuyDays} 天
        </p>
      </div>
      <div>
        <p className="text-xs text-zinc-500">投信連買</p>
        <p className="font-semibold text-zinc-800">
          {stock.trustConsecutiveBuyDays} 天
        </p>
      </div>
    </div>
  );
}
