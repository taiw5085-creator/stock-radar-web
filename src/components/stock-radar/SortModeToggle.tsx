"use client";

import type { SortMode } from "@/lib/stock-radar/types";
import { SORT_MODE_LABELS } from "@/lib/stock-radar/sort-stocks";

interface SortModeToggleProps {
  mode: SortMode;
  onChange: (mode: SortMode) => void;
}

const MODES: SortMode[] = ["momentum", "chip", "volumeBreakout", "readyRise"];

export function SortModeToggle({ mode, onChange }: SortModeToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
            mode === m
              ? "bg-zinc-900 text-white shadow-sm"
              : "bg-white text-zinc-600 ring-1 ring-zinc-200"
          }`}
        >
          {SORT_MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
