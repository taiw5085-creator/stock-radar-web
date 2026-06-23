/** 數字格式化工具 — 供畫面顯示使用 */

export function formatPrice(value: number): string {
  return value.toLocaleString("zh-TW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** 指數漲跌點數 */
export function formatChangePoints(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString("zh-TW");
}

/** 成交量（張）— 台股 1 張 = 1000 股 */
export function formatVolumeLots(shares: number): string {
  const lots = Math.round(shares / 1000);
  return `${lots.toLocaleString("zh-TW")} 張`;
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}

/** 買賣超格式化（股） */
export function formatNetBuy(value: number): string {
  const sign = value > 0 ? "+" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${sign}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(value / 1_000).toFixed(1)}K`;
  }
  return `${sign}${value.toLocaleString("zh-TW")}`;
}
