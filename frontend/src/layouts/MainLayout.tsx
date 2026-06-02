import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "../components/sidebar/Sidebar";
import { Navbar } from "../components/navbar/Navbar";
import { FilePreview } from "../components/files/FilePreview";
import type { MediaFile } from "../services/files";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [quickPreview, setQuickPreview] = useState<MediaFile | null>(null);

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} onFileSelect={setQuickPreview} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Preview rápido desde la búsqueda del navbar */}
      {quickPreview && (
        <FilePreview file={quickPreview} onClose={() => setQuickPreview(null)} />
      )}
    </div>
  );
}
