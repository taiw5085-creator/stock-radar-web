import type { QuoteSource } from "@/lib/stock-radar/types";

const sourceLabels: Record<QuoteSource, string> = {
  yahoo: "Yahoo",
  finmind: "FinMind",
  mock: "Mock",
};

const sourceStyles: Record<QuoteSource, string> = {
  yahoo: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  finmind: "bg-sky-50 text-sky-700 ring-sky-200",
  mock: "bg-zinc-100 text-zinc-500 ring-zinc-200",
};

interface QuoteSourceBadgeProps {
  source: QuoteSource;
  className?: string;
}

export function QuoteSourceBadge({ source, className = "" }: QuoteSourceBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${sourceStyles[source]} ${className}`}
      title={`即時資料：${sourceLabels[source]}`}
    >
      {sourceLabels[source]}
    </span>
  );
}

export function formatQuoteSourceLabel(source: QuoteSource): string {
  return sourceLabels[source];
}
