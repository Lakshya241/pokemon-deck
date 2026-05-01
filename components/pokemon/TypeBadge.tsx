import { getTypeColor } from "@/lib/typeColors";

interface TypeBadgeProps {
  type: string;
  size?: "sm" | "md";
}

export function TypeBadge({ type, size = "sm" }: TypeBadgeProps) {
  const { bg, text } = getTypeColor(type);
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-block rounded-full font-semibold capitalize ${bg} ${text} ${sizeClass}`}
    >
      {type}
    </span>
  );
}
