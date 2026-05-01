"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { fetchPokemonPage } from "@/lib/pokeapi";
import { useFavorites } from "@/hooks/useFavorites";
import type {
  PokemonListItem,
  PokemonType,
  PokedexContextValue,
} from "@/types/pokemon";

const PokedexContext = createContext<PokedexContextValue | null>(null);

const PAGE_SIZE = 20;

interface PokedexProviderProps {
  children: React.ReactNode;
  initialPokemon: PokemonListItem[];
  initialTypes: PokemonType[];
  initialTotal: number;
  userId?: string;
}

export function PokedexProvider({
  children,
  initialPokemon,
  initialTypes,
  initialTotal,
  userId,
}: PokedexProviderProps) {
  const [pageData, setPageData] = useState<Record<number, PokemonListItem[]>>({ 1: initialPokemon });
  const [allFetchedPokemon, setAllFetchedPokemon] = useState<PokemonListItem[]>(initialPokemon);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQueryRaw] = useState("");
  const [selectedTypes, setSelectedTypesRaw] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

  const { favorites, toggleFavorite } = useFavorites(userId);

  // When filters change, reset to page 1
  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryRaw(q);
    setCurrentPage(1);
  }, []);

  const setSelectedTypes = useCallback((types: string[]) => {
    setSelectedTypesRaw(types);
    setCurrentPage(1);
  }, []);

  // Fetch a page from the API (used when no filters are active)
  const loadPage = useCallback(async (page: number, force = false) => {
    if (!force && pageData[page]) return; // already fetched
    setIsLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const { items, total } = await fetchPokemonPage(offset, PAGE_SIZE);
      setPageData((prev) => ({ ...prev, [page]: items }));
      setAllFetchedPokemon((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        items.forEach((p) => map.set(p.id, p));
        return Array.from(map.values()).sort((a, b) => a.id - b.id);
      });
      setTotalCount(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Pokémon.");
    } finally {
      setIsLoading(false);
    }
  }, [pageData]);

  const retry = useCallback(() => loadPage(currentPage, true), [loadPage, currentPage]);

  // When page changes and no client-side filters are active, fetch from API
  useEffect(() => {
    if (searchQuery === "" && selectedTypes.length === 0 && !showFavoritesOnly) {
      loadPage(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Client-side filtered list
  const filteredList = useMemo(() => {
    let list = allFetchedPokemon;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (selectedTypes.length > 0) {
      list = list.filter((p) =>
        p.types.some((t) => selectedTypes.includes(t))
      );
    }

    if (showFavoritesOnly) {
      list = list.filter((p) => favorites.has(p.id));
    }

    return list;
  }, [allFetchedPokemon, searchQuery, selectedTypes, showFavoritesOnly, favorites]);

  // When filters are active, paginate client-side
  const isFiltering = searchQuery !== "" || selectedTypes.length > 0 || showFavoritesOnly;

  const displayList = useMemo(() => {
    if (!isFiltering) return pageData[currentPage] || []; // server-paginated
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [isFiltering, pageData, filteredList, currentPage]);

  const totalPages = useMemo(() => {
    if (isFiltering) return Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
    return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  }, [isFiltering, filteredList.length, totalCount]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  }, []);

  const openDetail = useCallback((id: number) => setSelectedPokemonId(id), []);
  const closeDetail = useCallback(() => setSelectedPokemonId(null), []);

  const value: PokedexContextValue = {
    pokemonList: displayList,
    isLoading,
    error,
    retry,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    showFavoritesOnly,
    setShowFavoritesOnly,
    currentPage,
    totalPages,
    totalCount,
    goToNextPage,
    goToPrevPage,
    selectedPokemonId,
    openDetail,
    closeDetail,
    favorites,
    toggleFavorite,
    allTypes: initialTypes,
  };

  return (
    <PokedexContext.Provider value={value}>{children}</PokedexContext.Provider>
  );
}

export function usePokedex(): PokedexContextValue {
  const ctx = useContext(PokedexContext);
  if (!ctx) throw new Error("usePokedex must be used within PokedexProvider");
  return ctx;
}
