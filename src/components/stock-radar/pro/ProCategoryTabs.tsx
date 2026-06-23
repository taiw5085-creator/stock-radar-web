"use client";

import type { ProCategoryKey } from "@/lib/stock-radar/types";
import { PRO_CATEGORY_LABELS } from "@/lib/stock-radar/pro-categories";

interface ProCategoryTabsProps {
  active: ProCategoryKey;
  onChange: (key: ProCategoryKey) => void;
  counts: Record<ProCategoryKey, number>;
}

const KEYS: ProCategoryKey[] = [
  "top10",
  "breakout",
  "volumeNotSpiked",
  "accumulation",
];

export function ProCategoryTabs({
  active,
  onChange,
  counts,
}: ProCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            active === key
              ? "bg-emerald-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {PRO_CATEGORY_LABELS[key]}
          <span className="ml-1 opacity-70">({counts[key]})</span>
        </button>
      ))}
    </div>
  );
}
