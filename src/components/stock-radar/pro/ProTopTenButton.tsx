"use client";

interface ProTopTenButtonProps {
  active: boolean;
  count: number;
  onClick: () => void;
}

export function ProTopTenButton({ active, count, onClick }: ProTopTenButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-amber-500 text-white"
          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
      }`}
    >
      TOP 10
      <span className="ml-1 opacity-70">({count})</span>
    </button>
  );
}
