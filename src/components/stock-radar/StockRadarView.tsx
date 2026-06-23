"use client";

import { useMemo, useState } from "react";
import type { CategoryKey, ScoredStock, SortMode } from "@/lib/stock-radar/types";
import {
  CATEGORY_LABELS,
  filterByCategory,
} from "@/lib/stock-radar/categories";
import { sortStocks } from "@/lib/stock-radar/sort-stocks";
import { useWatchlist } from "@/hooks/useWatchlist";
import { CategoryFilterTabs } from "./CategoryFilterTabs";
import { EmptyCategory } from "./EmptyCategory";
import { ModeToggle } from "./ModeToggle";
import { OverviewList } from "./OverviewList";
import { SortModeToggle } from "./SortModeToggle";
import { StockList } from "./StockList";

interface StockRadarViewProps {
  stocks: ScoredStock[];
}

export function StockRadarView({ stocks }: StockRadarViewProps) {
  const [viewMode, setViewMode] = useState<"overview" | "card">("overview");
  const [sortMode, setSortMode] = useState<SortMode>("momentum");
  const [category, setCategory] = useState<CategoryKey>("all");
  const { symbols, toggle, isWatchlisted, loaded } = useWatchlist();

  const filteredStocks = useMemo(() => {
    const filtered = filterByCategory(stocks, category, symbols);
    return sortStocks(filtered, sortMode);
  }, [stocks, category, symbols, sortMode]);

  return (
    <div className="space-y-4">
      <CategoryFilterTabs
        active={category}
        onChange={setCategory}
        watchlistCount={symbols.length}
      />

      {category === "watchlist" && loaded && (
        <p className="text-sm text-zinc-500">
          點擊股票卡上的 ☆ 加入自選股，重新整理後仍會保留
        </p>
      )}

      <SortModeToggle mode={sortMode} onChange={setSortMode} />
      <ModeToggle mode={viewMode} onChange={setViewMode} />

      {filteredStocks.length === 0 ? (
        <EmptyCategory categoryLabel={CATEGORY_LABELS[category]} />
      ) : viewMode === "overview" ? (
        <OverviewList
          stocks={filteredStocks}
          sortMode={sortMode}
          isWatchlisted={isWatchlisted}
          onToggleWatchlist={toggle}
        />
      ) : (
        <StockList
          stocks={filteredStocks}
          sortMode={sortMode}
          isWatchlisted={isWatchlisted}
          onToggleWatchlist={toggle}
        />
      )}
    </div>
  );
}
