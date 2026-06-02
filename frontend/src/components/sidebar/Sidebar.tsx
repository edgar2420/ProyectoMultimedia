import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FolderOpen, ImageIcon, Video,
  Music, FileText, Tag, Search, Settings, HardDrive,
} from "lucide-react";
import { FolderTree } from "../folders/FolderTree";
import { useFolderTree } from "../../hooks/useFolders";
import { useTags } from "../../hooks/useTags";
import { useNavigation } from "../../context/NavigationContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",   path: "/" },
  { icon: FolderOpen,      label: "Mis Archivos", path: "/files" },
  { icon: ImageIcon,       label: "Imágenes",     path: "/files", type: "image" },
  { icon: Video,           label: "Videos",       path: "/files", type: "video" },
  { icon: Music,           label: "Audio",        path: "/files", type: "audio" },
  { icon: FileText,        label: "Documentos",   path: "/files", type: "document" },
];

const bottomItems = [
  { icon: Tag,      label: "Etiquetas",     path: "/tags" },
  { icon: Search,   label: "Búsqueda",      path: "/search" },
  { icon: Settings, label: "Configuración", path: "/settings" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentFolderId, navigateToFolder, setShowCreateFolder } = useNavigation();
  const { tree } = useFolderTree();
  const { tags } = useTags();

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <aside className="w-60 flex-shrink-0 bg-zinc-900/80 border-r border-zinc-800/50
                      flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <HardDrive size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">MediaVault</p>
            <p className="text-xs text-zinc-500">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="px-3 py-3 space-y-0.5 shrink-0">
        <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Navegación
        </p>
        {navItems.map(({ icon: Icon, label, path, type }) => {
          const active = isActive(path) && !type;
          return (
            <div
              key={label}
              onClick={() => {
                navigateToFolder(null);
                navigate(type ? `/files?type=${type}` : path);
              }}
              className={`sidebar-item ${active ? "sidebar-item-active" : ""}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </div>
          );
        })}
      </nav>

      {/* Árbol de carpetas (solo en /files) */}
      {tree.length > 0 && (
        <>
          <div className="mx-3 border-t border-zinc-800/50" />
          <div className="py-2 flex-1">
            <FolderTree
              tree={tree}
              currentFolderId={currentFolderId}
              onNavigate={navigateToFolder}
              onCreateFolder={() => setShowCreateFolder(true)}
            />
          </div>
        </>
      )}

      {/* Sección Etiquetas */}
      {tags.length > 0 && (
        <div className="px-3 py-2 border-t border-zinc-800/50 shrink-0">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Etiquetas
          </p>
          <div className="space-y-0.5">
            {tags.slice(0, 7).map((tag) => (
              <div
                key={tag.id}
                onClick={() => navigate(`/files?tag_id=${tag.id}`)}
                className="sidebar-item"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 truncate">{tag.name}</span>
                <span className="text-[10px] text-zinc-700 shrink-0">{tag.file_count}</span>
              </div>
            ))}
            {tags.length > 7 && (
              <div
                onClick={() => navigate("/tags")}
                className="sidebar-item text-zinc-600 hover:text-zinc-400"
              >
                <span className="text-xs pl-5">Ver todas ({tags.length})...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nav inferior */}
      <div className="px-3 pb-4 border-t border-zinc-800/50 pt-3 space-y-0.5 shrink-0">
        {bottomItems.map(({ icon: Icon, label, path }) => (
          <div
            key={path}
            onClick={() => navigate(path)}
            className={`sidebar-item ${isActive(path) ? "sidebar-item-active" : ""}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
