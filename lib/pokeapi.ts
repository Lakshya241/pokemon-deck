import type {
  PokemonListItem,
  PokemonDetail,
  PokemonType,
  PokemonListResponse,
  PokemonDetailResponse,
  TypeListResponse,
} from "@/types/pokemon";

const BASE_URL = "https://pokeapi.co/api/v2";

// Cache tag constants for Next.js ISR invalidation
export const CACHE_TAGS = {
  pokemonList: "pokemon-list",
  pokemonDetail: (id: number) => `pokemon-detail-${id}`,
  types: "pokemon-types",
} as const;

export class PokeAPIError extends Error {
  constructor(
    public status: number,
    public endpoint: string,
    message: string
  ) {
    super(message);
    this.name = "PokeAPIError";
  }
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    next: { revalidate: 86400 },
    ...options,
  });
  if (!res.ok) {
    throw new PokeAPIError(
      res.status,
      endpoint,
      `Failed to fetch ${endpoint} (${res.status}). Please try again.`
    );
  }
  return res.json() as Promise<T>;
}

function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}

/**
 * Normalize a PokemonDetailResponse into a PokemonListItem.
 * Sprite priority: official-artwork → front_default fallback.
 */
function normalizeListItem(raw: PokemonDetailResponse): PokemonListItem {
  return {
    id: raw.id,
    name: raw.name,
    spriteUrl:
      raw.sprites.other["official-artwork"].front_default ||
      raw.sprites.front_default,
    types: raw.types.map((t) => t.type.name),
  };
}

/**
 * Normalize a PokemonDetailResponse into a full PokemonDetail.
 * Sprite priority: official-artwork → front_default fallback.
 */
function normalizeDetail(raw: PokemonDetailResponse): PokemonDetail {
  return {
    id: raw.id,
    name: raw.name,
    spriteUrl:
      raw.sprites.other["official-artwork"].front_default ||
      raw.sprites.front_default,
    types: raw.types.map((t) => t.type.name),
    stats: raw.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    abilities: raw.abilities.map((a) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    })),
  };
}

/**
 * Fetch a page of Pokémon from the list endpoint.
 *
 * Because the list endpoint only returns name + URL, we fetch each
 * Pokémon's detail in parallel to obtain sprite and type data.
 * This runs at build/revalidation time (ISR), so the N+1 cost is
 * paid once per 24-hour window, not on every request.
 *
 * @returns An object with `items: PokemonListItem[]` and `total: number`
 */
export async function fetchPokemonPage(
  offset: number,
  limit: number = 20
): Promise<{ items: PokemonListItem[]; total: number }> {
  const data = await apiFetch<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`,
    { next: { revalidate: 86400, tags: [CACHE_TAGS.pokemonList] } }
  );

  const items = await Promise.all(
    data.results.map(async (result) => {
      const id = extractIdFromUrl(result.url);
      try {
        const detail = await apiFetch<PokemonDetailResponse>(`/pokemon/${id}`, {
          next: {
            revalidate: 86400,
            tags: [CACHE_TAGS.pokemonList, CACHE_TAGS.pokemonDetail(id)],
          },
        });
        return normalizeListItem(detail);
      } catch {
        // Graceful fallback: return item with empty types if detail fetch fails
        return {
          id,
          name: result.name,
          spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          types: [],
        } satisfies PokemonListItem;
      }
    })
  );

  return { items, total: data.count };
}

/**
 * Fetch full detail for a single Pokémon by ID.
 * Normalizes the raw API response into a PokemonDetail object.
 */
export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const data = await apiFetch<PokemonDetailResponse>(`/pokemon/${id}`, {
    next: {
      revalidate: 86400,
      tags: [CACHE_TAGS.pokemonDetail(id)],
    },
  });
  return normalizeDetail(data);
}

/**
 * Fetch all Pokémon types from the type endpoint.
 * Filters out non-battle types ("shadow", "unknown").
 */
export async function fetchAllTypes(): Promise<PokemonType[]> {
  const data = await apiFetch<TypeListResponse>("/type", {
    next: { revalidate: 86400, tags: [CACHE_TAGS.types] },
  });
  // Filter out shadow/unknown types that aren't real battle types
  return data.results
    .filter((t) => !["shadow", "unknown"].includes(t.name))
    .map((t) => ({ name: t.name }));
}
