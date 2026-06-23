import { getTopTen, isAccumulation } from "./categories";
import type { RadarListKey, ScoredStock } from "./types";

export const RADAR_LIST_LABELS: Record<RadarListKey, string> = {
  breakout: "🚨 剛突破",
  volumeNotSpiked: "📈 爆量未噴",
  accumulation: "🧠 吸籌型",
};

const VOLUME_SURGE_RATIO = 1.5;

/** 🚨 剛突破：即時價突破 20 日高 + 量能 > 20 日均量 1.5 倍 */
export function isLiveJustBreakout(stock: ScoredStock): boolean {
  return stock.liveBreakout && stock.volumeMultiplier >= VOLUME_SURGE_RATIO;
}

/** 📈 爆量未噴：量能 > 1.5x、漲幅 0~3%、尚未突破 20 日高 */
export function isLiveVolumeNotSpiked(stock: ScoredStock): boolean {
  return (
    stock.volumeMultiplier >= VOLUME_SURGE_RATIO &&
    stock.changePercent >= 0 &&
    stock.changePercent <= 3 &&
    !stock.liveBreakout
  );
}

/** 🧠 吸籌型：10 日震盪 < 8%、均量放大、今日漲幅 < 3% */
export function isProAccumulation(stock: ScoredStock): boolean {
  return (
    stock.priceRange10Pct < 8 &&
    stock.volumeTrendUp &&
    stock.changePercent < 3
  );
}

export function countRadarCategories(
  stocks: ScoredStock[]
): Record<RadarListKey, number> {
  return {
    breakout: stocks.filter(isLiveJustBreakout).length,
    volumeNotSpiked: stocks.filter(isLiveVolumeNotSpiked).length,
    accumulation: stocks.filter(isProAccumulation).length,
  };
}

export function filterByRadarCategory(
  stocks: ScoredStock[],
  category: RadarListKey
): ScoredStock[] {
  switch (category) {
    case "breakout":
      return stocks.filter(isLiveJustBreakout);
    case "volumeNotSpiked":
      return stocks.filter(isLiveVolumeNotSpiked);
    case "accumulation":
      return stocks.filter(isProAccumulation);
    default:
      return stocks;
  }
}

export { getTopTen, isAccumulation };
