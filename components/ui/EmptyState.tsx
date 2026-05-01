interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "No Pokémon found. Try a different search or filter." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="text-6xl">🔍</div>
      <p className="text-gray-500 text-lg font-medium">{message}</p>
    </div>
  );
}
