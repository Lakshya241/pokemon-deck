"use client";
import { useState } from "react";
import { usePokedex } from "@/context/PokedexContext";
import { getTypeColor } from "@/lib/typeColors";

export function TypeFilter() {
  const { allTypes, selectedTypes, setSelectedTypes } = usePokedex();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const clearAll = () => setSelectedTypes([]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
          selectedTypes.length > 0
            ? "border-red-400 bg-red-50 text-red-700"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
        </svg>
        {selectedTypes.length > 0 ? `${selectedTypes.length} type${selectedTypes.length > 1 ? "s" : ""}` : "Filter by type"}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Pokémon Types
            </span>
            {selectedTypes.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          <div
            role="listbox"
            aria-multiselectable="true"
            aria-label="Filter by Pokémon type"
            className="flex flex-wrap gap-2"
          >
            {allTypes.map((t) => {
              const selected = selectedTypes.includes(t.name);
              const { bg, text } = getTypeColor(t.name);
              return (
                <button
                  key={t.name}
                  role="option"
                  aria-selected={selected}
                  aria-pressed={selected}
                  onClick={() => toggle(t.name)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                    selected
                      ? `${bg} ${text} ring-2 ring-offset-1 ring-current`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
