"use client";

import * as React from "react";
import { BLOOD_GROUPS, type BloodGroup } from "@/lib/constants/bloodGroups";
import { formatBloodGroup } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BloodGroupPickerProps {
  value?: BloodGroup | string;
  onChange: (value: BloodGroup) => void;
  disabled?: boolean;
  error?: string;
}

export function BloodGroupPicker({
  value,
  onChange,
  disabled,
  error,
}: BloodGroupPickerProps) {
  return (
    <fieldset className="space-y-2">
      <div className="flex items-baseline justify-between">
        <legend className="font-mono text-xs font-medium uppercase tracking-wider text-fg-dim">
          Blood Group <span className="text-blood">*</span>
        </legend>
        <span className="font-mono text-[11px] text-fg-dim">Required</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Select blood group"
        className="grid grid-cols-4 gap-2"
      >
        {BLOOD_GROUPS.map((group) => {
          const isSelected = value === group;
          const display = formatBloodGroup(group);
          const signMatch = display.match(/[+−]$/);
          const sign = signMatch ? signMatch[0] : "";
          const letter = signMatch ? display.slice(0, -1) : display;

          return (
            <label
              key={group}
              className={cn(
                "group relative flex min-h-[52px] cursor-pointer flex-col items-center justify-center rounded-[6px] border text-center transition-all duration-150 select-none",
                "focus-within:ring-2 focus-within:ring-blood focus-within:ring-offset-2 focus-within:ring-offset-bg",
                disabled && "cursor-not-allowed opacity-50",
                isSelected
                  ? "border-blood bg-blood-deep/20 shadow-xs"
                  : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"
              )}
            >
              <input
                type="radio"
                name="bloodGroup"
                value={group}
                checked={isSelected}
                onChange={() => onChange(group)}
                disabled={disabled}
                className="sr-only"
              />

              <span className="inline-flex items-baseline font-display text-lg font-semibold leading-none text-fg">
                <span>{letter}</span>
                {sign && (
                  <span
                    className={cn(
                      "text-xs font-bold leading-none -translate-y-1 ml-0.5",
                      isSelected ? "text-blood-light" : "text-blood"
                    )}
                  >
                    {sign}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      <p className="font-sans text-xs text-fg-dim">
        Blood group does not change. Edit it only if you entered it wrongly.
      </p>

      {error && (
        <p role="alert" className="font-sans text-xs text-blood-light">
          {error}
        </p>
      )}
    </fieldset>
  );
}
