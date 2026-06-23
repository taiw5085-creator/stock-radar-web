"use client";

interface StarButtonProps {
  active: boolean;
  onToggle: () => void;
}

export function StarButton({ active, onToggle }: StarButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={active ? "移除自選股" : "加入自選股"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition-colors ${
        active
          ? "bg-amber-100 text-amber-500"
          : "bg-zinc-100 text-zinc-400 hover:text-amber-400"
      }`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
