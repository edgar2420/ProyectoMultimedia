import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { SystemInfo } from "../services/api";

export function useSystemInfo() {
  const [data, setData] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<SystemInfo>("/health/")
      .then((res) => setData(res.data))
      .catch(() => setError("No se pudo conectar con el backend"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
