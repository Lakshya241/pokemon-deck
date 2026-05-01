import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "Pokédex Lite — Browse, Search & Favorite Pokémon",
  description:
    "A fast, responsive Pokédex app built with Next.js. Browse all Pokémon, search by name, filter by type, and save your favorites.",
  keywords: ["pokemon", "pokedex", "pokeapi", "nextjs"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
