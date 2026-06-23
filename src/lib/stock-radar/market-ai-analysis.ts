import type { IndexQuote } from "./index-types";
import type { AiAnalysisResult, AiAnalysisSection } from "./ai-analysis";
import { formatChangePoints, formatPercent, formatPrice, formatVolume } from "./format";

/** 加權指數大盤判讀（規則式） */
export function buildMarketAiAnalysis(quote: IndexQuote): AiAnalysisResult {
  const { changePercent, changePoints, volume } = quote;

  let strengthLabel = "震盪整理";
  let strengthTone: AiAnalysisSection["tone"] = "neutral";
  if (changePercent >= 1) {
    strengthLabel = "強勢上攻";
    strengthTone = "positive";
  } else if (changePercent >= 0.3) {
    strengthLabel = "小幅走強";
    strengthTone = "positive";
  } else if (changePercent <= -1) {
    strengthLabel = "明顯走弱";
    strengthTone = "warning";
  } else if (changePercent <= -0.3) {
    strengthLabel = "小幅回檔";
    strengthTone = "warning";
  }

  let volumeLabel = "量能中性";
  let volumeTone: AiAnalysisSection["tone"] = "neutral";
  if (volume >= 200_000_000_000) {
    volumeLabel = "成交量能充沛，資金參與度高";
    volumeTone = "positive";
  } else if (volume >= 150_000_000_000) {
    volumeLabel = "成交量能正常";
  } else if (volume > 0) {
    volumeLabel = "成交量能偏低，追價意願有限";
    volumeTone = "warning";
  }

  let directionLabel = "多空拉鋸";
  let directionTone: AiAnalysisSection["tone"] = "neutral";
  if (changePercent > 0.5) {
    directionLabel = "多方掌控，短線偏多思考";
    directionTone = "positive";
  } else if (changePercent < -0.5) {
    directionLabel = "空方占優，短線偏保守";
    directionTone = "warning";
  }

  let riskContent = "大盤波動在正常範圍，留意國際消息面。";
  let riskTone: AiAnalysisSection["tone"] = "neutral";
  if (Math.abs(changePercent) >= 1.5) {
    riskContent = `大盤單日波動 ${formatPercent(changePercent)} 偏大，短線追價風險升高。`;
    riskTone = "warning";
  } else if (changePercent > 0 && volume < 120_000_000_000) {
    riskContent = "指數走強但量能不足，需防拉高後拉回。";
    riskTone = "warning";
  }

  const sections: AiAnalysisSection[] = [
    {
      title: "今日大盤強弱",
      tone: strengthTone,
      content: `${strengthLabel}。加權指數 ${formatPrice(quote.price)}，${formatChangePoints(changePoints)}（${formatPercent(changePercent)}）。`,
    },
    {
      title: "成交量能",
      tone: volumeTone,
      content: `${volumeLabel}。今日成交量 ${formatVolume(volume)}。`,
    },
    {
      title: "多空方向",
      tone: directionTone,
      content: directionLabel,
    },
    {
      title: "風險提醒",
      tone: riskTone,
      content: riskContent,
    },
  ];

  const summary = `加權指數 ${formatPrice(quote.price)}，${formatChangePoints(changePoints)}（${formatPercent(changePercent)}）。${strengthLabel}，${volumeLabel.split("，")[0]}。`;

  return {
    summary,
    sections,
    score: Math.round(50 + changePercent * 10),
    label: strengthLabel,
  };
}
