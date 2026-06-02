import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface NavigationContextValue {
  currentFolderId: number | null;
  navigateToFolder: (id: number | null) => void;
  showCreateFolder: boolean;
  setShowCreateFolder: (v: boolean) => void;
  folderTreeVersion: number; // bump para re-fetch del árbol
  refreshTree: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderTreeVersion, setFolderTreeVersion] = useState(0);

  const navigateToFolder = useCallback((id: number | null) => {
    setCurrentFolderId(id);
  }, []);

  const refreshTree = useCallback(() => {
    setFolderTreeVersion((v) => v + 1);
  }, []);

  return (
    <NavigationContext.Provider value={{
      currentFolderId, navigateToFolder,
      showCreateFolder, setShowCreateFolder,
      folderTreeVersion, refreshTree,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be inside NavigationProvider");
  return ctx;
}
