"use client";

import type { LiveSignal } from "@/lib/stock-radar/live-signals";
import { getSignalLabel } from "@/lib/stock-radar/live-signals";
import { formatPercent } from "@/lib/stock-radar/format";

interface ProLiveSignalsProps {
  signals: LiveSignal[];
  lastUpdated: Date | null;
  polling: boolean;
}

const typeStyles: Record<LiveSignal["type"], string> = {
  liveBreakout: "text-orange-400",
  liveVolumeSurge: "text-cyan-400",
  breakout: "text-red-400",
  volumeNotSpiked: "text-blue-400",
  accumulation: "text-purple-400",
};

export function ProLiveSignals({
  signals,
  lastUpdated,
  polling,
}: ProLiveSignalsProps) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-xl border border-slate-700/60 bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          即時訊號
        </h2>
        <span className="text-[10px] text-slate-500">
          {polling
            ? "更新中…"
            : lastUpdated
              ? `${lastUpdated.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} · 10秒`
              : "每 10 秒更新"}
        </span>
      </div>

      <ul className="flex-1 overflow-y-auto p-2">
        {signals.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-slate-500">
            目前無即時訊號
          </li>
        ) : (
          signals.map((signal) => (
            <li
              key={signal.id}
              className="mb-1 rounded-lg bg-slate-800/60 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase ${typeStyles[signal.type]}`}
                >
                  {getSignalLabel(signal.type)}
                </span>
                <span className="text-[10px] tabular-nums text-slate-500">
                  {formatPercent(signal.changePercent)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-200">{signal.message}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {signal.score} 分 · {signal.name}
              </p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
