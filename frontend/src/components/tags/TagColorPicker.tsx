import { TAG_COLORS } from "../../services/tags";
import { Check } from "lucide-react";

interface TagColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function TagColorPicker({ value, onChange }: TagColorPickerProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {TAG_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-6 h-6 rounded-full flex items-center justify-center
                     transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: c }}
          title={c}
        >
          {value === c && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}
