import { useState, useCallback } from "react";
import { FolderPlus, Filter, RefreshCw } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { DropZone } from "../components/upload/DropZone";
import { UploadQueue } from "../components/upload/UploadQueue";
import { FileGrid } from "../components/files/FileGrid";
import { FileListView } from "../components/files/FileListView";
import { FilePreview } from "../components/files/FilePreview";
import { FolderCard } from "../components/folders/FolderCard";
import { BreadcrumbNav } from "../components/folders/BreadcrumbNav";
import { CreateFolderModal } from "../components/folders/CreateFolderModal";
import { MoveFileModal } from "../components/folders/MoveFileModal";
import { TagFilter } from "../components/tags/TagFilter";
import { TagFileModal } from "../components/tags/TagFileModal";
import { SortBar } from "../components/ui/SortBar";
import { ViewToggle } from "../components/ui/ViewToggle";
import { SelectionBar } from "../components/ui/SelectionBar";
import type { ViewMode } from "../components/ui/ViewToggle";
import { useFiles } from "../hooks/useFiles";
import { useUpload } from "../hooks/useUpload";
import { useFolders, useBreadcrumb, useFolderTree } from "../hooks/useFolders";
import { useTags } from "../hooks/useTags";
import { useNavigation } from "../context/NavigationContext";
import type { MediaFile, Folder, SortBy, SortOrder } from "../services/files";
import { filesService } from "../services/files";

const TYPE_FILTERS = [
  { value: "",         label: "Todos"    },
  { value: "image",    label: "Imágenes" },
  { value: "video",    label: "Videos"   },
  { value: "audio",    label: "Audio"    },
  { value: "document", label: "Docs"     },
];

