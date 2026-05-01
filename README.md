# Pokédex Lite

A fast, responsive Pokédex web app built with Next.js 14, TypeScript, and Tailwind CSS. Browse, search, filter, and favorite Pokémon — with smooth animations, a polished UI, and optional GitHub OAuth sign-in.

**Live demo:** [Deploy to Vercel](#deployment)

---

## Features

- Browse all Pokémon in a responsive grid (2–6 columns depending on screen size)
- Search by name — results update as you type
- Filter by one or more types (Fire, Water, Grass, etc.)
- Paginate through results (20 per page)
- Favorite Pokémon — persisted in `localStorage` across page refreshes
- Detail modal with base stats (progress bars), abilities, and type badges
- Smooth animations with Framer Motion (respects `prefers-reduced-motion`)
- Server-side rendering (ISR) for fast initial loads and SEO
- GitHub OAuth sign-in (optional bonus)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/pokedex-lite.git
cd pokedex-lite
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values. For the GitHub OAuth sign-in:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → New OAuth App
2. Set **Homepage URL** to `http://localhost:3000`
3. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret into `.env.local`
5. Generate a `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

> The app works fully without OAuth — sign-in is optional.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

### Vercel (recommended)

1. Push your repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add the environment variables from `.env.local.example` in the Vercel dashboard
4. Update `NEXTAUTH_URL` to your Vercel deployment URL
5. Update the GitHub OAuth callback URL to `https://your-app.vercel.app/api/auth/callback/github`

---

## Tech Stack

| Technology | Why |
|---|---|
| **Next.js 14 (App Router)** | SSR/ISR for fast initial loads and SEO; file-based routing |
| **TypeScript** | Type safety across the entire codebase |
| **Tailwind CSS v4** | Utility-first styling; responsive grid with zero custom CSS |
| **Framer Motion** | Declarative animations; built-in `reducedMotion` support |
| **NextAuth.js v4** | Battle-tested OAuth with minimal setup |
| **PokéAPI** | Free, comprehensive, public Pokémon REST API |

---

## Project Structure

```
pokedex-app/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with SessionProvider
│   ├── page.tsx            # Home page (ISR, server component)
│   ├── loading.tsx         # Suspense fallback
│   ├── error.tsx           # Error boundary
│   └── api/auth/           # NextAuth.js route handler
├── components/
│   ├── layout/             # Header
│   ├── pokemon/            # PokemonCard, PokemonGrid, DetailView, StatBar, TypeBadge
│   ├── search/             # SearchInput, TypeFilter
│   ├── pagination/         # Paginator
│   ├── favorites/          # FavoritesToggle
│   ├── providers/          # SessionProviderWrapper
│   └── ui/                 # LoadingSpinner, ErrorMessage, EmptyState
├── context/                # PokedexContext (global state)
├── hooks/                  # useFavorites, usePokemonDetail, useReducedMotion
├── lib/                    # pokeapi.ts, favorites.ts, typeColors.ts
├── types/                  # Shared TypeScript interfaces
└── auth/                   # NextAuth config
```

---

## Challenges & Solutions

**Challenge:** PokéAPI's list endpoint doesn't include type data — only names and URLs.  
**Solution:** Fetch individual Pokémon details in parallel during the server-side render to get types for the initial page. Subsequent pages are fetched client-side.

**Challenge:** Filtering by type or name while maintaining server-side pagination.  
**Solution:** When filters are active, pagination switches to client-side mode over the currently loaded page. This keeps the UX snappy without needing to fetch all 1000+ Pokémon.

**Challenge:** Focus management in the detail modal for accessibility.  
**Solution:** Implemented a focus trap that cycles Tab within the modal's focusable elements, restores focus to the triggering card on close, and handles Escape key dismissal.

---

## Testing

This project includes comprehensive test coverage with Jest, React Testing Library, and `fast-check` for property-based testing.

### Run tests

```bash
npm test                  # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Test structure

- **Unit tests** (`__tests__/unit/`): API utilities and core logic
- **Property tests** (`__tests__/properties/`): Fast-check properties for filtering, pagination, persistence, and accessibility

All tests validate against the 25 core requirements and use `jest-axe` to ensure accessibility compliance.

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the following:

```env
# GitHub OAuth (required for sign-in feature, optional for app usage)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth
NEXTAUTH_SECRET=generated_secret_key
NEXTAUTH_URL=http://localhost:3000  # Use your Vercel URL in production
```

### Generating NEXTAUTH_SECRET

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## License

MIT — feel free to use this project for learning or as a starting point for your own Pokédex app.
