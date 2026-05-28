import { Bell, Search, User } from "lucide-react";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "Dashboard" }: NavbarProps) {
  return (
    <header className="h-14 bg-zinc-900/50 border-b border-zinc-800/50 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm">
      <h1 className="text-sm font-semibold text-zinc-200">{title}</h1>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
          <Search size={15} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
          <Bell size={15} />
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center ml-1">
          <User size={14} className="text-brand-200" />
        </div>
      </div>
    </header>
  );
}
