import type { ReactNode } from "react";
import { Sidebar } from "../components/sidebar/Sidebar";
import { Navbar } from "../components/navbar/Navbar";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  activePath?: string;
}

export function MainLayout({ children, title, activePath }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar activePath={activePath} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
