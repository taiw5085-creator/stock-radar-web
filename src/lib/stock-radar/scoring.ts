import type {
  RawStockData,
  ScoredStock,
  StockConditions,
  StockLabel,
} from "./types";

const VOLUME_SURGE_RATIO = 1.5;
const MIN_GAIN_PERCENT = 3;
const POINTS_PER_CONDITION = 25;

/** 依四項條件計算飆股分數（每項 25 分，滿分 100） */
export function evaluateConditions(data: RawStockData): StockConditions {
  const volumeSurge = data.volume > data.avgVolume20 * VOLUME_SURGE_RATIO;
  const breakoutHigh20 = data.closePrice > data.high20;
  const bullishMA =
    data.closePrice > data.ma5 &&
    data.ma5 > data.ma10 &&
    data.ma10 > data.ma20;
  const strongGain = data.changePercent > MIN_GAIN_PERCENT;

  return { volumeSurge, breakoutHigh20, bullishMA, strongGain };
}

export function calculateScore(conditions: StockConditions): number {
  const metCount = Object.values(conditions).filter(Boolean).length;
  return metCount * POINTS_PER_CONDITION;
}

/** 依分數回傳判斷標籤 */
export function getStockLabel(score: number): StockLabel {
  if (score === 100) return "強勢飆股候選";
  if (score === 75) return "觀察突破";
  if (score === 50) return "條件普通";
  return "暫不追蹤";
}

/** 將原始資料轉為含分數的完整股票物件 */
export function scoreStock(data: RawStockData): ScoredStock {
  const conditions = evaluateConditions(data);
  const score = calculateScore(conditions);

  return {
    ...data,
    volumeMultiplier: data.volume / data.avgVolume20,
    brokeHigh20: conditions.breakoutHigh20,
    isBullishMA: conditions.bullishMA,
    conditions,
    score,
    label: getStockLabel(score),
  };
}

/** 依分數由高到低排序 */
export function sortByScore(stocks: ScoredStock[]): ScoredStock[] {
  return [...stocks].sort((a, b) => b.score - a.score);
}
