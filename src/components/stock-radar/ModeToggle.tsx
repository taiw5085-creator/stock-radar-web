"use client";

type ViewMode = "overview" | "card";

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex rounded-2xl bg-zinc-200/70 p-1">
      <button
        type="button"
        onClick={() => onChange("overview")}
        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          mode === "overview"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-600"
        }`}
      >
        總覽模式
      </button>
      <button
        type="button"
        onClick={() => onChange("card")}
        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          mode === "card"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-600"
        }`}
      >
        卡片模式
      </button>
    </div>
  );
}
