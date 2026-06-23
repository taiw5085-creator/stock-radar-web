import type { ScoredStock } from "@/lib/stock-radar/types";
import { formatPercent } from "@/lib/stock-radar/format";

export interface ConditionReason {
  met: boolean;
  text: string;
}

/** 將四項條件轉成白話說明（僅供 UI 顯示，不影響計分） */
export function buildConditionReasons(stock: ScoredStock): ConditionReason[] {
  const { conditions, volumeMultiplier, changePercent } = stock;

  return [
    {
      met: conditions.volumeSurge,
      text: conditions.volumeSurge
        ? `成交量放大 ${volumeMultiplier.toFixed(1)} 倍`
        : `成交量尚未明顯放大（${volumeMultiplier.toFixed(1)} 倍）`,
    },
    {
      met: conditions.breakoutHigh20,
      text: conditions.breakoutHigh20
        ? "股價突破 20 日高點"
        : "尚未突破 20 日高點",
    },
    {
      met: conditions.bullishMA,
      text: conditions.bullishMA
        ? "均線呈現多頭排列"
        : "均線尚未多頭排列",
    },
    {
      met: conditions.strongGain,
      text: conditions.strongGain
        ? "今日漲幅超過 3%"
        : `今日漲幅未達 3%（${formatPercent(changePercent)}）`,
    },
  ];
}
