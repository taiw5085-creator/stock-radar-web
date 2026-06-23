import type { DataSourceMeta } from "@/lib/stock-radar/types";

interface DataSourceBannerProps {
  meta: DataSourceMeta;
}

function sourceLine(meta: DataSourceMeta): string {
  if (meta.historical === "mock") {
    return "歷史：Mock · 即時：Mock";
  }

  const liveLabel =
    meta.live === "yahoo"
      ? `Yahoo ${meta.yahooCount}/${meta.total}`
      : `FinMind fallback ${meta.finmindFallbackCount}/${meta.total}`;

  return `歷史：FinMind（評分） · 即時：${liveLabel}`;
}

export function DataSourceBanner({ meta }: DataSourceBannerProps) {
  const isMock = meta.historical === "mock";

  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1 ${
        isMock
          ? "bg-amber-50 text-amber-900 ring-amber-100"
          : "bg-white text-zinc-700 ring-zinc-200/80"
      }`}
    >
      <p className="font-semibold text-zinc-900">雙資料源模式</p>
      <p className="mt-1">{sourceLine(meta)}</p>
      {!isMock && meta.finmindFallbackCount > 0 && (
        <p className="mt-1 text-xs text-zinc-500">
          {meta.finmindFallbackCount} 檔 Yahoo 無資料，已 fallback FinMind 收盤
        </p>
      )}
    </div>
  );
}
