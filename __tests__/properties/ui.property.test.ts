/**
 * Property-based tests for UI utilities
 * Feature: pokedex-lite, Property 21: Type color map completeness and uniqueness
 *
 * Validates: Requirements 8.4
 */

import * as fc from "fast-check";
import { typeColors } from "@/lib/typeColors";

// The 18 standard Pokémon battle types
const KNOWN_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

// Feature: pokedex-lite, Property 21: Type color map completeness and uniqueness
describe("typeColors – Property 21: completeness and uniqueness", () => {
  /**
   * Property: For any type name from the 18 known types, typeColors has an
   * entry for it (the key exists and has a non-empty bg value).
   *
   * Validates: Requirements 8.4
   */
  it("Property 21a – completeness: every known type has a non-empty bg color entry", () => {
    fc.assert(
      fc.property(fc.constantFrom(...KNOWN_TYPES), (typeName) => {
        const bg = typeColors[typeName];
        // Key must exist
        expect(bg).toBeDefined();
        // Value must be a non-empty string
        expect(typeof bg).toBe("string");
        expect(bg.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: No two types share the same bg color value.
   *
   * Validates: Requirements 8.4
   */
  it("Property 21b – uniqueness: all 18 known types have distinct bg color values", () => {
    // Collect all bg values for the known types
    const bgValues = KNOWN_TYPES.map((t) => typeColors[t]);

    // Use a property test to verify that for any two distinct types sampled
    // from the known list, their bg colors differ.
    fc.assert(
      fc.property(
        fc.constantFrom(...KNOWN_TYPES),
        fc.constantFrom(...KNOWN_TYPES),
        (typeA, typeB) => {
          if (typeA === typeB) return; // same type – trivially equal, skip
          expect(typeColors[typeA]).not.toBe(typeColors[typeB]);
        }
      ),
      { numRuns: 100 }
    );

    // Also assert the set-level uniqueness directly so the test fails fast
    // if any duplicates exist, regardless of sampling luck.
    const uniqueBgValues = new Set(bgValues);
    expect(uniqueBgValues.size).toBe(KNOWN_TYPES.length);
  });
});
