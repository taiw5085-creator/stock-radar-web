import type { LiveQuote } from "./live-types";

const YAHOO_CHART_API = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YahooChartMeta {
  regularMarketPrice?: number;
  regularMarketVolume?: number;
  regularMarketDayHigh?: number;
  previousClose?: number;
  chartPreviousClose?: number;
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: YahooChartMeta;
    } | null> | null;
    error?: { description?: string } | null;
  };
}

function parseYahooMeta(symbol: string, meta: YahooChartMeta): LiveQuote | null {
  const price = meta.regularMarketPrice;
  const previousClose = meta.previousClose ?? meta.chartPreviousClose;

  if (price == null || previousClose == null || previousClose <= 0) {
    return null;
  }

  const changePercent = ((price - previousClose) / previousClose) * 100;

  return {
    symbol,
    price,
    volume: meta.regularMarketVolume ?? 0,
    changePercent,
    todayHigh: meta.regularMarketDayHigh ?? price,
    previousClose,
  };
}

/** 抓取單一台股 Yahoo 即時報價（先 .TW 再 .TWO） */
export async function fetchYahooQuote(stockId: string): Promise<LiveQuote | null> {
  for (const suffix of [".TW", ".TWO"] as const) {
    try {
      const url = `${YAHOO_CHART_API}/${stockId}${suffix}?interval=1d&range=1d`;
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; stock-radar-web/1.0; +https://github.com/taiw5085-creator/stock-radar-web)",
        },
        cache: "no-store",
      });

      if (!response.ok) continue;

      const json = (await response.json()) as YahooChartResponse;
      const meta = json.chart?.result?.[0]?.meta;
      if (!meta) continue;

      const quote = parseYahooMeta(stockId, meta);
      if (quote) return quote;
    } catch (error) {
      console.warn(`[Yahoo] ${stockId}${suffix} 失敗:`, error);
    }
  }

  return null;
}

/** 抓取加權指數 Yahoo 即時報價（^TWII） */
export async function fetchYahooIndexQuote(): Promise<LiveQuote | null> {
  try {
    const url = `${YAHOO_CHART_API}/${encodeURIComponent("^TWII")}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; stock-radar-web/1.0; +https://github.com/taiw5085-creator/stock-radar-web)",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const json = (await response.json()) as YahooChartResponse;
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;

    return parseYahooMeta("TAIEX", meta);
  } catch (error) {
    console.warn("[Yahoo] ^TWII 失敗:", error);
    return null;
  }
}

/** 批次抓取 Yahoo 即時報價 */
export async function fetchYahooQuotesBatch(
  stockIds: readonly string[]
): Promise<Map<string, LiveQuote>> {
  const results = await Promise.all(
    stockIds.map(async (id) => {
      const quote = await fetchYahooQuote(id);
      return quote ? ([id, quote] as const) : null;
    })
  );

  return new Map(
    results.filter((item): item is [string, LiveQuote] => item !== null)
  );
}
