import { Server, Cpu, Database, Wifi } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useSystemInfo } from "../hooks/useSystemInfo";

const statCards = [
  { icon: Database, label: "Archivos totales", value: "0", sub: "Sin archivos aún" },
  { icon: Cpu, label: "Almacenamiento", value: "0 MB", sub: "Disponible" },
  { icon: Wifi, label: "Transferencias", value: "0", sub: "Este mes" },
  { icon: Server, label: "Versión API", value: "1.0.0", sub: "Estable" },
];

export function DashboardPage() {
  const { data, loading, error } = useSystemInfo();

  const connectionStatus = loading ? "loading" : error ? "offline" : "online";

  return (
    <MainLayout title="Dashboard" activePath="/">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">Bienvenido a MediaVault</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Sistema de gestión multimedia empresarial
          </p>
        </div>
        <div className="glass-card px-4 py-2.5 flex items-center gap-3">
          <StatusBadge status={connectionStatus} />
          {data && (
            <span className="text-xs text-zinc-600 border-l border-zinc-700 pl-3">
              {data.name}
            </span>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Backend info */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Server size={15} className="text-brand-400" />
          Estado del Sistema
        </h3>

        {loading && (
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            Conectando con el backend...
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-3">
            {error} — Asegúrate de que Django esté corriendo en el puerto 8000
          </div>
        )}

        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { k: "Servicio", v: data.name },
              { k: "Versión", v: data.version },
              { k: "Estado", v: data.status },
              { k: "Entorno", v: data.environment },
            ].map(({ k, v }) => (
              <div key={k} className="bg-zinc-800/40 rounded-lg px-4 py-3">
                <p className="text-xs text-zinc-600 mb-1">{k}</p>
                <p className="text-sm font-medium text-zinc-200 capitalize">{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Área vacía estilizada */}
      <div className="mt-6 glass-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-950 flex items-center justify-center mb-4">
          <Database size={28} className="text-brand-400" />
        </div>
        <h3 className="text-zinc-300 font-medium mb-2">Sin archivos multimedia</h3>
        <p className="text-sm text-zinc-600 max-w-xs">
          Completa la configuración inicial para comenzar a subir y gestionar tus archivos multimedia.
        </p>
        <button className="mt-5 px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium transition-colors">
          Comenzar
        </button>
      </div>
    </MainLayout>
  );
}
