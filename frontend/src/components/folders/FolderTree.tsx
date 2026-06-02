import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Folder, FolderOpen, ChevronRight, Plus } from "lucide-react";
import type { FolderTreeNode } from "../../services/files";

interface FolderTreeNodeProps {
  node: FolderTreeNode;
  depth: number;
  currentFolderId: number | null;
  onNavigate: (id: number) => void;
}

function TreeNode({ node, depth, currentFolderId, onNavigate }: FolderTreeNodeProps) {
  const isActive = currentFolderId === node.id;
  const hasChildren = node.children.length > 0;
  const [expanded, setExpanded] = useState(isActive || node.children.some(
    (c) => c.id === currentFolderId
  ));

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded-lg cursor-pointer
                    text-xs transition-colors group select-none
                    ${isActive
                      ? "bg-brand-950/50 text-brand-400"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => onNavigate(node.id)}
      >
        {/* Flecha expand */}
        <button
          className={`w-4 h-4 flex items-center justify-center rounded shrink-0
                      transition-transform ${expanded ? "rotate-90" : ""}
                      ${hasChildren ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        >
          <ChevronRight size={11} />
        </button>

        {/* Icono carpeta */}
        {isActive || expanded
          ? <FolderOpen size={13} className="shrink-0" />
          : <Folder size={13} className="shrink-0" />
        }

        {/* Nombre */}
        <span className="truncate flex-1 font-medium">{node.name}</span>

        {/* Contador */}
        {node.files_count > 0 && (
          <span className="text-[9px] text-zinc-700 shrink-0">{node.files_count}</span>
        )}
      </div>

      {/* Hijos */}
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              currentFolderId={currentFolderId}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FolderTreeProps {
  tree: FolderTreeNode[];
  currentFolderId: number | null;
  onNavigate: (id: number | null) => void;
  onCreateFolder?: () => void;
}

export function FolderTree({
  tree, currentFolderId, onNavigate, onCreateFolder,
}: FolderTreeProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isFilesPage = pathname === "/files";

  if (!isFilesPage) return null;
  if (tree.length === 0) return null;

  return (
    <div className="px-3 pb-2">
      <div className="flex items-center justify-between px-2 mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Carpetas
        </p>
        {onCreateFolder && (
          <button
            onClick={onCreateFolder}
            className="w-5 h-5 flex items-center justify-center rounded text-zinc-600
                       hover:text-brand-400 hover:bg-brand-950/40 transition-colors"
            title="Nueva carpeta"
          >
            <Plus size={11} />
          </button>
        )}
      </div>
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          currentFolderId={currentFolderId}
          onNavigate={(id) => {
            onNavigate(id);
            navigate("/files");
          }}
        />
      ))}
    </div>
  );
}
