import type { ScoredStock } from "@/lib/stock-radar/types";
import { formatPercent } from "@/lib/stock-radar/format";

export interface ConditionReason {
  met: boolean;
  text: string;
}

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
    {
      met: stock.foreignConsecutiveBuyDays >= 3,
      text:
        stock.foreignConsecutiveBuyDays >= 3
          ? `外資連買 ${stock.foreignConsecutiveBuyDays} 天`
          : `外資連買 ${stock.foreignConsecutiveBuyDays} 天（未達 3 天）`,
    },
    {
      met: stock.trustConsecutiveBuyDays >= 3,
      text:
        stock.trustConsecutiveBuyDays >= 3
          ? `投信連買 ${stock.trustConsecutiveBuyDays} 天`
          : `投信連買 ${stock.trustConsecutiveBuyDays} 天（未達 3 天）`,
    },
    {
      met: stock.consolidationBreakout,
      text: stock.consolidationBreakout
        ? "近 10 日橫盤後突破"
        : "尚未出現整理突破",
    },
    {
      met: stock.isMaStructure,
      text: stock.isMaStructure
        ? "均線結構 5>10>20>60"
        : "均線結構尚未完整",
    },
  ];
}
