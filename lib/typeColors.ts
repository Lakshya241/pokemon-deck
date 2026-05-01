// Maps each Pokémon type to a distinct Tailwind background color class
export const typeColors: Record<string, string> = {
  normal:   "bg-stone-400",
  fire:     "bg-orange-500",
  water:    "bg-blue-500",
  electric: "bg-yellow-400",
  grass:    "bg-green-500",
  ice:      "bg-cyan-400",
  fighting: "bg-red-700",
  poison:   "bg-purple-500",
  ground:   "bg-amber-600",
  flying:   "bg-indigo-400",
  psychic:  "bg-pink-500",
  bug:      "bg-lime-500",
  rock:     "bg-yellow-700",
  ghost:    "bg-violet-700",
  dragon:   "bg-blue-800",
  dark:     "bg-gray-800",
  steel:    "bg-slate-500",
  fairy:    "bg-rose-400",
};

// Text colors paired with each background for legibility
const typeTextColors: Record<string, string> = {
  normal:   "text-white",
  fire:     "text-white",
  water:    "text-white",
  electric: "text-gray-900",
  grass:    "text-white",
  ice:      "text-gray-900",
  fighting: "text-white",
  poison:   "text-white",
  ground:   "text-white",
  flying:   "text-white",
  psychic:  "text-white",
  bug:      "text-white",
  rock:     "text-white",
  ghost:    "text-white",
  dragon:   "text-white",
  dark:     "text-white",
  steel:    "text-white",
  fairy:    "text-white",
};

// Border colors paired with each background
const typeBorderColors: Record<string, string> = {
  normal:   "border-stone-500",
  fire:     "border-orange-600",
  water:    "border-blue-600",
  electric: "border-yellow-500",
  grass:    "border-green-600",
  ice:      "border-cyan-500",
  fighting: "border-red-800",
  poison:   "border-purple-600",
  ground:   "border-amber-700",
  flying:   "border-indigo-500",
  psychic:  "border-pink-600",
  bug:      "border-lime-600",
  rock:     "border-yellow-800",
  ghost:    "border-violet-800",
  dragon:   "border-blue-900",
  dark:     "border-gray-900",
  steel:    "border-slate-600",
  fairy:    "border-rose-500",
};

export const getTypeColor = (type: string) => {
  const key = type.toLowerCase();
  return {
    bg:     typeColors[key]      ?? "bg-gray-400",
    text:   typeTextColors[key]  ?? "text-white",
    border: typeBorderColors[key] ?? "border-gray-500",
  };
};

// Background gradient per type for card theming
export const typeGradients: Record<string, string> = {
  normal:   "from-stone-100 to-stone-200",
  fire:     "from-orange-50 to-red-100",
  water:    "from-blue-50 to-cyan-100",
  electric: "from-yellow-50 to-amber-100",
  grass:    "from-green-50 to-emerald-100",
  ice:      "from-cyan-50 to-sky-100",
  fighting: "from-red-50 to-rose-100",
  poison:   "from-purple-50 to-violet-100",
  ground:   "from-amber-50 to-yellow-100",
  flying:   "from-indigo-50 to-blue-100",
  psychic:  "from-pink-50 to-rose-100",
  bug:      "from-lime-50 to-green-100",
  rock:     "from-yellow-50 to-amber-100",
  ghost:    "from-violet-50 to-purple-100",
  dragon:   "from-blue-50 to-indigo-100",
  dark:     "from-gray-100 to-slate-200",
  steel:    "from-slate-50 to-gray-100",
  fairy:    "from-rose-50 to-pink-100",
};

export const getTypeGradient = (type: string) =>
  typeGradients[type.toLowerCase()] ?? "from-gray-50 to-gray-100";
