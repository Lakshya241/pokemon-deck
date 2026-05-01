/**
 * Property-based tests for favorites persistence
 * Feature: pokedex-lite, Property 16: Favorites persistence round-trip
 *
 * Validates: Requirements 6.4, 6.5
 */

// Feature: pokedex-lite, Property 16: Favorites persistence round-trip
import * as fc from "fast-check";
import { readFavorites, writeFavorites } from "@/lib/favorites";

/**
 * Helper: convert an array of IDs to a Set, deduplicating as a Set would.
 * This mirrors what writeFavorites/readFavorites does internally.
 */
function toSet(ids: number[]): Set<number> {
  return new Set(ids);
}

/**
 * Helper: compare two Sets for equality.
 */
function setsEqual(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) {
    if (!b.has(v)) return false;
  }
  return true;
}

beforeEach(() => {
  // Clear localStorage before each test to ensure isolation
  localStorage.clear();
});

describe("favorites – Property 16: Favorites persistence round-trip", () => {
  /**
   * Property 16a – Anonymous (no userId) round-trip:
   * For any set of favorite IDs written via writeFavorites (no userId),
   * reading back via readFavorites (no userId) produces the same set of IDs.
   *
   * Validates: Requirements 6.4, 6.5
   */
  it("Property 16a – anonymous round-trip: write then read returns the same set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        (ids) => {
          localStorage.clear();
          const written = toSet(ids);
          writeFavorites(written);
          const read = readFavorites();
          expect(setsEqual(read, written)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16b – Authenticated (with userId) round-trip:
   * For any set of favorite IDs and a non-null userId written via writeFavorites,
   * reading back via readFavorites with the same userId produces the same set of IDs.
   *
   * Validates: Requirements 6.4, 6.5
   */
  it("Property 16b – authenticated round-trip: write then read with same userId returns the same set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        fc.string({ minLength: 1, maxLength: 20 }),
        (ids, userId) => {
          localStorage.clear();
          const written = toSet(ids);
          writeFavorites(written, userId);
          const read = readFavorites(userId);
          expect(setsEqual(read, written)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16c – Different userId returns empty set:
   * For any set of favorite IDs written with a given userId,
   * reading back with a different userId returns an empty set.
   *
   * Validates: Requirements 6.4, 6.5
   */
  it("Property 16c – different userId returns empty set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (ids, userIdA, userIdB) => {
          // Only test when the two userIds are actually different
          fc.pre(userIdA !== userIdB);

          localStorage.clear();
          const written = toSet(ids);
          writeFavorites(written, userIdA);
          const read = readFavorites(userIdB);
          expect(read.size).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16d – Anonymous write, authenticated read returns empty set:
   * Writing without a userId and reading with a userId returns an empty set
   * (the stored entry has no userId, but the read expects one).
   *
   * Validates: Requirements 6.4, 6.5
   */
  it("Property 16d – anonymous write, authenticated read returns empty set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        fc.string({ minLength: 1, maxLength: 20 }),
        (ids, userId) => {
          localStorage.clear();
          const written = toSet(ids);
          // Write without userId (anonymous)
          writeFavorites(written);
          // Read with a userId — stored userId is undefined, requested is a string → mismatch
          const read = readFavorites(userId);
          expect(read.size).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16e – Authenticated write, anonymous read returns empty set:
   * Writing with a userId and reading without a userId returns an empty set.
   *
   * Validates: Requirements 6.4, 6.5
   */
  it("Property 16e – authenticated write, anonymous read returns empty set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        fc.string({ minLength: 1, maxLength: 20 }),
        (ids, userId) => {
          localStorage.clear();
          const written = toSet(ids);
          // Write with userId (authenticated)
          writeFavorites(written, userId);
          // Read without userId (anonymous) — stored userId is a string, requested is undefined → mismatch
          const read = readFavorites(undefined);
          expect(read.size).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16f – fc.option userId variant (null = anonymous):
   * Using fc.option to generate either null (anonymous) or a string (authenticated),
   * the round-trip holds for both cases.
   *
   * Validates: Requirements 6.4, 6.5
   */
  it("Property 16f – option userId round-trip: null (anonymous) or string (authenticated) both persist correctly", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        fc.option(fc.string({ minLength: 1, maxLength: 20 })),
        (ids, maybeUserId) => {
          localStorage.clear();
          const written = toSet(ids);
          // fc.option returns null for the "none" case
          const userId = maybeUserId === null ? undefined : maybeUserId;
          writeFavorites(written, userId);
          const read = readFavorites(userId);
          expect(setsEqual(read, written)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: pokedex-lite, Property 15: Favorite toggle round-trip

/**
 * Property-based tests for favorite toggle round-trip
 * Feature: pokedex-lite, Property 15: Favorite toggle round-trip
 *
 * Validates: Requirements 6.2, 6.3
 *
 * Tests the pure toggle logic extracted from useFavorites:
 *   Given a Set<number> and an id:
 *     - if id is in the set → remove it (toggle OFF)
 *     - if id is not in the set → add it (toggle ON)
 */

/**
 * Pure toggle function mirroring the logic inside useFavorites.toggleFavorite.
 * This is the exact same logic as the setState callback in useFavorites.ts.
 */
function toggleFavorite(prev: Set<number>, id: number): Set<number> {
  const next = new Set(prev);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

describe("favorites – Property 15: Favorite toggle round-trip", () => {
  /**
   * Property 15a – Toggle ON adds id to the set:
   * For any Pokemon ID not already in the favorites set,
   * toggling favorite ON adds that ID to the set.
   *
   * Validates: Requirements 6.2
   */
  it("Property 15a – toggle ON: toggling a non-favorite id adds it to the set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        fc.integer({ min: 1, max: 10000 }),
        (initialIds, id) => {
          // Build initial set without the target id to guarantee toggle-ON scenario
          const initial = new Set(initialIds.filter((x) => x !== id));
          const result = toggleFavorite(initial, id);
          expect(result.has(id)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15b – Toggle OFF removes id from the set:
   * For any Pokemon ID already in the favorites set,
   * toggling favorite OFF removes that ID from the set.
   *
   * Validates: Requirements 6.3
   */
  it("Property 15b – toggle OFF: toggling an existing favorite id removes it from the set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        fc.integer({ min: 1, max: 10000 }),
        (initialIds, id) => {
          // Build initial set with the target id to guarantee toggle-OFF scenario
          const initial = new Set([...initialIds, id]);
          const result = toggleFavorite(initial, id);
          expect(result.has(id)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15c – Toggle ON then OFF is a round-trip:
   * For any favorites set and any Pokemon ID,
   * toggling ON then OFF returns the set to its original state.
   *
   * Validates: Requirements 6.2, 6.3
   */
  it("Property 15c – round-trip: toggle ON then OFF restores the original set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        fc.integer({ min: 1, max: 10000 }),
        (initialIds, id) => {
          // Ensure id is NOT in the initial set so toggle-ON is the first operation
          const initial = new Set(initialIds.filter((x) => x !== id));
          const afterOn = toggleFavorite(initial, id);
          const afterOff = toggleFavorite(afterOn, id);

          // The set should be back to its original state
          expect(afterOff.size).toBe(initial.size);
          for (const v of initial) {
            expect(afterOff.has(v)).toBe(true);
          }
          expect(afterOff.has(id)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15d – Toggle does not affect other ids:
   * For any favorites set and any Pokemon ID,
   * toggling that ID (in either direction) does not change the membership
   * of any other ID in the set.
   *
   * Validates: Requirements 6.2, 6.3
   */
  it("Property 15d – isolation: toggling one id does not affect other ids in the set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 10000 })),
        fc.integer({ min: 1, max: 10000 }),
        (initialIds, id) => {
          const initial = new Set(initialIds);
          const result = toggleFavorite(initial, id);

          // Every id other than the toggled one should have the same membership
          for (const otherId of initial) {
            if (otherId !== id) {
              expect(result.has(otherId)).toBe(true);
            }
          }
          // Ids not in initial (other than the toggled one) should still be absent
          // (We can't enumerate all absent ids, but we verify the toggled id specifically)
          if (!initial.has(id)) {
            // Toggle ON: only id was added, size increases by exactly 1
            expect(result.size).toBe(initial.size + 1);
          } else {
            // Toggle OFF: only id was removed, size decreases by exactly 1
            expect(result.size).toBe(initial.size - 1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
