"use client";
import { AnimatePresence } from "framer-motion";
import { PokemonCard } from "./PokemonCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePokedex } from "@/context/PokedexContext";

export function PokemonGrid() {
  const { pokemonList, isLoading, error, retry, openDetail, toggleFavorite, favorites } =
    usePokedex();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage message={error} onRetry={retry} />
      </div>
    );
  }

  if (pokemonList.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <AnimatePresence mode="popLayout">
        {pokemonList.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            isFavorite={favorites.has(pokemon.id)}
            onSelect={openDetail}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
