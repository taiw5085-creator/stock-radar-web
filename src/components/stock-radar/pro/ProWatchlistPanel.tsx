"use client";

import type { ScoredStock } from "@/lib/stock-radar/types";
import {
  formatPercent,
  formatPrice,
} from "@/lib/stock-radar/format";
import { StarButton } from "../StarButton";
import { QuoteSourceBadge } from "../QuoteSourceBadge";

interface ProWatchlistPanelProps {
  stocks: ScoredStock[];
  selectedSymbol: string;
  watchlistSymbols: string[];
  onSelect: (symbol: string) => void;
  onToggleWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;
}

export function ProWatchlistPanel({
  stocks,
  selectedSymbol,
  watchlistSymbols,
  onSelect,
  onToggleWatchlist,
  isWatchlisted,
}: ProWatchlistPanelProps) {
  const watchSet = new Set(watchlistSymbols);
  const watchlistStocks = stocks.filter((s) => watchSet.has(s.symbol));
  const displayStocks =
    watchlistStocks.length > 0 ? watchlistStocks : stocks.slice(0, 8);

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-700/60 bg-slate-900/80">
      <div className="border-b border-slate-700/60 px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          自選股
        </h2>
        <p className="mt-0.5 text-[10px] text-slate-500">
          {watchlistSymbols.length > 0
            ? `${watchlistSymbols.length} 檔已收藏`
            : "點 ☆ 加入自選（localStorage）"}
        </p>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {displayStocks.map((stock) => {
          const selected = stock.symbol === selectedSymbol;
          const isUp = stock.changePercent > 0;
          const isDown = stock.changePercent < 0;

          return (
            <li key={stock.symbol}>
              <button
                type="button"
                onClick={() => onSelect(stock.symbol)}
                className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  selected
                    ? "bg-emerald-500/20 ring-1 ring-emerald-500/50"
                    : "hover:bg-slate-800"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">
                      {stock.symbol}
                    </span>
                    <QuoteSourceBadge source={stock.quoteSource} />
                  </div>
                  <p className="truncate text-xs text-slate-400">{stock.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="font-semibold tabular-nums text-slate-200">
                      {formatPrice(stock.closePrice)}
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        isUp
                          ? "text-red-400"
                          : isDown
                            ? "text-emerald-400"
                            : "text-slate-400"
                      }`}
                    >
                      {formatPercent(stock.changePercent)}
                    </span>
                    <span className="text-emerald-400">{stock.score}分</span>
                  </div>
                </div>
                <StarButton
                  active={isWatchlisted(stock.symbol)}
                  onToggle={() => onToggleWatchlist(stock.symbol)}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
