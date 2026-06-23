"use client";

import type { LinePushEntry } from "@/lib/stock-radar/line-push-log";

interface ProLinePushLogProps {
  entries: LinePushEntry[];
}

const statusStyles: Record<LinePushEntry["status"], string> = {
  delivered: "text-emerald-400",
  pending: "text-amber-400",
  failed: "text-red-400",
};

const statusLabels: Record<LinePushEntry["status"], string> = {
  delivered: "已送達",
  pending: "待發送",
  failed: "失敗",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProLinePushLog({ entries }: ProLinePushLogProps) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-xl border border-slate-700/60 bg-slate-900/80">
      <div className="border-b border-slate-700/60 px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          LINE 推播紀錄
        </h2>
        <p className="mt-0.5 text-[10px] text-slate-500">
          即時訊號觸發時自動記錄
        </p>
      </div>

      <ul className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-slate-500">
            尚無推播紀錄
          </li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.id}
              className="mb-1 rounded-lg border border-slate-700/40 bg-slate-800/40 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#06C755]">
                  LINE
                </span>
                <span
                  className={`text-[10px] font-semibold ${statusStyles[entry.status]}`}
                >
                  {statusLabels[entry.status]}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                {entry.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{entry.body}</p>
              <p className="mt-1 text-[10px] text-slate-500">
                {entry.symbol} · {formatTime(entry.sentAt)}
              </p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
