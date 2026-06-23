import { NextResponse } from "next/server";
import { fetchYahooQuotesBatch } from "@/lib/stock-radar/yahoo";
import type { QuotesApiResponse } from "@/lib/stock-radar/live-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("symbols") ?? "";
  const symbols = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({
      ok: true,
      yahooCount: 0,
      total: 0,
      quotes: {},
      failed: [],
    } satisfies QuotesApiResponse);
  }

  try {
    const quoteMap = await fetchYahooQuotesBatch(symbols);
    const quotes = Object.fromEntries(quoteMap);
    const yahooCount = quoteMap.size;
    const failed = symbols.filter((s) => !quoteMap.has(s));

    const payload: QuotesApiResponse = {
      ok: yahooCount > 0,
      yahooCount,
      total: symbols.length,
      quotes,
      failed,
    };

    if (yahooCount === 0) {
      payload.message = "Yahoo 即時資料暫時失敗，使用最近一次資料";
    } else if (failed.length > 0) {
      payload.message = `Yahoo 部分失敗（${failed.length}/${symbols.length}），其餘使用 FinMind fallback`;
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[quotes API] Yahoo 失敗:", error);
    return NextResponse.json({
      ok: false,
      yahooCount: 0,
      total: symbols.length,
      quotes: {},
      failed: symbols,
      message: "Yahoo 即時資料暫時失敗，使用最近一次資料",
    } satisfies QuotesApiResponse);
  }
}
