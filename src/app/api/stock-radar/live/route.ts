import { NextResponse } from "next/server";
import { fetchWatchlistRawStocks } from "@/lib/stock-radar/finmind";
import { applyLiveQuote } from "@/lib/stock-radar/merge-live";
import { fetchYahooQuotesBatch } from "@/lib/stock-radar/yahoo";
import { scoreStock } from "@/lib/stock-radar/scoring";
import type { ScoredStock } from "@/lib/stock-radar/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("symbols") ?? "";
  const symbols = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ stocks: [] satisfies ScoredStock[] });
  }

  let scored: ScoredStock[] = [];

  try {
    const rawStocks = await fetchWatchlistRawStocks();
    const filtered = rawStocks.filter((s) => symbols.includes(s.symbol));
    scored = filtered.map(scoreStock);
  } catch (error) {
    console.error("[live API] FinMind 失敗:", error);
    return NextResponse.json({ stocks: [] satisfies ScoredStock[] });
  }

  const yahooQuotes = await fetchYahooQuotesBatch(symbols);
  const withLive = scored.map((stock) =>
    applyLiveQuote(stock, yahooQuotes.get(stock.symbol) ?? null, "finmind")
  );

  return NextResponse.json({ stocks: withLive });
}
