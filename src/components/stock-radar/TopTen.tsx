import type { ScoredStock } from "@/lib/stock-radar/types";

interface TopTenProps {
  stocks: ScoredStock[];
}

export function TopTen({ stocks }: TopTenProps) {
  if (stocks.length === 0) return null;

  return (
    <section className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-5 text-white shadow-sm">
      <h2 className="text-base font-bold">🔥 今日最像飆股 TOP 10</h2>
      <p className="mt-1 text-sm text-orange-100">依綜合分數排序</p>
      <ol className="mt-4 space-y-2">
        {stocks.map((stock, index) => (
          <li
            key={stock.symbol}
            className="flex items-center gap-3 rounded-xl bg-white/15 px-3 py-2.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 text-sm font-bold">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {stock.symbol}{" "}
                <span className="font-normal text-orange-100">{stock.name}</span>
              </p>
            </div>
            <span className="shrink-0 text-lg font-bold tabular-nums">
              {stock.score}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
