"use client";

import * as React from "react";
import { Check, CaretUpDown } from "@phosphor-icons/react";
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
  onChange: (value: District) => void;
  disabled?: boolean;
  error?: string;
  id?: string;
  aiFilled?: boolean;
  needsCheck?: boolean;
  hasAiFlash?: boolean;
}

export function DistrictCombobox({
  value,
  onChange,
  disabled,
  error,
  id = "district-combobox",
  aiFilled,
  needsCheck,
  hasAiFlash,
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
              className="rounded-[3px] bg-plasma/20 px-1 py-0.5 font-mono text-[10px] font-bold tracking-tight text-plasma"
              title="Please check this field"
            >
              CHECK
            </span>
          )}
        </label>
        <span className="font-mono text-[11px] text-fg-dim">64 Districts</span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-[6px] border bg-surface px-3.5 font-sans text-sm transition-colors outline-none",
            "border-line hover:border-line-strong",
            "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-blood focus-visible:ring-blood",
            !value && "text-fg-dim"
          )}
        >
          <span className="truncate">{value || "Select your district..."}</span>
          <CaretUpDown
            className="size-4 shrink-0 text-fg-dim"
            aria-hidden="true"
          />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[var(--anchor-width)] min-w-[280px] p-0 border border-line bg-surface shadow-2xl"
        >
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Type district name..."
              className="h-11"
            />
            <CommandList className="max-h-60">
              <CommandEmpty>No district found.</CommandEmpty>
              <CommandGroup>
                {BANGLADESH_DISTRICTS.map((district) => {
                  const isSelected = value === district;
                  return (
                    <CommandItem
                      key={district}
                      value={district}
                      onSelect={() => {
                        onChange(district);
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center justify-between py-2 text-sm"
                    >
                      <span>{district}</span>
                      {isSelected && (
                        <Check
                          weight="bold"
                          className="size-4 text-blood shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <p role="alert" className="font-sans text-xs text-blood-light">
          {error}
        </p>
      )}
    </div>
  );
}
