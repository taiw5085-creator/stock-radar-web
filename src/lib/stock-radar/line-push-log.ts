import type { LiveSignal } from "./live-signals";

export interface LinePushEntry {
  id: string;
  symbol: string;
  title: string;
  body: string;
  sentAt: string;
  status: "delivered" | "pending" | "failed";
}

const MOCK_ENTRIES: LinePushEntry[] = [
  {
    id: "line-1",
    symbol: "2330",
    title: "即時突破提醒",
    body: "2330 台積電 即時價突破 20 日高",
    sentAt: new Date(Date.now() - 3600_000).toISOString(),
    status: "delivered",
  },
  {
    id: "line-2",
    symbol: "2382",
    title: "爆量未噴觀察",
    body: "2382 廣達 量能 1.8x，漲幅 +1.2%",
    sentAt: new Date(Date.now() - 7200_000).toISOString(),
    status: "delivered",
  },
  {
    id: "line-3",
    symbol: "3231",
    title: "吸籌型訊號",
    body: "3231 緯創 橫盤整理 + 均量放大",
    sentAt: new Date(Date.now() - 86400_000).toISOString(),
    status: "delivered",
  },
];

export function getInitialLinePushLog(): LinePushEntry[] {
  return MOCK_ENTRIES;
}

export function signalToLineEntry(signal: LiveSignal): LinePushEntry {
  return {
    id: `line-${signal.id}-${Date.now()}`,
    symbol: signal.symbol,
    title: `${signal.type === "liveBreakout" ? "即時突破" : signal.type === "liveVolumeSurge" ? "即時爆量" : "飆股訊號"}提醒`,
    body: signal.message,
    sentAt: new Date().toISOString(),
    status: "delivered",
  };
}

export function mergeLinePushLog(
  existing: LinePushEntry[],
  newSignals: LiveSignal[],
  maxEntries = 20
): LinePushEntry[] {
  const existingIds = new Set(existing.map((e) => e.body));
  const appended = newSignals
    .filter((s) => !existingIds.has(s.message))
    .map(signalToLineEntry);

  return [...appended, ...existing].slice(0, maxEntries);
}
