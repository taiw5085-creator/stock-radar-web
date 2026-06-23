import { NextResponse } from "next/server";
import { fetchIndexQuote } from "@/lib/stock-radar/index-quote";

export const dynamic = "force-dynamic";

export async function GET() {
  const quote = await fetchIndexQuote();
  return NextResponse.json(quote);
}
