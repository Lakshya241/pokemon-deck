"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchPokemonDetail } from "@/lib/pokeapi";
import type { PokemonDetail } from "@/types/pokemon";

export function usePokemonDetail(pokemonId: number | null) {
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPokemonDetail(id);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Pokémon details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pokemonId === null) {
      setDetail(null);
      setError(null);
      return;
    }
    load(pokemonId);
  }, [pokemonId, load]);

  const retry = useCallback(() => {
    if (pokemonId !== null) load(pokemonId);
  }, [pokemonId, load]);

  return { detail, isLoading, error, retry };
}
