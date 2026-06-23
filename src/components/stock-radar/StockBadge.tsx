import type { StockLabel } from "@/lib/stock-radar/types";

const labelStyles: Record<StockLabel, string> = {
  強勢飆股候選: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  觀察突破: "bg-amber-100 text-amber-800 ring-amber-200",
  條件普通: "bg-slate-100 text-slate-700 ring-slate-200",
  暫不追蹤: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

/** 依總分回傳視覺層級（v2 滿分 210） */
export function getScoreTier(score: number) {
  if (score >= 170) {
    return {
      label: "強勢",
      scoreClass: "text-emerald-600",
      bgClass: "bg-emerald-50 ring-emerald-100",
    };
  }
  if (score >= 130) {
    return {
      label: "觀察",
      scoreClass: "text-amber-600",
      bgClass: "bg-amber-50 ring-amber-100",
    };
  }
  if (score >= 90) {
    return {
      label: "普通",
      scoreClass: "text-slate-600",
      bgClass: "bg-slate-50 ring-slate-100",
    };
  }
  return {
    label: "低關注",
    scoreClass: "text-zinc-400",
    bgClass: "bg-zinc-50 ring-zinc-100",
  };
}

interface StockLabelBadgeProps {
  label: StockLabel;
}

export function StockLabelBadge({ label }: StockLabelBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${labelStyles[label]}`}
    >
      {label}
    </span>
  );
}

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const tier = getScoreTier(score);

  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center rounded-2xl px-4 py-3 ring-1 ${tier.bgClass}`}
    >
      <span className={`text-3xl font-bold tabular-nums leading-none ${tier.scoreClass}`}>
        {score}
      </span>
      <span className="mt-1 text-sm font-medium text-zinc-500">分</span>
      <span className={`mt-0.5 text-xs font-semibold ${tier.scoreClass}`}>
        {tier.label}
      </span>
    </div>
  );
}
