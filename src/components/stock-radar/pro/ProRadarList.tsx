"use client";

import type { ScoredStock } from "@/lib/stock-radar/types";
import type { RadarListKey } from "@/lib/stock-radar/types";
import type { LiveFlashField } from "@/lib/stock-radar/live-flash";
import { RADAR_LIST_LABELS } from "@/lib/stock-radar/pro-categories";
import {
  formatMultiplier,
  formatPercent,
  formatPrice,
} from "@/lib/stock-radar/format";
import { LiveFlashSpan } from "./LiveFlashSpan";

interface ProRadarListProps {
  stocks: ScoredStock[];
  category: RadarListKey;
  selectedSymbol: string | null;
  counts: Record<RadarListKey, number>;
  onCategoryChange: (key: RadarListKey) => void;
  onSelect: (symbol: string) => void;
  isFlashing: (symbol: string, field: LiveFlashField) => boolean;
  variant?: "radar" | "top10";
}

const RADAR_KEYS: RadarListKey[] = [
  "breakout",
  "volumeNotSpiked",
  "accumulation",
];

function StockRows({
  stocks,
  selectedSymbol,
  onSelect,
  isFlashing,
}: Pick<
  ProRadarListProps,
  "stocks" | "selectedSymbol" | "onSelect" | "isFlashing"
>) {
  if (stocks.length === 0) {
    return (
      <li className="px-3 py-8 text-center text-sm text-slate-500">
        目前沒有符合條件的股票
      </li>
    );
  }

  return (
    <>
      {stocks.map((stock) => {
        const selected = selectedSymbol !== null && stock.symbol === selectedSymbol;
        const isUp = stock.changePercent > 0;
        const isDown = stock.changePercent < 0;

        return (
          <li key={stock.symbol}>
            <button
              type="button"
              onClick={() => onSelect(stock.symbol)}
              className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                selected
                  ? "bg-emerald-500/20 ring-1 ring-emerald-500/50"
                  : "hover:bg-slate-800"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-white">
                  {stock.symbol}
                </span>
                <LiveFlashSpan
                  active={isFlashing(stock.symbol, "score")}
                  className="text-xs font-semibold text-emerald-400"
                >
                  {stock.score} 分
                </LiveFlashSpan>
              </div>
              <p className="truncate text-xs text-slate-400">{stock.name}</p>
              <div className="mt-1.5 grid grid-cols-3 gap-1 text-[11px]">
                <div>
                  <span className="text-slate-500">現價</span>
                  <LiveFlashSpan
                    active={isFlashing(stock.symbol, "price")}
                    className="mt-0.5 block font-semibold tabular-nums text-slate-200"
                  >
                    {formatPrice(stock.closePrice)}
                  </LiveFlashSpan>
                </div>
                <div>
                  <span className="text-slate-500">漲跌幅</span>
                  <LiveFlashSpan
                    active={isFlashing(stock.symbol, "changePercent")}
                    className={`mt-0.5 block font-semibold tabular-nums ${
                      isUp
                        ? "text-red-400"
                        : isDown
                          ? "text-emerald-400"
                          : "text-slate-400"
                    }`}
                  >
                    {formatPercent(stock.changePercent)}
                  </LiveFlashSpan>
                </div>
                <div>
                  <span className="text-slate-500">量能</span>
                  <LiveFlashSpan
                    active={isFlashing(stock.symbol, "volume")}
                    className="mt-0.5 block font-semibold tabular-nums text-blue-400"
                  >
                    {formatMultiplier(stock.volumeMultiplier)}
                  </LiveFlashSpan>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </>
  );
}

export function ProRadarList({
  stocks,
  category,
  selectedSymbol,
  counts,
  onCategoryChange,
  onSelect,
  isFlashing,
  variant = "radar",
}: ProRadarListProps) {
  const isTopTen = variant === "top10";

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-700/60 bg-slate-900/80">
      <div className="border-b border-slate-700/60 px-4 py-3">
        <h2
          className={`text-xs font-bold uppercase tracking-wider ${
            isTopTen ? "text-amber-400" : "text-slate-400"
          }`}
        >
          {isTopTen ? "TOP 10 快捷檢視" : "雷達清單"}
        </h2>
        {!isTopTen && (
          <div className="mt-2 flex flex-col gap-1">
            {RADAR_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onCategoryChange(key)}
                className={`rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                  category === key
                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {RADAR_LIST_LABELS[key]}
                <span className="ml-1 opacity-70">({counts[key]})</span>
              </button>
            ))}
          </div>
        )}
        {isTopTen && (
          <p className="mt-1 text-[10px] text-slate-500">
            依飆股分數排序 · 再按 TOP 10 返回雷達清單
          </p>
        )}
      </div>

      <ul className="flex-1 overflow-y-auto p-2">
        <StockRows
          stocks={stocks}
          selectedSymbol={selectedSymbol}
          onSelect={onSelect}
          isFlashing={isFlashing}
        />
      </ul>
    </section>
  );
}
