"use client";

import { useState } from "react";
import type { ScoredStock } from "@/lib/stock-radar/types";
import { getSpotlightTags } from "@/lib/stock-radar/categories";
import {
  formatMultiplier,
  formatNetBuy,
  formatPercent,
} from "@/lib/stock-radar/format";
import { DecisionLight } from "./DecisionLight";
import { getScoreTier } from "./StockBadge";
import { buildRiskHint, hasRisk } from "./risk-hints";
import { ScoreBreakdownPanel } from "./ScoreBreakdownPanel";
import { SpotlightTags } from "./SpotlightTags";
import { StarButton } from "./StarButton";

interface OverviewRowProps {
  stock: ScoredStock;
  watchlisted: boolean;
  onToggleWatchlist: () => void;
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

export function OverviewRow({
  stock,
  watchlisted,
  onToggleWatchlist,
}: OverviewRowProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const tier = getScoreTier(stock.score);
  const isUp = stock.changePercent > 0;
  const isDown = stock.changePercent < 0;
  const risk = buildRiskHint(stock);
  const spotlightTags = getSpotlightTags(stock);

  return (
    <article className="rounded-2xl bg-white px-3.5 py-3 shadow-sm ring-1 ring-zinc-100">
      <div className="flex items-center gap-2.5">
        <DecisionLight score={stock.score} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-zinc-900">
              {stock.symbol}
            </span>
            <span className="truncate text-sm text-zinc-600">{stock.name}</span>
          </div>
          <SpotlightTags tags={spotlightTags} className="mt-1.5" />
        </div>
        <StarButton active={watchlisted} onToggle={onToggleWatchlist} />
        <div className="shrink-0 text-right">
          <span className={`text-lg font-bold tabular-nums ${tier.scoreClass}`}>
            {stock.score}
          </span>
          <span className="ml-0.5 text-xs text-zinc-400">分</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2 border-t border-zinc-50 pt-2">
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
        <MiniTag label="量能" value={formatMultiplier(stock.volumeMultiplier)} />
        <MiniTag
          label="外資"
          value={formatNetBuy(stock.foreignNetToday)}
          positive={stock.foreignNetToday > 0}
        />
        <MiniTag
          label="投信"
          value={formatNetBuy(stock.trustNetToday)}
          positive={stock.trustNetToday > 0}
        />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <MiniTag
          label="外資連買"
          value={`${stock.foreignConsecutiveBuyDays}天`}
          positive={stock.foreignConsecutiveBuyDays >= 3}
        />
        <MiniTag
          label="整理突破"
          value={stock.consolidationBreakout ? "是" : "否"}
          positive={stock.consolidationBreakout}
        />
        <MiniTag
          label="均線"
          value={stock.isMaStructure ? "完整" : "否"}
          positive={stock.isMaStructure}
        />
      </div>

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

      <button
        type="button"
        onClick={() => setShowBreakdown((prev) => !prev)}
        className="mt-2 w-full rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-700"
      >
        {showBreakdown ? "收起分數細項" : "分數細項"}
      </button>

      {showBreakdown && (
        <div className="mt-2">
          <ScoreBreakdownPanel stock={stock} />
        </div>
      )}
    </article>
  );
}
