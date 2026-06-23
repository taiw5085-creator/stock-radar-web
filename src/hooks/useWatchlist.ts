"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "stock-radar-watchlist";

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) setSymbols(parsed);
      }
    } catch {
      setSymbols([]);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setSymbols(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (symbol: string) => {
      persist(
        symbols.includes(symbol)
          ? symbols.filter((s) => s !== symbol)
          : [...symbols, symbol]
      );
    },
    [symbols, persist]
  );

  const isWatchlisted = useCallback(
    (symbol: string) => symbols.includes(symbol),
    [symbols]
  );

  return { symbols, toggle, isWatchlisted, loaded };
}
