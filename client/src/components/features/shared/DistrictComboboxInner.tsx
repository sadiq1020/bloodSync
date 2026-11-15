"use client";

import * as React from "react";
import { Check, CaretUpDown, X } from "@phosphor-icons/react";
import { BANGLADESH_DISTRICTS, type District } from "@/lib/constants/districts";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface DistrictComboboxProps {
  value?: string;
  onChange: (value: District | undefined) => void;
  disabled?: boolean;
  error?: string;
  id?: string;
  aiFilled?: boolean;
  needsCheck?: boolean;
  hasAiFlash?: boolean;
  /** When true, renders an X button to clear the selection. onChange called with undefined. */
  clearable?: boolean;
}

export function DistrictComboboxInner({
  value,
  onChange,
  disabled,
  error,
  id = "district-combobox",
  aiFilled,
  needsCheck,
  hasAiFlash,
  clearable,
}: DistrictComboboxProps) {
  const [open, setOpen] = React.useState(false);

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
            District <span className="text-blood">*</span>
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
              className="rounded-[3px] bg-plasma/30 px-1 py-0.5 font-mono text-[10px] font-bold tracking-tight text-plasma"
              title="AI filled this district — please verify"
            >
              Check
            </span>
          )}
        </label>
        {needsCheck && (
          <span className="font-mono text-[10px] text-plasma">Verify</span>
        )}
      </div>

      <div className="relative flex items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            id={id}
            disabled={disabled}
            aria-expanded={open}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              "flex min-h-[40px] w-full items-center justify-between rounded-[4px] border border-line bg-surface px-3 py-2 text-left font-sans text-sm text-fg transition-colors",
              "hover:border-line-strong hover:bg-surface-raised",
              "focus-visible:outline-2 focus-visible:outline-blood",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-blood focus-visible:outline-blood",
              clearable && value && "pr-8",
              !value && "text-fg-dim"
            )}
          >
            <span className="truncate">
              {value || "Select district..."}
            </span>
            <CaretUpDown
              className="ml-2 size-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          </PopoverTrigger>

          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search district..." />
              <CommandList>
                <CommandEmpty>No district found.</CommandEmpty>
                <CommandGroup heading="Districts of Bangladesh">
                  {BANGLADESH_DISTRICTS.map((district) => (
                    <CommandItem
                      key={district}
                      value={district}
                      onSelect={() => {
                        onChange(district);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4 text-blood",
                          value === district ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden="true"
                      />
                      {district}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {clearable && value && !disabled && (
          <button
            type="button"
            aria-label="Clear district"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="absolute right-8 flex size-6 items-center justify-center rounded-[2px] text-fg-dim hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="font-mono text-xs text-blood-light"
        >
          {error}
        </p>
      )}
    </div>
  );
}

