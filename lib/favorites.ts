import type { FavoriteStoreData } from "@/types/pokemon";

const STORAGE_KEY = "pokedex-lite-favorites";

/**
 * Reads the favorites set from localStorage.
 *
 * - If localStorage is unavailable (SecurityError in private browsing), returns an empty set.
 * - If the stored JSON is malformed, resets to an empty set and logs a warning.
 * - If a userId is provided and the stored userId differs, returns an empty set (user-scoped).
 */
export function readFavorites(userId?: string): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();

    let data: FavoriteStoreData;
    try {
      data = JSON.parse(raw) as FavoriteStoreData;
    } catch {
      console.warn(
        "[FavoriteStore] Failed to parse stored favorites — resetting to empty set."
      );
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore removal errors
      }
      return new Set();
    }

    // User-scoped check: if either side has a userId and they don't match, reset.
    if (data.userId !== userId) {
      return new Set();
    }

    return new Set(data.ids ?? []);
  } catch {
    // SecurityError: localStorage is blocked
    return new Set();
  }
}

/**
 * Writes the favorites set to localStorage.
 *
 * - If localStorage is unavailable (SecurityError), silently no-ops.
 */
export function writeFavorites(ids: Set<number>, userId?: string): void {
  try {
    const data: FavoriteStoreData = {
      ids: Array.from(ids),
      ...(userId !== undefined ? { userId } : {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // SecurityError: localStorage is blocked — no-op
  }
}
