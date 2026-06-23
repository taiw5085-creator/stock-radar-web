import type { LiveFlashField } from "@/lib/stock-radar/live-flash";
import type { IndexQuote } from "@/lib/stock-radar/index-types";

export function detectIndexQuoteChanges(
  prev: IndexQuote | null,
  next: IndexQuote
): Set<LiveFlashField> {
  if (!prev) return new Set();
  const fields = new Set<LiveFlashField>();
  if (prev.price !== next.price) fields.add("price");
  if (prev.changePercent !== next.changePercent) fields.add("changePercent");
  if (prev.volume !== next.volume) fields.add("volume");
  return fields;
}
