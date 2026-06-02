import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SortBy, SortOrder } from "../../services/files";

interface SortBarProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
}

const OPTIONS: { value: SortBy; label: string }[] = [
  { value: "date",  label: "Fecha" },
  { value: "name",  label: "Nombre" },
  { value: "size",  label: "Tamaño" },
  { value: "type",  label: "Tipo" },
];

export function SortBar({ sortBy, sortOrder, onChange }: SortBarProps) {
  const toggle = (field: SortBy) => {
    if (sortBy === field) {
      onChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onChange(field, "asc");
    }
  };

  const OrderIcon = sortOrder === "asc" ? ArrowUp : ArrowDown;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-zinc-600 mr-1 flex items-center gap-1">
        <ArrowUpDown size={11} /> Ordenar
      </span>
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                      font-medium transition-all ${
                        sortBy === value
                          ? "bg-zinc-800 text-zinc-200"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                      }`}
        >
          {label}
          {sortBy === value && <OrderIcon size={10} />}
        </button>
      ))}
    </div>
  );
}
