"use client";

import { useState } from "react";
import type { ScoredStock } from "@/lib/stock-radar/types";
import {
  formatMultiplier,
  formatPercent,
  formatPrice,
  formatVolume,
} from "@/lib/stock-radar/format";
import { buildConditionReasons } from "./condition-reasons";
import { ScoreBadge, StockLabelBadge } from "./StockBadge";

interface StockCardProps {
  stock: ScoredStock;
}

function MetricBlock({
  label,
  value,
  valueClassName = "text-zinc-900",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 px-4 py-3">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-bold tabular-nums ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <span
        className={`text-sm font-semibold ${
          positive ? "text-emerald-600" : "text-zinc-400"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function StockCard({ stock }: StockCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isUp = stock.changePercent > 0;
  const isDown = stock.changePercent < 0;
  const reasons = buildConditionReasons(stock);

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/80">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-zinc-900">{stock.symbol}</h2>
          <p className="mt-0.5 text-base font-medium text-zinc-600">
            {stock.name}
          </p>
          <div className="mt-3">
            <StockLabelBadge label={stock.label} />
          </div>
        </div>
        <ScoreBadge score={stock.score} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricBlock
          label="今日漲幅"
          value={formatPercent(stock.changePercent)}
          valueClassName={
            isUp ? "text-red-500" : isDown ? "text-emerald-600" : "text-zinc-700"
          }
        />
        <MetricBlock
          label="量能放大"
          value={formatMultiplier(stock.volumeMultiplier)}
          valueClassName="text-blue-600"
        />
      </div>

      <div className="mt-3 space-y-2">
        <StatusRow
          label="突破狀態"
          value={stock.brokeHigh20 ? "已突破 20 日高" : "尚未突破"}
          positive={stock.brokeHigh20}
        />
        <StatusRow
          label="均線狀態"
          value={stock.isBullishMA ? "多頭排列" : "尚未多頭"}
          positive={stock.isBullishMA}
        />
      </div>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200/80"
      >
        {expanded ? "收起詳情" : "查看詳情"}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl bg-zinc-50 p-4">
            <h3 className="text-sm font-bold text-zinc-800">為什麼被選出？</h3>
            <ul className="mt-3 space-y-2.5">
              {reasons.map((reason) => (
                <li
                  key={reason.text}
                  className="flex items-start gap-2 text-sm leading-relaxed"
                >
                  <span className="shrink-0 text-base leading-5">
                    {reason.met ? "✅" : "⚠️"}
                  </span>
                  <span
                    className={reason.met ? "text-zinc-800" : "text-zinc-500"}
                  >
                    {reason.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-zinc-800">完整數據</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["收盤價", formatPrice(stock.closePrice)],
                ["成交量", formatVolume(stock.volume)],
                ["20 日均量", formatVolume(stock.avgVolume20)],
                ["20 日高點", formatPrice(stock.high20)],
                ["5 日線", formatPrice(stock.ma5)],
                ["10 日線", formatPrice(stock.ma10)],
                ["20 日線", formatPrice(stock.ma20)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col rounded-lg bg-zinc-50 px-3 py-2"
                >
                  <dt className="text-zinc-500">{label}</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-zinc-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </article>
  );
}
