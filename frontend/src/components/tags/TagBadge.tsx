import { X } from "lucide-react";

interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  size?: "sm" | "xs";
  clickable?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function TagBadge({
  name, color, onRemove, size = "sm",
  clickable = false, selected = false, onClick,
}: TagBadgeProps) {
  const pad  = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-1";
  const text = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full font-medium
                  transition-all select-none ${pad} ${text}
                  ${clickable || onClick ? "cursor-pointer" : ""}
                  ${selected ? "opacity-100" : "opacity-90 hover:opacity-100"}
                  `}
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}55`,
        outline: selected ? `2px solid ${color}88` : "none",
        outlineOffset: "1px",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
