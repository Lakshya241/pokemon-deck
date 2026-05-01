interface StatBarProps {
  label: string;
  value: number;
  max?: number;
}

const statColors: Record<string, string> = {
  hp: "bg-green-500",
  attack: "bg-red-500",
  defense: "bg-blue-500",
  "special-attack": "bg-purple-500",
  "special-defense": "bg-indigo-500",
  speed: "bg-yellow-500",
};

const statLabels: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "Sp.ATK",
  "special-defense": "Sp.DEF",
  speed: "SPD",
};

export function StatBar({ label, value, max = 255 }: StatBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = statColors[label] ?? "bg-gray-400";
  const displayLabel = statLabels[label] ?? label;

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {displayLabel}
      </span>
      <span className="w-8 shrink-0 text-sm font-bold text-gray-800">{value}</span>
      <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${displayLabel}: ${value}`}
        />
      </div>
    </div>
  );
}
