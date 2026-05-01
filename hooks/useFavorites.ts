"use client";
import { useState, useEffect, useCallback } from "react";
import { readFavorites, writeFavorites } from "@/lib/favorites";

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    setFavorites(readFavorites(userId));
  }, [userId]);

  const toggleFavorite = useCallback(
    (id: number) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        writeFavorites(next, userId);
        return next;
      });
    },
    [userId]
  );

  return { favorites, toggleFavorite };
}
