"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PhoneFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  aiFilled?: boolean;
  needsCheck?: boolean;
  hasAiFlash?: boolean;
}

export const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
  (
    {
      id = "phone-field",
      label = "Phone Number",
      required = true,
      error,
      aiFilled,
      needsCheck,
      hasAiFlash,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "space-y-1.5 p-1 -m-1 rounded-[6px] transition-colors",
          hasAiFlash && "ai-flash"
        )}
      >
        <div className="flex items-baseline justify-between">
          <label
            htmlFor={id}
            className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-fg-dim"
          >
            <span>
              {label} {required && <span className="text-blood">*</span>}
            </span>
            {aiFilled && (
              <span
                className="rounded-[3px] bg-blood-deep/40 px-1 py-0.5 font-mono text-[10px] font-bold tracking-tight text-blood-light"
                title="Suggested by AI"
              >
                AI
              </span>
            )}
            {needsCheck && (
              <span
                className="rounded-[3px] bg-plasma/20 px-1 py-0.5 font-mono text-[10px] font-bold tracking-tight text-plasma"
                title="Please check this field"
              >
                CHECK
              </span>
            )}
          </label>
          <span className="font-mono text-[11px] text-fg-dim">
            01XXXXXXXXX or +8801XXXXXXXXX
          </span>
        </div>

        <input
          id={id}
          ref={ref}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          disabled={disabled}
          placeholder="01XXXXXXXXX"
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "flex h-12 w-full rounded-[6px] border bg-surface-2 px-3.5 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors outline-none",
            "border-line hover:border-line-strong",
            "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-blood focus-visible:ring-blood",
            className
          )}
          {...props}
        />

        <p className="font-sans text-xs text-fg-dim">
          Bangla digits (০–৯) are automatically converted to standard numbers.
        </p>

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="font-sans text-xs text-blood-light"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

PhoneField.displayName = "PhoneField";
