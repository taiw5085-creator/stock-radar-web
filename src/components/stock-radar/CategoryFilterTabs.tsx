"use client";

import type { CategoryKey } from "@/lib/stock-radar/types";
import { CATEGORY_LABELS } from "@/lib/stock-radar/categories";

const TAB_CONFIG: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "top10", label: "🔥 TOP 10" },
  { key: "breakout", label: "🚨 剛突破" },
  { key: "volumeFirst", label: "📈 量先出來" },
  { key: "accumulation", label: "🧠 吸籌型" },
  { key: "watchlist", label: "⭐ 自選股" },
];

interface CategoryFilterTabsProps {
  active: CategoryKey;
  onChange: (category: CategoryKey) => void;
  watchlistCount?: number;
}

export function CategoryFilterTabs({
  active,
  onChange,
  watchlistCount = 0,
}: CategoryFilterTabsProps) {
  return (
    <div className="-mx-1 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2 px-1">
        {TAB_CONFIG.map(({ key, label }) => {
          const displayLabel =
            key === "watchlist" && watchlistCount > 0
              ? `${label} (${watchlistCount})`
              : label;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                active === key
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200"
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
