// Raw PokéAPI response shapes
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

export interface PokemonDetailResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      "official-artwork": { front_default: string };
    };
  };
  types: { slot: number; type: { name: string; url: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
}

export interface TypeListResponse {
  count: number;
  results: { name: string; url: string }[];
}

// Internal application types
export interface PokemonListItem {
  id: number;
  name: string;
  spriteUrl: string;
  types: string[];
}

export interface PokemonDetail extends PokemonListItem {
  stats: { name: string; value: number }[];
  abilities: { name: string; isHidden: boolean }[];
}

export interface PokemonType {
  name: string;
}

export interface FavoriteStoreData {
  ids: number[];
  userId?: string;
}

// State shape for PokedexContext
export interface PokedexState {
  // Server-seeded on first render, then client-managed
  allPokemon: PokemonListItem[];
  allTypes: PokemonType[];

  searchQuery: string;
  selectedTypes: string[];
  showFavoritesOnly: boolean;

  currentPage: number;
  pageSize: number;

  selectedPokemonId: number | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  favorites: Set<number>;

  isLoading: boolean;
  error: string | null;
}

// Context types
export interface PokedexContextValue {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (v: boolean) => void;

  currentPage: number;
  totalPages: number;
  totalCount: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;

  selectedPokemonId: number | null;
  openDetail: (id: number) => void;
  closeDetail: () => void;

  favorites: Set<number>;
  toggleFavorite: (id: number) => void;

  allTypes: PokemonType[];
}
