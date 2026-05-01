"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import { TypeBadge } from "./TypeBadge";
import { StatBar } from "./StatBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FavoritesToggle } from "@/components/favorites/FavoritesToggle";
import { getTypeGradient } from "@/lib/typeColors";
import { usePokedex } from "@/context/PokedexContext";

interface DetailViewProps {
  pokemonId: number | null;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

export function DetailView({ pokemonId, onClose, triggerRef }: DetailViewProps) {
  const { detail, isLoading, error, retry } = usePokemonDetail(pokemonId);
  const { favorites, toggleFavorite } = usePokedex();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the close button when modal opens
  useEffect(() => {
    if (pokemonId !== null) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [pokemonId]);

  // Restore focus on close
  useEffect(() => {
    return () => {
      triggerRef?.current?.focus();
    };
  }, [triggerRef]);

  // Trap focus inside modal
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal || pokemonId === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pokemonId, onClose]);

  const primaryType = detail?.types[0] ?? "normal";
  const gradient = getTypeGradient(primaryType);

  return (
    <AnimatePresence>
      {pokemonId !== null && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={detail ? `${detail.name} details` : "Pokémon details"}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl overflow-hidden"
          >
            {/* Header gradient */}
            <div className={`relative bg-gradient-to-b ${gradient} px-6 pt-6 pb-16`}>
              <div className="flex items-start justify-between">
                <div>
                  {detail && (
                    <>
                      <p className="text-sm font-bold text-gray-500">
                        #{String(detail.id).padStart(3, "0")}
                      </p>
                      <h2 className="text-2xl font-extrabold capitalize text-gray-800">
                        {detail.name}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {detail.types.map((t) => (
                          <TypeBadge key={t} type={t} size="md" />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {detail && (
                    <FavoritesToggle
                      isFavorite={favorites.has(detail.id)}
                      onToggle={(e) => {
                        e.stopPropagation();
                        toggleFavorite(detail.id);
                      }}
                      pokemonName={detail.name}
                    />
                  )}
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    aria-label="Close details"
                    className="rounded-full bg-white/70 p-2 text-gray-600 transition hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Sprite */}
              {detail && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="relative h-28 w-28">
                    <Image
                      src={detail.spriteUrl}
                      alt={detail.name}
                      fill
                      sizes="112px"
                      className="object-contain drop-shadow-xl"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto px-6 pb-8 pt-16 sm:max-h-[50vh]">
              {isLoading && (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              )}

              {error && <ErrorMessage message={error} onRetry={retry} />}

              {detail && !isLoading && (
                <div className="space-y-6">
                  {/* Stats */}
                  <section>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Base Stats
                    </h3>
                    <div className="space-y-2.5">
                      {detail.stats.map((s) => (
                        <StatBar key={s.name} label={s.name} value={s.value} />
                      ))}
                    </div>
                  </section>

                  {/* Abilities */}
                  <section>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Abilities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {detail.abilities.map((a) => (
                        <span
                          key={a.name}
                          className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                            a.isHidden
                              ? "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {a.name}
                          {a.isHidden && (
                            <span className="ml-1 text-xs text-gray-400">(hidden)</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
