import { fetchPokemonPage, fetchAllTypes } from "@/lib/pokeapi";
import { PokedexProvider } from "@/context/PokedexContext";
import { Header } from "@/components/layout/Header";
import { PokemonGrid } from "@/components/pokemon/PokemonGrid";
import { SearchInput } from "@/components/search/SearchInput";
import { TypeFilter } from "@/components/search/TypeFilter";
import { Paginator } from "@/components/pagination/Paginator";
import { DetailView } from "@/components/pokemon/DetailView";
import { ClientDetailWrapper } from "@/components/pokemon/ClientDetailWrapper";

// ISR: revalidate every 24 hours
export const revalidate = 86400;

export default async function HomePage() {
  const [{ items: initialPokemon, total }, initialTypes] = await Promise.all([
    fetchPokemonPage(0, 20),
    fetchAllTypes(),
  ]);

  return (
    <PokedexProvider
      initialPokemon={initialPokemon}
      initialTypes={initialTypes}
      initialTotal={total}
    >
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Hero */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Pokédex <span className="text-red-500">Lite</span>
            </h1>
            <p className="mt-2 text-gray-500">
              Browse {total.toLocaleString()} Pokémon — search, filter, and save your favorites.
            </p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <SearchInput />
            <TypeFilter />
          </div>

          {/* Grid */}
          <PokemonGrid />

          {/* Pagination */}
          <Paginator />
        </main>

        {/* Detail modal */}
        <ClientDetailWrapper />
      </div>
    </PokedexProvider>
  );
}
