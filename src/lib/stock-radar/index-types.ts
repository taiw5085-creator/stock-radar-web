import type { QuoteSource } from "./live-types";
import { TAIEX_FINMIND_ID } from "./index-constants";

/** 加權指數即時報價 */
export interface IndexQuote {
  symbol: typeof TAIEX_FINMIND_ID;
  name: string;
  price: number;
  changePoints: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  quoteSource: QuoteSource;
}
