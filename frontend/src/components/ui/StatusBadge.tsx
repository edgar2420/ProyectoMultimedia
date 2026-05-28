interface StatusBadgeProps {
  status: "online" | "offline" | "loading";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    online: { dot: "bg-brand-400", text: "text-brand-400", label: "Online" },
    offline: { dot: "bg-red-500", text: "text-red-400", label: "Offline" },
    loading: { dot: "bg-yellow-500 animate-pulse", text: "text-yellow-400", label: "Conectando..." },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
