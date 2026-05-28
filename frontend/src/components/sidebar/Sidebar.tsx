import {
  LayoutDashboard,
  FolderOpen,
  ImageIcon,
  Video,
  Music,
  FileText,
  Tag,
  Search,
  Settings,
  HardDrive,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FolderOpen, label: "Mis Archivos", path: "/files" },
  { icon: ImageIcon, label: "Imágenes", path: "/images" },
  { icon: Video, label: "Videos", path: "/videos" },
  { icon: Music, label: "Audio", path: "/audio" },
  { icon: FileText, label: "Documentos", path: "/documents" },
];

const bottomItems = [
  { icon: Tag, label: "Etiquetas", path: "/tags" },
  { icon: Search, label: "Búsqueda", path: "/search" },
  { icon: Settings, label: "Configuración", path: "/settings" },
];

interface SidebarProps {
  activePath?: string;
}

export function Sidebar({ activePath = "/" }: SidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 bg-zinc-900/80 border-r border-zinc-800/50 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800/50">
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
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Navegación
        </p>
        {navItems.map(({ icon: Icon, label, path }) => (
          <div
            key={path}
            className={`sidebar-item ${activePath === path ? "sidebar-item-active" : ""}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      {/* Nav inferior */}
      <div className="px-3 pb-4 border-t border-zinc-800/50 pt-3 space-y-0.5">
        {bottomItems.map(({ icon: Icon, label, path }) => (
          <div
            key={path}
            className={`sidebar-item ${activePath === path ? "sidebar-item-active" : ""}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
