import type { LiveQuote } from "./live-types";
import type { IndexQuote } from "./index-types";
import {
  TAIEX_DISPLAY_NAME,
  TAIEX_FINMIND_ID,
} from "./index-constants";
import { fetchYahooIndexQuote } from "./yahoo";

function buildMockIndexQuote(): IndexQuote {
  const previousClose = 22500;
  const price = previousClose + (Math.random() - 0.45) * 120;
  const changePoints = price - previousClose;
  const changePercent = (changePoints / previousClose) * 100;

  return {
    symbol: TAIEX_FINMIND_ID,
    name: TAIEX_DISPLAY_NAME,
    price,
    changePoints,
    changePercent,
    volume: 180_000_000_000 + Math.floor(Math.random() * 20_000_000_000),
    previousClose,
    quoteSource: "mock",
  };
}

function liveQuoteToIndex(quote: LiveQuote, source: IndexQuote["quoteSource"]): IndexQuote {
  const changePoints = quote.price - quote.previousClose;
  return {
    symbol: TAIEX_FINMIND_ID,
    name: TAIEX_DISPLAY_NAME,
    price: quote.price,
    changePoints,
    changePercent: quote.changePercent,
    volume: quote.volume,
    previousClose: quote.previousClose,
    quoteSource: source,
  };
}

/** 取得加權指數即時報價（Yahoo → mock） */
export async function fetchIndexQuote(): Promise<IndexQuote> {
  const yahoo = await fetchYahooIndexQuote();
  if (yahoo) return liveQuoteToIndex(yahoo, "yahoo");
  return buildMockIndexQuote();
}

export { buildMockIndexQuote };
