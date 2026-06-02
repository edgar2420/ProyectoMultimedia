import { useEffect, useState } from "react";
import { Server, Database, HardDrive, Wifi, FolderOpen, ImageIcon, Video, Music, FileText, RefreshCw, Sun, Sunset, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useSystemInfo } from "../hooks/useSystemInfo";
import { useAuth } from "../context/AuthContext";
import { statsService } from "../services/files";
import type { MediaStats } from "../services/files";
import { formatBytes } from "../services/files";

export function DashboardPage() {
  const { data, loading: sysLoading, error: sysError } = useSystemInfo();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]         = useState<MediaStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = () => {
    setStatsLoading(true);
    statsService.get()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  };

  useEffect(() => { loadStats(); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const GreetingIcon = hour < 12 ? Sun : hour < 18 ? Sunset : Moon;
  const connectionStatus = sysLoading ? "loading" : sysError ? "offline" : "online";

  const statCards = [
    {
      icon: Database,
      label: "Archivos totales",
      value: statsLoading ? "…" : String(stats?.total_files ?? 0),
      sub: statsLoading ? "Cargando..." : `${stats?.by_type.image ?? 0} img · ${stats?.by_type.video ?? 0} vid · ${stats?.by_type.audio ?? 0} aud`,
    },
    {
      icon: HardDrive,
      label: "Almacenamiento",
      value: statsLoading ? "…" : formatBytes(stats?.total_size ?? 0),
      sub: statsLoading ? "Cargando..." : `${stats?.by_type.document ?? 0} doc · ${stats?.by_type.other ?? 0} otros`,
    },
    {
      icon: Wifi,
      label: "Transferencias",
      value: "0",
      sub: "Este mes",
    },
    {
      icon: Server,
      label: "Versión API",
      value: "1.0.0",
      sub: "Estable",
    },
  ];

  const quickActions = [
    {
      icon: FolderOpen, label: "Todos los archivos",
      sub: statsLoading ? "…" : `${stats?.total_files ?? 0} archivo${stats?.total_files !== 1 ? "s" : ""}`,
      color: "text-blue-400", bg: "bg-blue-950/40", path: "/files",
    },
    {
      icon: ImageIcon, label: "Imágenes",
      sub: statsLoading ? "…" : `${stats?.by_type.image ?? 0} imagen${stats?.by_type.image !== 1 ? "es" : ""}`,
      color: "text-purple-400", bg: "bg-purple-950/40", path: "/files?type=image",
    },
    {
      icon: Video, label: "Videos",
      sub: statsLoading ? "…" : `${stats?.by_type.video ?? 0} video${stats?.by_type.video !== 1 ? "s" : ""}`,
      color: "text-orange-400", bg: "bg-orange-950/40", path: "/files?type=video",
    },
    {
      icon: Music, label: "Audio",
      sub: statsLoading ? "…" : `${stats?.by_type.audio ?? 0} audio${stats?.by_type.audio !== 1 ? "s" : ""}`,
      color: "text-pink-400", bg: "bg-pink-950/40", path: "/files?type=audio",
    },
  ];

  return (
    <MainLayout title="Dashboard">
      {/* Greeting */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
            {greeting}, {user?.first_name || user?.username}
            <GreetingIcon size={22} className="text-brand-400" />
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Bienvenido a MediaVault — tu gestor multimedia empresarial
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500
                       hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title="Actualizar estadísticas"
          >
            <RefreshCw size={14} className={statsLoading ? "animate-spin" : ""} />
          </button>
          <div className="glass-card px-4 py-2.5 flex items-center gap-3">
            <StatusBadge status={connectionStatus} />
            {data && (
              <span className="text-xs text-zinc-600 border-l border-zinc-700 pl-3">
                {data.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
              <div className="w-7 h-7 rounded-md bg-brand-950 flex items-center justify-center">
                <Icon size={14} className="text-brand-400" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Barra de distribución por tipo */}
      {stats && stats.total_files > 0 && (
        <div className="glass-card p-4 mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Distribución por tipo
          </p>
          <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-3">
            {[
              { type: "image",    count: stats.by_type.image,    color: "bg-purple-500" },
              { type: "video",    count: stats.by_type.video,    color: "bg-orange-500" },
              { type: "audio",    count: stats.by_type.audio,    color: "bg-pink-500"   },
              { type: "document", count: stats.by_type.document, color: "bg-blue-500"   },
              { type: "other",    count: stats.by_type.other,    color: "bg-zinc-600"   },
            ]
              .filter((s) => s.count > 0)
              .map((s) => (
                <div
                  key={s.type}
                  className={`${s.color} transition-all`}
                  style={{ width: `${(s.count / stats.total_files) * 100}%` }}
                />
              ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Imágenes",    count: stats.by_type.image,    dot: "bg-purple-500", icon: ImageIcon },
              { label: "Videos",      count: stats.by_type.video,    dot: "bg-orange-500", icon: Video     },
              { label: "Audio",       count: stats.by_type.audio,    dot: "bg-pink-500",   icon: Music     },
              { label: "Documentos",  count: stats.by_type.document, dot: "bg-blue-500",   icon: FileText  },
            ].map(({ label, count, dot, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dot}`} />
                <Icon size={11} className="text-zinc-600" />
                <span className="text-xs text-zinc-400">{label}</span>
                <span className="text-xs font-semibold text-zinc-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">Acceso rápido</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, sub, color, bg, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="glass-card p-4 text-left hover:border-zinc-700 transition-colors group"
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                {label}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Info backend + sesión */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Server size={15} className="text-brand-400" />
            Estado del Sistema
          </h3>
          {sysLoading && (
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              Conectando...
            </div>
          )}
          {sysError && (
            <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
              {sysError}
            </p>
          )}
          {data && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "Servicio", v: data.name },
                { k: "Versión",  v: data.version },
                { k: "Estado",   v: data.status },
                { k: "Entorno",  v: data.environment },
              ].map(({ k, v }) => (
                <div key={k} className="bg-zinc-800/40 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-zinc-600 mb-0.5">{k}</p>
                  <p className="text-sm font-medium text-zinc-200 capitalize">{v}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Database size={15} className="text-brand-400" />
            Sesión Activa
          </h3>
          {user && (
            <div className="space-y-2">
              {[
                { k: "Usuario", v: user.username },
                { k: "Nombre",  v: user.full_name || "—" },
                { k: "Email",   v: user.email },
                { k: "Estado",  v: user.is_active ? "Activo" : "Inactivo" },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                  <span className="text-xs text-zinc-600">{k}</span>
                  <span className="text-xs font-medium text-zinc-300 truncate max-w-[160px]">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
