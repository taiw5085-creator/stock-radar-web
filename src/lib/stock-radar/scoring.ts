import type { RawStockData, ScoreBreakdown, ScoreBreakdownItem, ScoredStock, StockConditions, StockLabel } from "./types";

const VOLUME_SURGE_RATIO = 1.5;
const MIN_GAIN_V1 = 3;
const MIN_GAIN_V2 = 4;
const VOLUME_VS_YESTERDAY_RATIO = 1.8;
const CONSECUTIVE_BUY_DAYS = 3;
const CONSOLIDATION_RANGE_PCT = 8;

/** v1 四項條件（保留原邏輯） */
export function evaluateConditions(data: RawStockData): StockConditions {
  const volumeSurge = data.volume > data.avgVolume20 * VOLUME_SURGE_RATIO;
  const breakoutHigh20 = data.closePrice > data.high20;
  const bullishMA =
    data.closePrice > data.ma5 &&
    data.ma5 > data.ma10 &&
    data.ma10 > data.ma20;
  const strongGain = data.changePercent > MIN_GAIN_V1;

  return { volumeSurge, breakoutHigh20, bullishMA, strongGain };
}

function buildV1Items(data: RawStockData, conditions: StockConditions): ScoreBreakdownItem[] {
  return [
    {
      id: "v1-volume",
      category: "v1",
      label: "量增（>20日均量1.5倍）",
      points: conditions.volumeSurge ? 25 : 0,
      maxPoints: 25,
      met: conditions.volumeSurge,
      detail: `今日量 / 20日均量 = ${(data.volume / data.avgVolume20).toFixed(2)}x`,
    },
    {
      id: "v1-breakout20",
      category: "v1",
      label: "突破 20 日高點",
      points: conditions.breakoutHigh20 ? 25 : 0,
      maxPoints: 25,
      met: conditions.breakoutHigh20,
      detail: conditions.breakoutHigh20 ? "收盤價已突破" : "尚未突破",
    },
    {
      id: "v1-ma",
      category: "v1",
      label: "均線多頭（收>5>10>20）",
      points: conditions.bullishMA ? 25 : 0,
      maxPoints: 25,
      met: conditions.bullishMA,
      detail: conditions.bullishMA ? "均線多頭排列" : "尚未多頭",
    },
    {
      id: "v1-gain",
      category: "v1",
      label: "漲幅 > 3%",
      points: conditions.strongGain ? 25 : 0,
      maxPoints: 25,
      met: conditions.strongGain,
      detail: `今日漲幅 ${data.changePercent.toFixed(2)}%`,
    },
  ];
}

function buildV2Items(data: RawStockData): ScoreBreakdownItem[] {
  const foreignBuy3 = data.foreignConsecutiveBuyDays >= CONSECUTIVE_BUY_DAYS;
  const trustBuy3 = data.trustConsecutiveBuyDays >= CONSECUTIVE_BUY_DAYS;
  const volumeVsYesterday =
    data.yesterdayVolume > 0 &&
    data.volume > data.yesterdayVolume * VOLUME_VS_YESTERDAY_RATIO;
  const gainOver4 = data.changePercent > MIN_GAIN_V2;
  const maStructure =
    data.ma5 > data.ma10 && data.ma10 > data.ma20 && data.ma20 > data.ma60;

  return [
    {
      id: "chip-foreign",
      category: "chip",
      label: "外資連買 3 天",
      points: foreignBuy3 ? 20 : 0,
      maxPoints: 20,
      met: foreignBuy3,
      detail: `外資連買 ${data.foreignConsecutiveBuyDays} 天`,
    },
    {
      id: "chip-trust",
      category: "chip",
      label: "投信連買 3 天",
      points: trustBuy3 ? 20 : 0,
      maxPoints: 20,
      met: trustBuy3,
      detail: `投信連買 ${data.trustConsecutiveBuyDays} 天`,
    },
    {
      id: "vol-yesterday",
      category: "volume",
      label: "今日量 > 昨日 1.8 倍",
      points: volumeVsYesterday ? 15 : 0,
      maxPoints: 15,
      met: volumeVsYesterday,
      detail:
        data.yesterdayVolume > 0
          ? `倍數 ${(data.volume / data.yesterdayVolume).toFixed(2)}x`
          : "無昨日量資料",
    },
    {
      id: "vol-gain4",
      category: "volume",
      label: "今日漲幅 > 4%",
      points: gainOver4 ? 15 : 0,
      maxPoints: 15,
      met: gainOver4,
      detail: `今日漲幅 ${data.changePercent.toFixed(2)}%`,
    },
    {
      id: "breakout-consolidation",
      category: "breakout",
      label: "近 10 日橫盤後突破",
      points: data.consolidationBreakout ? 20 : 0,
      maxPoints: 20,
      met: data.consolidationBreakout,
      detail: data.consolidationBreakout ? "橫盤整理後突破" : "未符合",
    },
    {
      id: "ma-structure",
      category: "ma",
      label: "均線結構 5>10>20>60",
      points: maStructure ? 20 : 0,
      maxPoints: 20,
      met: maStructure,
      detail: maStructure ? "均線結構完整" : "尚未成立",
    },
  ];
}

function buildSortScores(items: ScoreBreakdownItem[], total: number): ScoreBreakdown["sortScores"] {
  const sum = (ids: string[]) =>
    items.filter((i) => ids.includes(i.id)).reduce((s, i) => s + i.points, 0);

  const chip = sum(["chip-foreign", "chip-trust"]);
  const volumeBreakout = sum([
    "vol-yesterday",
    "vol-gain4",
    "breakout-consolidation",
    "v1-volume",
    "v1-breakout20",
  ]);
  const readyRise = sum(["ma-structure", "breakout-consolidation", "chip-foreign", "chip-trust"]);

  return {
    momentum: total,
    chip,
    volumeBreakout,
    readyRise,
  };
}

export function buildScoreBreakdown(
  data: RawStockData,
  conditions: StockConditions
): ScoreBreakdown {
  const items = [...buildV1Items(data, conditions), ...buildV2Items(data)];
  const total = items.reduce((sum, item) => sum + item.points, 0);

  return {
    items,
    total,
    sortScores: buildSortScores(items, total),
  };
}

export function getStockLabel(score: number): StockLabel {
  if (score >= 170) return "強勢飆股候選";
  if (score >= 130) return "觀察突破";
  if (score >= 90) return "條件普通";
  return "暫不追蹤";
}

export function scoreStock(data: RawStockData): ScoredStock {
  const conditions = evaluateConditions(data);
  const scoreBreakdown = buildScoreBreakdown(data, conditions);
  const isMaStructure =
    data.ma5 > data.ma10 && data.ma10 > data.ma20 && data.ma20 > data.ma60;

  return {
    ...data,
    volumeMultiplier: data.avgVolume20 > 0 ? data.volume / data.avgVolume20 : 0,
    volumeVsYesterday:
      data.yesterdayVolume > 0 ? data.volume / data.yesterdayVolume : 0,
    brokeHigh20: conditions.breakoutHigh20,
    isBullishMA: conditions.bullishMA,
    isMaStructure,
    conditions,
    score: scoreBreakdown.total,
    scoreBreakdown,
    label: getStockLabel(scoreBreakdown.total),
  };
}

export function sortByScore(stocks: ScoredStock[]): ScoredStock[] {
  return [...stocks].sort((a, b) => b.score - a.score);
}
