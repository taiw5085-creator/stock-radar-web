"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveFlashMap } from "@/lib/stock-radar/live-flash";

const FLASH_DURATION_MS = 800;

export function useLiveFlash() {
  const [flashMap, setFlashMap] = useState<LiveFlashMap>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFlash = useCallback((changes: LiveFlashMap) => {
    if (changes.size === 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setFlashMap(new Map(changes));

    timerRef.current = setTimeout(() => {
      setFlashMap(new Map());
      timerRef.current = null;
    }, FLASH_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { flashMap, triggerFlash };
}
