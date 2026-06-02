import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-zinc-900/60 border border-zinc-800/50 rounded-lg p-0.5">
      {(["grid", "list"] as ViewMode[]).map((m) => {
        const Icon = m === "grid" ? LayoutGrid : List;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${
              mode === m
                ? "bg-zinc-700 text-zinc-200"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
