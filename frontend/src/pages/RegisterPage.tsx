import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "", email: "", password: "", confirmPassword: "",
    first_name: "", last_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.first_name, form.last_name);
      navigate("/");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> & { detail?: string } } })
        ?.response?.data;
      const msg = data?.detail ?? Object.values(data ?? {})[0]?.[0];
      setError(msg || "Ocurrió un error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 8) return { level: 0, label: "Muy corta", color: "bg-red-500" };
    if (p.length < 12) return { level: 1, label: "Débil", color: "bg-yellow-500" };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { level: 3, label: "Fuerte", color: "bg-brand-400" };
    return { level: 2, label: "Media", color: "bg-blue-500" };
  };

  const strength = passwordStrength();

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Únete a MediaVault y gestiona tus archivos"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/40 text-red-400 text-sm rounded-lg px-4 py-3">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre" placeholder="Edgar" value={form.first_name} onChange={set("first_name")} />
          <Input label="Apellido" placeholder="Rojas" value={form.last_name} onChange={set("last_name")} />
        </div>

        <Input
          label="Usuario *"
          placeholder="edgar_rojas"
          autoComplete="username"
          value={form.username}
          onChange={set("username")}
          leftIcon={<User size={14} />}
          required
        />

        <Input
          label="Correo electrónico *"
          type="email"
          placeholder="edgar@ejemplo.com"
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          leftIcon={<Mail size={14} />}
          required
        />

        <div>
          <Input
            label="Contraseña *"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            leftIcon={<Lock size={14} />}
            required
          />
          {strength && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-zinc-800 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all ${strength.color}`}
                  style={{ width: `${((strength.level + 1) / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500">{strength.label}</span>
            </div>
          )}
        </div>

        <div>
          <Input
            label="Confirmar contraseña *"
            type="password"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            leftIcon={
              form.confirmPassword
                ? form.confirmPassword === form.password
                  ? <CheckCircle size={14} className="text-brand-400" />
                  : <Lock size={14} />
                : <Lock size={14} />
            }
            required
          />
        </div>

        <Button type="submit" fullWidth loading={loading} className="mt-2">
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-600 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-brand-400 hover:text-brand-200 font-medium transition-colors">
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
