import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, AlertCircle } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(msg || "Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="MediaVault"
      subtitle="Inicia sesión para gestionar tus archivos multimedia"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/40 text-red-400 text-sm rounded-lg px-4 py-3">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="Usuario"
          placeholder="tu_usuario"
          autoComplete="username"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          leftIcon={<User size={14} />}
          required
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          leftIcon={<Lock size={14} />}
          required
        />

        <Button type="submit" fullWidth loading={loading} className="mt-2">
          Iniciar sesión
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-600 mt-6">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-brand-400 hover:text-brand-200 font-medium transition-colors">
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}
