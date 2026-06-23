"use client";

import { useState } from "react";
import type { ScoredStock } from "@/lib/stock-radar/types";
import { ModeToggle } from "./ModeToggle";
import { OverviewList } from "./OverviewList";
import { StockList } from "./StockList";

interface StockRadarViewProps {
  stocks: ScoredStock[];
}

export function StockRadarView({ stocks }: StockRadarViewProps) {
  const [mode, setMode] = useState<"overview" | "card">("overview");

  return (
    <div className="space-y-4">
      <ModeToggle mode={mode} onChange={setMode} />
      {mode === "overview" ? (
        <OverviewList stocks={stocks} />
      ) : (
        <StockList stocks={stocks} />
      )}
    </div>
  );
}
