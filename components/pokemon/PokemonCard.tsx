"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { TypeBadge } from "./TypeBadge";
import { FavoritesToggle } from "@/components/favorites/FavoritesToggle";
import { getTypeGradient } from "@/lib/typeColors";
import type { PokemonListItem } from "@/types/pokemon";

interface PokemonCardProps {
  pokemon: PokemonListItem;
  isFavorite: boolean;
  onSelect: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export function PokemonCard({
  pokemon,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: PokemonCardProps) {
  const primaryType = pokemon.types[0] ?? "normal";
  const gradient = getTypeGradient(primaryType);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className={`relative flex flex-col items-center rounded-2xl bg-gradient-to-b ${gradient} border border-white/80 shadow-sm cursor-pointer select-none overflow-hidden group`}
      onClick={() => onSelect(pokemon.id)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${pokemon.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(pokemon.id);
        }
      }}
    >
      {/* Pokémon number */}
      <span className="absolute top-2 left-3 text-xs font-bold text-gray-400">
        #{String(pokemon.id).padStart(3, "0")}
      </span>

      {/* Favorite toggle */}
      <div
        className="absolute top-1.5 right-1.5 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <FavoritesToggle
          isFavorite={isFavorite}
          onToggle={(e) => {
            e.stopPropagation();
            onToggleFavorite(pokemon.id);
          }}
          pokemonName={pokemon.name}
        />
      </div>

      {/* Sprite */}
      <div className="relative mt-6 h-24 w-24 sm:h-28 sm:w-28">
        <Image
          src={pokemon.spriteUrl}
          alt={pokemon.name}
          fill
          sizes="(max-width: 640px) 96px, 112px"
          className="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
          priority={pokemon.id <= 20}
        />
      </div>

      {/* Name & types */}
      <div className="w-full px-3 pb-3 pt-2 text-center">
        <p className="capitalize font-bold text-gray-800 text-sm truncate">{pokemon.name}</p>
        <div className="mt-1.5 flex flex-wrap justify-center gap-1">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
