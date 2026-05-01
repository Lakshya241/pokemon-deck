"use client";
import { motion } from "framer-motion";

interface FavoritesToggleProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  pokemonName: string;
}

export function FavoritesToggle({ isFavorite, onToggle, pokemonName }: FavoritesToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 1.4 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      aria-label={isFavorite ? `Remove ${pokemonName} from favorites` : `Add ${pokemonName} to favorites`}
      aria-pressed={isFavorite}
      className="rounded-full p-1.5 transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition-colors ${
          isFavorite ? "fill-red-500 stroke-red-500" : "fill-none stroke-gray-400"
        }`}
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </motion.button>
  );
}
