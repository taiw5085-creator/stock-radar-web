import type { ScoredStock } from "@/lib/stock-radar/types";

export function buildRiskHint(stock: ScoredStock): string {
  const warnings: string[] = [];

  if (!stock.conditions.breakoutHigh20) warnings.push("未突破");
  if (!stock.conditions.bullishMA) warnings.push("均線弱");
  if (!stock.conditions.volumeSurge) warnings.push("量能不足");
  if (!stock.conditions.strongGain) warnings.push("漲幅不足");
  if (stock.foreignNetToday < 0) warnings.push("外資賣超");
  if (stock.trustNetToday < 0) warnings.push("投信賣超");

  if (warnings.length === 0) return "無";
  return warnings.join("、");
}

export function hasRisk(stock: ScoredStock): boolean {
  return buildRiskHint(stock) !== "無";
}
