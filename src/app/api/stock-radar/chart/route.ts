import { NextResponse } from "next/server";
import { fetchChartSeries } from "@/lib/stock-radar/chart-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim();

  if (!symbol) {
    return NextResponse.json({ error: "缺少 symbol 參數" }, { status: 400 });
  }

  const series = await fetchChartSeries(symbol);
  return NextResponse.json(series);
}
