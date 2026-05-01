"use client";
import { usePokedex } from "@/context/PokedexContext";

export function Paginator() {
  const { currentPage, totalPages, goToNextPage, goToPrevPage } = usePokedex();

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pokémon list pagination"
      className="flex items-center justify-center gap-4 py-6"
    >
      <button
        onClick={goToPrevPage}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>

      <span className="text-sm font-semibold text-gray-700" aria-live="polite" aria-atomic="true">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
