import { getScoreTier } from "./StockBadge";

interface DecisionLightProps {
  score: number;
  size?: "sm" | "md";
}

const dotSize = { sm: "h-2.5 w-2.5", md: "h-3 w-3" };

/** 決策燈號：依 v2 總分顯示顏色 */
export function DecisionLight({ score, size = "md" }: DecisionLightProps) {
  const tier = getScoreTier(score);

  const dotColor =
    score >= 170
      ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
      : score >= 130
        ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
        : score >= 90
          ? "bg-slate-400"
          : "bg-zinc-300";

  return (
    <span
      className={`inline-block shrink-0 rounded-full ${dotSize[size]} ${dotColor}`}
      title={tier.label}
      aria-label={`決策：${tier.label}`}
    />
  );
}
