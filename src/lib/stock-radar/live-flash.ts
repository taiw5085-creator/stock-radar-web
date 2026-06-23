import type { ScoredStock } from "./types";

export type LiveFlashField = "price" | "changePercent" | "volume" | "score";

export type LiveFlashMap = Map<string, Set<LiveFlashField>>;

/** 比對前後資料，找出有變動的欄位 */
export function detectLiveChanges(
  prev: ScoredStock[],
  next: ScoredStock[]
): LiveFlashMap {
  const changes: LiveFlashMap = new Map();
  const prevMap = new Map(prev.map((s) => [s.symbol, s]));

  for (const stock of next) {
    const old = prevMap.get(stock.symbol);
    if (!old) continue;

    const fields = new Set<LiveFlashField>();
    if (old.closePrice !== stock.closePrice) fields.add("price");
    if (old.changePercent !== stock.changePercent) fields.add("changePercent");
    if (old.volume !== stock.volume) fields.add("volume");
    if (old.score !== stock.score) fields.add("score");

    if (fields.size > 0) changes.set(stock.symbol, fields);
  }

  return changes;
}

export function isFieldFlashing(
  flashMap: LiveFlashMap,
  symbol: string,
  field: LiveFlashField
): boolean {
  return flashMap.get(symbol)?.has(field) ?? false;
}
