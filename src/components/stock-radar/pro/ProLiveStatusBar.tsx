"use client";

interface ProLiveStatusBarProps {
  polling: boolean;
  lastUpdated: Date | null;
  countdown: number;
  yahooError: string | null;
  onRefresh: () => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function ProLiveStatusBar({
  polling,
  lastUpdated,
  countdown,
  yahooError,
  onRefresh,
}: ProLiveStatusBarProps) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
          <span
            className={`relative flex h-2 w-2 ${
              polling ? "animate-pulse" : ""
            }`}
          >
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${
                polling ? "animate-ping bg-emerald-400 opacity-75" : "bg-emerald-400"
              }`}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-300">
            {polling ? "即時更新中…" : "即時更新中"}
          </span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={polling}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          立即更新
        </button>
      </div>

      <div className="text-right text-[11px] tabular-nums text-slate-400">
        {lastUpdated ? (
          <span>最後更新 {formatTime(lastUpdated)}</span>
        ) : (
          <span>等待首次更新…</span>
        )}
        <span className="mx-1.5 text-slate-600">·</span>
        <span>
          下次更新{" "}
          <span className="font-semibold text-emerald-400">{countdown}</span> 秒
        </span>
      </div>

      {yahooError && (
        <p className="max-w-xs rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-right text-[11px] leading-relaxed text-amber-200">
          {yahooError}
        </p>
      )}
    </div>
  );
}
