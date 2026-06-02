import { LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { SearchBar } from "../search/SearchBar";
import type { MediaFile } from "../../services/files";

interface NavbarProps {
  title?: string;
  onFileSelect?: (file: MediaFile) => void;
}

export function Navbar({ title = "Dashboard", onFileSelect }: NavbarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user
    ? (user.first_name?.[0] ?? user.username[0]).toUpperCase()
    : "?";

  return (
    <header className="h-14 bg-zinc-900/50 border-b border-zinc-800/50 flex items-center
                       justify-between px-6 sticky top-0 z-10 backdrop-blur-sm">
      <h1 className="text-sm font-semibold text-zinc-200 shrink-0 mr-6">{title}</h1>

      {/* SearchBar global */}
      <div className="flex-1 flex items-center justify-center max-w-md">
        <SearchBar onFileSelect={onFileSelect} />
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg
                       hover:bg-zinc-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-800 flex items-center
                            justify-center text-xs font-semibold text-brand-200">
              {initials}
            </div>
            <span className="text-xs text-zinc-400 hidden sm:block max-w-[80px] truncate">
              {user?.full_name || user?.username}
            </span>
            <ChevronDown size={12} className="text-zinc-600" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-zinc-900 border
                              border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <p className="text-sm font-medium text-zinc-200">
                    {user?.full_name || user?.username}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm
                             text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
