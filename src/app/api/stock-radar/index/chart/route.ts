import { NextResponse } from "next/server";
import { fetchIndexChartSeries } from "@/lib/stock-radar/index-chart-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const series = await fetchIndexChartSeries();
  return NextResponse.json(series);
}
