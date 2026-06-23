import type { ScoredStock } from "@/lib/stock-radar/types";
import {
  formatMultiplier,
  formatPercent,
} from "@/lib/stock-radar/format";
import { DecisionLight } from "./DecisionLight";
import { getScoreTier } from "./StockBadge";
import { buildRiskHint, hasRisk } from "./risk-hints";

interface OverviewRowProps {
  stock: ScoredStock;
}

function MiniTag({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-zinc-400">{label}</span>
      <span
        className={`text-xs font-semibold tabular-nums ${
          positive === undefined
            ? "text-zinc-800"
            : positive
              ? "text-emerald-600"
              : "text-zinc-400"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function OverviewRow({ stock }: OverviewRowProps) {
  const tier = getScoreTier(stock.score);
  const isUp = stock.changePercent > 0;
  const isDown = stock.changePercent < 0;
  const risk = buildRiskHint(stock);

  return (
    <article className="rounded-2xl bg-white px-3.5 py-3 shadow-sm ring-1 ring-zinc-100">
      {/* 第一列：燈號、代號名稱、分數 */}
      <div className="flex items-center gap-2.5">
        <DecisionLight score={stock.score} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-zinc-900">
              {stock.symbol}
            </span>
            <span className="truncate text-sm text-zinc-600">{stock.name}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className={`text-lg font-bold tabular-nums ${tier.scoreClass}`}>
            {stock.score}
          </span>
          <span className="ml-0.5 text-xs text-zinc-400">分</span>
        </div>
      </div>

      {/* 第二列：關鍵指標 */}
      <div className="mt-2.5 grid grid-cols-4 gap-2 border-t border-zinc-50 pt-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400">漲幅</span>
          <span
            className={`text-xs font-semibold tabular-nums ${
              isUp ? "text-red-500" : isDown ? "text-emerald-600" : "text-zinc-700"
            }`}
          >
            {formatPercent(stock.changePercent)}
          </span>
        </div>
        <MiniTag
          label="量能"
          value={formatMultiplier(stock.volumeMultiplier)}
        />
        <MiniTag
          label="突破"
          value={stock.brokeHigh20 ? "已突破" : "未突破"}
          positive={stock.brokeHigh20}
        />
        <MiniTag
          label="均線"
          value={stock.isBullishMA ? "多頭" : "非多頭"}
          positive={stock.isBullishMA}
        />
      </div>

      {/* 第三列：風險提醒 */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[10px] text-zinc-400">風險</span>
        <span
          className={`text-xs font-medium ${
            hasRisk(stock) ? "text-amber-700" : "text-emerald-600"
          }`}
        >
          {hasRisk(stock) ? `⚠️ ${risk}` : "✓ 無"}
        </span>
      </div>
    </article>
  );
}
