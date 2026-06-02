import { Tag } from "lucide-react";
import { TagBadge } from "./TagBadge";
import type { Tag as TagType } from "../../services/tags";

interface TagFilterProps {
  tags: TagType[];
  selectedTagIds: number[];
  onToggle: (tagId: number) => void;
  onClear: () => void;
}

export function TagFilter({ tags, selectedTagIds, onToggle, onClear }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="flex items-center gap-1 text-xs text-zinc-600 shrink-0">
        <Tag size={11} />
        Etiquetas
      </span>
      {tags.map((tag) => (
        <TagBadge
          key={tag.id}
          name={tag.name}
          color={tag.color}
          clickable
          selected={selectedTagIds.includes(tag.id)}
          onClick={() => onToggle(tag.id)}
        />
      ))}
      {selectedTagIds.length > 0 && (
        <button
          onClick={onClear}
          className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          × Limpiar
        </button>
      )}
    </div>
  );
}
