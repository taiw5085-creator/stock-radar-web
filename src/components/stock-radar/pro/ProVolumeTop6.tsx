"use client";

import type { ScoredStock } from "@/lib/stock-radar/types";
import type { LiveFlashField } from "@/lib/stock-radar/live-flash";
import {
  formatPercent,
  formatPrice,
  formatVolumeLots,
} from "@/lib/stock-radar/format";
import { LiveFlashSpan } from "./LiveFlashSpan";

interface ProVolumeTop6Props {
  stocks: ScoredStock[];
  selectedSymbol: string | null;
  onSelect: (symbol: string) => void;
  isFlashing: (symbol: string, field: LiveFlashField) => boolean;
}

export function ProVolumeTop6({
  stocks,
  selectedSymbol,
  onSelect,
  isFlashing,
}: ProVolumeTop6Props) {
  return (
    <section className="shrink-0 rounded-xl border border-slate-700/60 bg-slate-900/80">
      <div className="border-b border-slate-700/60 px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          成交量排行 TOP6
        </h2>
        <p className="mt-0.5 text-[10px] text-slate-500">每 10 秒更新 · 點擊切換主圖</p>
      </div>

      <ul className="grid grid-cols-1 gap-1.5 p-2 sm:grid-cols-2 xl:grid-cols-1">
        {stocks.length === 0 ? (
          <li className="col-span-full px-3 py-6 text-center text-sm text-slate-500">
            暫無資料
          </li>
        ) : (
          stocks.map((stock) => {
            const selected = selectedSymbol === stock.symbol;
            const isUp = stock.changePercent > 0;
            const isDown = stock.changePercent < 0;
            const isSurge = stock.volumeMultiplier > 2;

            return (
              <li key={stock.symbol}>
                <button
                  type="button"
                  onClick={() => onSelect(stock.symbol)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "bg-emerald-500/15 ring-1 ring-emerald-500/40"
                      : "bg-slate-800/50 hover:bg-slate-800"
                  }`}
                >
                  <p className="truncate text-xs font-semibold text-slate-200">
                    {stock.symbol}{" "}
                    <span className="font-normal text-slate-400">{stock.name}</span>
                  </p>

                  <div className="mt-1 flex items-baseline gap-2">
                    <LiveFlashSpan
                      active={isFlashing(stock.symbol, "price")}
                      className="text-lg font-bold tabular-nums text-white"
                    >
                      {formatPrice(stock.closePrice)}
                    </LiveFlashSpan>
                    <LiveFlashSpan
                      active={isFlashing(stock.symbol, "changePercent")}
                      className={`text-sm font-semibold tabular-nums ${
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

                  <div className="mt-1 flex items-center gap-2">
                    <LiveFlashSpan
                      active={isFlashing(stock.symbol, "volume")}
                      className="text-[11px] tabular-nums text-slate-500"
                    >
                      {formatVolumeLots(stock.volume)}
                    </LiveFlashSpan>
                    {isSurge && (
                      <span className="text-[10px] font-semibold text-orange-400">
                        🔥 爆量
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
