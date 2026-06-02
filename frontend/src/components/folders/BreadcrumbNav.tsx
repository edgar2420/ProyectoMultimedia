import { ChevronRight, HardDrive } from "lucide-react";
import type { Folder } from "../../services/files";

interface BreadcrumbNavProps {
  crumbs: Folder[];
  onNavigate: (folderId: number | null) => void;
}

export function BreadcrumbNav({ crumbs, onNavigate }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap">
      {/* Raíz */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300
                   transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
      >
        <HardDrive size={13} />
        <span className={crumbs.length === 0 ? "text-zinc-200 font-medium" : ""}>
          Mis Archivos
        </span>
      </button>

      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <div key={crumb.id} className="flex items-center gap-1">
            <ChevronRight size={13} className="text-zinc-700" />
            <button
              onClick={() => onNavigate(crumb.id)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                isLast
                  ? "text-zinc-200 font-medium cursor-default"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {crumb.name}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