export function FilesPage() {
  const {
    currentFolderId, navigateToFolder,
    showCreateFolder, setShowCreateFolder, refreshTree,
  } = useNavigation();

  const [activeType, setActiveType]         = useState("");
  const [search, setSearch]                 = useState("");
  const [sortBy, setSortBy]                 = useState<SortBy>("date");
  const [sortOrder, setSortOrder]           = useState<SortOrder>("desc");
  const [viewMode, setViewMode]             = useState<ViewMode>("grid");
  const [preview, setPreview]               = useState<MediaFile | null>(null);
  const [moveTarget, setMoveTarget]         = useState<MediaFile | null>(null);
  const [tagTarget, setTagTarget]           = useState<MediaFile | null>(null);
  const [selectedIds, setSelectedIds]       = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting]     = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const { tags } = useTags();

  const crumbs = useBreadcrumb(currentFolderId);
  const { folders, remove: removeFolder, create: createFolder, rename: renameFolder }
    = useFolders(currentFolderId);
  const { tree } = useFolderTree();
  const { files, loading, error, refetch, remove: removeFile, addFile } = useFiles({
    folder_id: currentFolderId,
    type: activeType || undefined,
    search: search || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
  });

  const { queue, uploadFiles, clearDone } = useUpload(useCallback((file: MediaFile) => {
    addFile(file);
    refreshTree();
  }, [addFile, refreshTree]));
  const uploading = queue.some((i) => i.status === "uploading" || i.status === "pending");

  const handleNavigate = (folderId: number | null) => {
    navigateToFolder(folderId);
    setActiveType("");
    setSearch("");
    setSelectedIds(new Set());
    setSelectedTagIds([]);
  };

  const toggleTag = useCallback((tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const deleteSelected = useCallback(async () => {
    if (!confirm(`¿Eliminar ${selectedIds.size} archivo(s)?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all([...selectedIds].map((id) => filesService.delete(id)));
      selectedIds.forEach((id) => removeFile(id));
      setSelectedIds(new Set());
      refreshTree();
    } finally { setBulkDeleting(false); }
  }, [selectedIds, removeFile, refreshTree]);

  const handleCreateFolder = useCallback(async (name: string) => {
    const f = await createFolder(name);
    refreshTree();
    return f;
  }, [createFolder, refreshTree]);

  const handleDeleteFolder = useCallback(async (id: number) => {
    await removeFolder(id);
    refreshTree();
  }, [removeFolder, refreshTree]);

  const handleRenameFolder = useCallback(async (id: number, newName: string) => {
    await renameFolder(id, newName);
    refreshTree();
  }, [renameFolder, refreshTree]);

  const handleRemoveFile = useCallback(async (id: number) => {
    await removeFile(id);
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    refreshTree();
  }, [removeFile, refreshTree]);

  return (
    <MainLayout title="Mis Archivos">
      {/* Breadcrumb */}
      <div className="mb-4">
        <BreadcrumbNav crumbs={crumbs} onNavigate={handleNavigate} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">
            {crumbs.length > 0 ? crumbs[crumbs.length - 1].name : "Mis Archivos"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {folders.length > 0 && `${folders.length} carpeta${folders.length !== 1 ? "s" : ""} · `}
            {loading ? "cargando..." : `${files.length} archivo${files.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                       text-brand-400 hover:text-brand-200 hover:bg-brand-950/40
                       transition-colors border border-brand-800/40"
          >
            <FolderPlus size={15} /> Nueva carpeta
          </button>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={refetch}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400
                       hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* DropZone */}
      <div className="mb-4">
        <DropZone onFiles={(f) => uploadFiles(f, currentFolderId)} disabled={uploading} />
      </div>

      {/* Cola de subida */}
      {queue.length > 0 && (
        <div className="mb-4">
          <UploadQueue queue={queue} onClearDone={clearDone} />
        </div>
      )}

      {/* SelectionBar */}
      {selectedIds.size > 0 && (
        <div className="mb-4">
          <SelectionBar
            count={selectedIds.size}
            total={files.length}
            onSelectAll={() => setSelectedIds(new Set(files.map((f) => f.id)))}
            onClear={() => setSelectedIds(new Set())}
            onDeleteSelected={deleteSelected}
            deleting={bulkDeleting}
          />
        </div>
      )}

      {/* Filtros + Sort */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/50
                          rounded-xl p-1">
            <Filter size={13} className="text-zinc-600 ml-2 shrink-0" />
            {TYPE_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveType(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeType === value
                    ? "bg-brand-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar archivos..."
            className="sm:max-w-xs w-full bg-zinc-900/60 border border-zinc-800/50 rounded-xl
                       px-4 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none
                       focus:border-brand-600/40 focus:ring-1 focus:ring-brand-600/20 transition-all"
          />
          <div className="sm:ml-auto">
            <SortBar
              sortBy={sortBy}
              sortOrder={sortOrder}
              onChange={(by, order) => { setSortBy(by); setSortOrder(order); }}
            />
          </div>
        </div>

        {/* Filtro por etiquetas */}
        {tags.length > 0 && (
          <TagFilter
            tags={tags}
            selectedTagIds={selectedTagIds}
            onToggle={toggleTag}
            onClear={() => setSelectedTagIds([])}
          />
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/30 border border-red-900/40
                        rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Carpetas */}
      {folders.length > 0 && !activeType && !search && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">
            Carpetas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onOpen={(f: Folder) => handleNavigate(f.id)}
                onDelete={handleDeleteFolder}
                onRename={handleRenameFolder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Archivos */}
      {(files.length > 0 || loading || activeType || search) && (
        <div>
          {folders.length > 0 && !activeType && !search && (
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">
              Archivos
            </p>
          )}
          {viewMode === "grid" ? (
            <FileGrid
              files={files}
              loading={loading}
              onDelete={handleRemoveFile}
              onPreview={setPreview}
              onTag={setTagTarget}
            />
          ) : (
            <FileListView
              files={files}
              loading={loading}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDelete={handleRemoveFile}
              onPreview={setPreview}
              onMove={setMoveTarget}
              onTag={setTagTarget}
            />
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!loading && folders.length === 0 && files.length === 0 && !activeType && !search && (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center mt-2">
          <div className="w-16 h-16 rounded-2xl bg-brand-950 flex items-center justify-center mb-4">
            <FolderPlus size={28} className="text-brand-400" />
          </div>
          <h3 className="text-zinc-300 font-medium mb-2">Carpeta vacía</h3>
          <p className="text-sm text-zinc-600 max-w-xs">
            Arrastra archivos o crea una subcarpeta para organizar tu contenido.
          </p>
        </div>
      )}

      {/* Modales */}
      {showCreateFolder && (
        <CreateFolderModal
          onConfirm={handleCreateFolder}
          onClose={() => setShowCreateFolder(false)}
        />
      )}
      {preview && <FilePreview file={preview} onClose={() => setPreview(null)} />}
      {moveTarget && (
        <MoveFileModal
          file={moveTarget}
          tree={tree}
          onClose={() => setMoveTarget(null)}
          onMoved={() => { refetch(); refreshTree(); }}
        />
      )}
      {tagTarget && (
        <TagFileModal
          fileId={tagTarget.id}
          fileName={tagTarget.original_name}
          allTags={tags}
          currentTagIds={tagTarget.tags.map((t) => t.id)}
          onClose={() => setTagTarget(null)}
          onSaved={() => { refetch(); setTagTarget(null); }}
          onTagCreated={() => { /* useTags se actualiza solo en TagsPage */ }}
        />
      )}
    </MainLayout>
  );
}
