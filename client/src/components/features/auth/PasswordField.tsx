"use client";

import * as React from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  id: string;
}

export const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(({ label, error, id, className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-xs uppercase tracking-wider text-fg-dim"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        <input
          ref={ref}
          id={id}
          type={showPassword ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-12 w-full rounded-[4px] border border-line bg-surface px-3.5 pr-12 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors",
            "focus-visible:border-blood focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-blood/70 focus-visible:border-blood",
            className
          )}
          {...props}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-pressed={showPassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-1 flex h-11 w-11 items-center justify-center rounded-[3px] text-fg-dim transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
        >
          {showPassword ? (
            <EyeSlash className="h-5 w-5" weight="bold" />
          ) : (
            <Eye className="h-5 w-5" weight="bold" />
          )}
        </button>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="font-sans text-xs text-blood animate-in fade-in duration-200"
        >
          {error}
        </p>
      )}
    </div>
  );
});

PasswordField.displayName = "PasswordField";
