"use client";
import { usePokedex } from "@/context/PokedexContext";
import { DetailView } from "./DetailView";

export function ClientDetailWrapper() {
  const { selectedPokemonId, closeDetail } = usePokedex();
  return <DetailView pokemonId={selectedPokemonId} onClose={closeDetail} />;
}
