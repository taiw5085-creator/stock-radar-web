import { getSpotlightTags } from "./categories";
import type { ScoredStock } from "./types";
import { formatNetBuy, formatPercent, formatPrice } from "./format";

export interface AiAnalysisSection {
  title: string;
  content: string;
  tone: "positive" | "neutral" | "warning";
}

export interface AiAnalysisResult {
  summary: string;
  sections: AiAnalysisSection[];
  score: number;
  label: string;
}

function toneFromScore(score: number): AiAnalysisSection["tone"] {
  if (score >= 170) return "positive";
  if (score >= 90) return "neutral";
  return "warning";
}

/** 規則式 AI 判讀（無外部 API） */
export function buildAiAnalysis(stock: ScoredStock): AiAnalysisResult {
  const tags = getSpotlightTags(stock);
  const tagText = tags.length > 0 ? tags.join("、") : "無特殊標籤";

  const sections: AiAnalysisSection[] = [
    {
      title: "量價結構",
      tone: stock.conditions.volumeSurge ? "positive" : "neutral",
      content: stock.conditions.volumeSurge
        ? `成交量為 20 日均量 ${stock.volumeMultiplier.toFixed(1)} 倍，量能明顯放大。`
        : `量能倍數 ${stock.volumeMultiplier.toFixed(1)}x，尚未達爆量標準（1.5x）。`,
    },
    {
      title: "突破狀態",
      tone: stock.liveBreakout || stock.brokeHigh20 ? "positive" : "neutral",
      content:
        stock.liveBreakout && stock.quoteSource === "yahoo"
          ? `即時價 ${formatPrice(stock.closePrice)} 已突破 20 日高 ${formatPrice(stock.high20)}。`
          : stock.brokeHigh20
            ? `收盤價已突破 20 日高點 ${formatPrice(stock.high20)}。`
            : `距 20 日高 ${formatPrice(stock.high20)} 尚有距離，需觀察能否有效突破。`,
    },
    {
      title: "均線排列",
      tone: stock.isMaStructure ? "positive" : "neutral",
      content: stock.isMaStructure
        ? `均線多頭結構完整（5>10>20>60），MA5 ${formatPrice(stock.ma5)}。`
        : `均線尚未形成完整多頭，MA20 ${formatPrice(stock.ma20)}、MA60 ${formatPrice(stock.ma60)}。`,
    },
    {
      title: "籌碼動向",
      tone:
        stock.foreignConsecutiveBuyDays >= 3 || stock.trustConsecutiveBuyDays >= 3
          ? "positive"
          : "neutral",
      content: `外資今日 ${formatNetBuy(stock.foreignNetToday)}，連買 ${stock.foreignConsecutiveBuyDays} 天；投信 ${formatNetBuy(stock.trustNetToday)}，連買 ${stock.trustConsecutiveBuyDays} 天。`,
    },
    {
      title: "風險提示",
      tone: stock.changePercent > 7 ? "warning" : "neutral",
      content:
        stock.changePercent > 7
          ? `今日漲幅 ${formatPercent(stock.changePercent)} 偏高，追價風險增加。`
          : stock.liveVolumeSurge && !stock.liveBreakout
            ? "爆量但未突破，可能是換手或試盤，需確認能否站穩。"
            : "目前無明顯過熱訊號，但仍需搭配大盤與個股消息。",
    },
  ];

  const summary = `${stock.symbol} ${stock.name} 綜合評分 ${stock.score} 分（${stock.label}）。今日 ${formatPercent(stock.changePercent)}，標籤：${tagText}。資料來源：歷史 FinMind / 即時 ${stock.quoteSource === "yahoo" ? "Yahoo" : stock.quoteSource === "finmind" ? "FinMind" : "Mock"}。`;

  return {
    summary,
    sections,
    score: stock.score,
    label: stock.label,
  };
}
