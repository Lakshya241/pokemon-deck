/**
 * Unit tests for lib/pokeapi.ts
 * Validates: Requirements 1.3
 */

import {
  fetchPokemonPage,
  fetchPokemonDetail,
  fetchAllTypes,
  PokeAPIError,
} from "@/lib/pokeapi";

// ---------------------------------------------------------------------------
// Helpers to build minimal raw API response fixtures
// ---------------------------------------------------------------------------

function makeDetailResponse(
  id: number,
  name: string,
  types: string[],
  artworkUrl: string | null = null,
  frontDefault = `https://sprites.example.com/${id}.png`
) {
  return {
    id,
    name,
    sprites: {
      front_default: frontDefault,
      other: {
        "official-artwork": {
          front_default: artworkUrl,
        },
      },
    },
    types: types.map((t, slot) => ({ slot: slot + 1, type: { name: t, url: "" } })),
    stats: [
      { base_stat: 45, stat: { name: "hp" } },
      { base_stat: 49, stat: { name: "attack" } },
    ],
    abilities: [
      { ability: { name: "overgrow" }, is_hidden: false },
      { ability: { name: "chlorophyll" }, is_hidden: true },
    ],
  };
}

function makeListResponse(results: { name: string; url: string }[], count = 100) {
  return { count, next: null, previous: null, results };
}

function makeTypeListResponse(names: string[]) {
  return {
    count: names.length,
    results: names.map((name) => ({ name, url: `https://pokeapi.co/api/v2/type/${name}` })),
  };
}

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockOkResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response);
}

function mockErrorResponse(status: number) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  } as Response);
}

beforeEach(() => {
  mockFetch.mockReset();
});

// ---------------------------------------------------------------------------
// fetchPokemonPage
// ---------------------------------------------------------------------------

describe("fetchPokemonPage", () => {
  it("returns normalized PokemonListItem[] with correct id, name, spriteUrl, types", async () => {
    const bulbasaurDetail = makeDetailResponse(
      1,
      "bulbasaur",
      ["grass", "poison"],
      "https://artwork.example.com/1.png"
    );
    const ivysaurDetail = makeDetailResponse(
      2,
      "ivysaur",
      ["grass", "poison"],
      "https://artwork.example.com/2.png"
    );

    const listResponse = makeListResponse([
      { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
      { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
    ]);

    // First call: list endpoint; subsequent calls: detail endpoints
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(listResponse),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(bulbasaurDetail),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(ivysaurDetail),
      } as Response);

    const { items, total } = await fetchPokemonPage(0, 2);

    expect(total).toBe(100);
    expect(items).toHaveLength(2);

    expect(items[0]).toEqual({
      id: 1,
      name: "bulbasaur",
      spriteUrl: "https://artwork.example.com/1.png",
      types: ["grass", "poison"],
    });

    expect(items[1]).toEqual({
      id: 2,
      name: "ivysaur",
      spriteUrl: "https://artwork.example.com/2.png",
      types: ["grass", "poison"],
    });
  });

  it("falls back to front_default sprite when official-artwork is null", async () => {
    const detail = makeDetailResponse(
      1,
      "bulbasaur",
      ["grass"],
      null, // no official artwork
      "https://sprites.example.com/1.png"
    );

    const listResponse = makeListResponse([
      { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
    ]);

    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(listResponse) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(detail) } as Response);

    const { items } = await fetchPokemonPage(0, 1);

    expect(items[0].spriteUrl).toBe("https://sprites.example.com/1.png");
  });

  it("throws PokeAPIError with correct status when list endpoint returns non-ok (404)", async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(404));

    const err = await fetchPokemonPage(0, 2).catch((e) => e);
    expect(err).toBeInstanceOf(PokeAPIError);
    expect(err.status).toBe(404);
  });

  it("throws PokeAPIError with correct status when list endpoint returns non-ok (503)", async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(503));

    const err = await fetchPokemonPage(0, 2).catch((e) => e);
    expect(err).toBeInstanceOf(PokeAPIError);
    expect(err.status).toBe(503);
  });
});

// ---------------------------------------------------------------------------
// fetchPokemonDetail
// ---------------------------------------------------------------------------

describe("fetchPokemonDetail", () => {
  it("returns normalized PokemonDetail with correct stats and abilities", async () => {
    const detail = makeDetailResponse(
      1,
      "bulbasaur",
      ["grass", "poison"],
      "https://artwork.example.com/1.png"
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(detail),
    } as Response);

    const result = await fetchPokemonDetail(1);

    expect(result.id).toBe(1);
    expect(result.name).toBe("bulbasaur");
    expect(result.spriteUrl).toBe("https://artwork.example.com/1.png");
    expect(result.types).toEqual(["grass", "poison"]);

    expect(result.stats).toEqual([
      { name: "hp", value: 45 },
      { name: "attack", value: 49 },
    ]);

    expect(result.abilities).toEqual([
      { name: "overgrow", isHidden: false },
      { name: "chlorophyll", isHidden: true },
    ]);
  });

  it("falls back to front_default sprite when official-artwork is null", async () => {
    const detail = makeDetailResponse(
      25,
      "pikachu",
      ["electric"],
      null,
      "https://sprites.example.com/25.png"
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(detail),
    } as Response);

    const result = await fetchPokemonDetail(25);

    expect(result.spriteUrl).toBe("https://sprites.example.com/25.png");
  });

  it("throws PokeAPIError with correct status on 404", async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(404));

    const err = await fetchPokemonDetail(9999).catch((e) => e);
    expect(err).toBeInstanceOf(PokeAPIError);
    expect(err.status).toBe(404);
  });

  it("throws PokeAPIError with correct status on 503", async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(503));

    const err = await fetchPokemonDetail(1).catch((e) => e);
    expect(err).toBeInstanceOf(PokeAPIError);
    expect(err.status).toBe(503);
  });
});

// ---------------------------------------------------------------------------
// fetchAllTypes
// ---------------------------------------------------------------------------

describe("fetchAllTypes", () => {
  it("returns PokemonType[] with all battle types", async () => {
    const typeResponse = makeTypeListResponse([
      "normal",
      "fire",
      "water",
      "grass",
      "electric",
    ]);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(typeResponse),
    } as Response);

    const types = await fetchAllTypes();

    expect(types).toHaveLength(5);
    expect(types).toEqual([
      { name: "normal" },
      { name: "fire" },
      { name: "water" },
      { name: "grass" },
      { name: "electric" },
    ]);
  });

  it("filters out 'shadow' and 'unknown' types", async () => {
    const typeResponse = makeTypeListResponse([
      "fire",
      "shadow",
      "water",
      "unknown",
      "grass",
    ]);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(typeResponse),
    } as Response);

    const types = await fetchAllTypes();

    expect(types).toHaveLength(3);
    expect(types.map((t) => t.name)).toEqual(["fire", "water", "grass"]);
    expect(types.map((t) => t.name)).not.toContain("shadow");
    expect(types.map((t) => t.name)).not.toContain("unknown");
  });

  it("throws PokeAPIError with correct status on 404", async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(404));

    const err = await fetchAllTypes().catch((e) => e);
    expect(err).toBeInstanceOf(PokeAPIError);
    expect(err.status).toBe(404);
  });

  it("throws PokeAPIError with correct status on 503", async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(503));

    const err = await fetchAllTypes().catch((e) => e);
    expect(err).toBeInstanceOf(PokeAPIError);
    expect(err.status).toBe(503);
  });
});
