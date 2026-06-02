import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children, variant = "primary", loading = false,
  fullWidth = false, className = "", disabled, ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium px-4 py-2.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-800 text-white shadow-sm shadow-brand-600/20 active:scale-[.98]",
    ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60",
    danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
