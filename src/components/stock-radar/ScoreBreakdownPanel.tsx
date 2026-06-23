"use client";

import type { ScoredStock } from "@/lib/stock-radar/types";

interface ScoreBreakdownPanelProps {
  stock: ScoredStock;
}

export function ScoreBreakdownPanel({ stock }: ScoreBreakdownPanelProps) {
  const groups = [
    { title: "基礎條件", filter: (id: string) => id.startsWith("v1-") },
    { title: "主力籌碼", filter: (id: string) => id.startsWith("chip-") },
    { title: "爆量轉強", filter: (id: string) => id.startsWith("vol-") },
    {
      title: "突破 / 均線",
      filter: (id: string) =>
        id.startsWith("breakout-") || id.startsWith("ma-"),
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-zinc-800">分數細項</h3>
      {groups.map((group) => {
        const items = stock.scoreBreakdown.items.filter((item) =>
          group.filter(item.id)
        );
        if (items.length === 0) return null;

        return (
          <div key={group.title} className="rounded-xl bg-zinc-50 p-3">
            <p className="text-xs font-semibold text-zinc-500">{group.title}</p>
            <ul className="mt-2 space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <div className="flex items-start gap-1.5">
                    <span>{item.met ? "✅" : "⚪"}</span>
                    <div>
                      <p className="text-zinc-800">{item.label}</p>
                      <p className="text-xs text-zinc-500">{item.detail}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 font-bold tabular-nums ${
                      item.met ? "text-emerald-600" : "text-zinc-400"
                    }`}
                  >
                    {item.points}/{item.maxPoints}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
