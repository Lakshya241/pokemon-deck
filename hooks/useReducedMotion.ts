"use client";
import { useEffect, useState } from "react";

/**
 * Wraps the `prefers-reduced-motion: reduce` media query.
 * Returns `prefersReducedMotion: true` when the user has requested reduced motion.
 * Defaults to `false` in SSR environments where `window` is not available.
 *
 * Validates: Requirements 9.4
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}
