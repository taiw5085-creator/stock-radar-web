"use client";

interface LiveFlashSpanProps {
  active: boolean;
  className?: string;
  children: React.ReactNode;
}

export function LiveFlashSpan({ active, className = "", children }: LiveFlashSpanProps) {
  return (
    <span
      className={`inline-block rounded px-0.5 tabular-nums transition-colors ${
        active ? "live-flash" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
}
