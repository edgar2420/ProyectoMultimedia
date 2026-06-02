import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-zinc-400">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-zinc-800/60 border rounded-lg px-3 py-2.5 text-sm text-zinc-100
            placeholder:text-zinc-600 outline-none transition-all duration-150
            focus:ring-2 focus:ring-brand-600/40 focus:border-brand-600/60
            ${error ? "border-red-500/60" : "border-zinc-700/60"}
            ${leftIcon ? "pl-9" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
