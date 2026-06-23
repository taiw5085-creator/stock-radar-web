"use client";

import { useMemo } from "react";
import type { ScoredStock } from "@/lib/stock-radar/types";
import type { IndexQuote } from "@/lib/stock-radar/index-types";
import { buildAiAnalysis } from "@/lib/stock-radar/ai-analysis";
import { buildMarketAiAnalysis } from "@/lib/stock-radar/market-ai-analysis";
import { getSpotlightTags } from "@/lib/stock-radar/categories";
import { SpotlightTags } from "../SpotlightTags";
import { ScoreBreakdownPanel } from "../ScoreBreakdownPanel";
import type { ProMainViewMode } from "./ProChart";

interface ProAiPanelProps {
  viewMode: ProMainViewMode;
  stock: ScoredStock | null;
  indexQuote: IndexQuote | null;
}

const toneStyles = {
  positive: "border-emerald-500/30 bg-emerald-500/10",
  neutral: "border-slate-600/50 bg-slate-800/50",
  warning: "border-amber-500/30 bg-amber-500/10",
};

export function ProAiPanel({ viewMode, stock, indexQuote }: ProAiPanelProps) {
  const analysis = useMemo(() => {
    if (viewMode === "index" && indexQuote) {
      return buildMarketAiAnalysis(indexQuote);
    }
    if (viewMode === "stock" && stock) {
      return buildAiAnalysis(stock);
    }
    return null;
  }, [viewMode, stock, indexQuote]);

  const tags = useMemo(
    () => (stock ? getSpotlightTags(stock) : []),
    [stock]
  );

  if (!analysis) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 text-sm text-slate-500">
        載入 AI 判讀中…
      </section>
    );
  }

  const isIndex = viewMode === "index";

  return (
    <section className="flex h-full min-h-0 flex-col rounded-xl border border-slate-700/60 bg-slate-900/80">
      <div className="border-b border-slate-700/60 px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          AI 判讀
        </h2>
        <p className="mt-1 text-[10px] text-slate-500">
          {isIndex ? "大盤判讀" : "個股判讀"} · 規則式分析 · 非投資建議
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-lg bg-slate-800/80 p-3">
          <div className="flex items-center justify-between">
            {isIndex ? (
              <span className="text-lg font-bold text-emerald-400">加權指數</span>
            ) : (
              <span className="text-2xl font-bold text-emerald-400">
                {analysis.score}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-300">
              {analysis.label}
            </span>
          </div>
          {!isIndex && tags.length > 0 && (
            <SpotlightTags tags={tags} className="mt-2" />
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          {analysis.summary}
        </p>

        <div className="mt-4 space-y-2">
          {analysis.sections.map((section) => (
            <div
              key={section.title}
              className={`rounded-lg border px-3 py-2.5 ${toneStyles[section.tone]}`}
            >
              <p className="text-xs font-bold text-slate-200">{section.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {!isIndex && stock && (
          <div className="mt-4">
            <ScoreBreakdownPanel stock={stock} />
          </div>
        )}
      </div>
    </section>
  );
}
