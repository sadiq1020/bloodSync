"use client";

import * as React from "react";
import { Check, Minus } from "@phosphor-icons/react";
import {
  BLOOD_GROUPS,
  canDonateTo,
  type BloodGroup,
} from "@/lib/constants/blood-compatibility";
import { formatBloodGroup } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CompatibilityMatrixProps {
  selectedGroup: BloodGroup;
  onSelectGroup: (group: BloodGroup) => void;
}

export function CompatibilityMatrix({
  selectedGroup,
  onSelectGroup,
}: CompatibilityMatrixProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-fg">
            8×8 Red Blood Cell Matrix
          </h3>
          <p className="font-sans text-xs text-fg-muted">
            Click any row, column header, or cell to highlight compatibility relationships.
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-fg-dim">
          <span className="flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-[3px] bg-blood-deep/40 text-blood-light">
              <Check weight="bold" className="size-3" />
            </span>
            Compatible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-[3px] bg-surface-2 text-fg-dim">
              <Minus weight="bold" className="size-3" />
            </span>
            Incompatible
          </span>
        </div>
      </div>

      {/* Overflow wrapper for mobile scrolling */}
      <div className="relative overflow-x-auto rounded-[6px] border border-line bg-surface">
        <table
          className="w-full border-collapse font-sans text-xs"
          aria-label="Red blood cell donor and recipient compatibility matrix"
        >
          <thead>
            {/* Top row: Recipients Header */}
            <tr className="border-b border-line bg-surface-2/70 font-mono text-[11px]">
              <th
                scope="col"
                className="p-3 text-left font-semibold text-fg-dim border-r border-line"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-fg-dim">
                    RECIPIENT &rarr;
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-blood-light font-bold">
                    DONOR &darr;
                  </span>
                </div>
              </th>
              {BLOOD_GROUPS.map((recipient) => {
                const isSelected = selectedGroup === recipient;
                return (
                  <th
                    key={recipient}
                    scope="col"
                    onClick={() => onSelectGroup(recipient)}
                    className={cn(
                      "cursor-pointer p-2 text-center transition-colors hover:bg-surface-2 select-none",
                      isSelected && "bg-blood-deep/30 text-blood-light font-bold"
                    )}
                    title={`Select recipient ${recipient}`}
                  >
                    <span className="font-mono text-xs font-semibold">
                      {formatBloodGroup(recipient)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {BLOOD_GROUPS.map((donor) => {
              const isDonorSelected = selectedGroup === donor;

              return (
                <tr
                  key={donor}
                  className={cn(
                    "border-b border-line/60 transition-colors last:border-b-0",
                    isDonorSelected ? "bg-blood-deep/15" : "hover:bg-surface-2/40"
                  )}
                >
                  {/* Row Header (Donor) */}
                  <th
                    scope="row"
                    onClick={() => onSelectGroup(donor)}
                    className={cn(
                      "cursor-pointer border-r border-line p-2.5 text-left font-mono text-xs font-semibold transition-colors hover:bg-surface-2 select-none",
                      isDonorSelected ? "bg-blood-deep/40 text-blood-light font-bold" : "text-fg"
                    )}
                    title={`Select donor ${donor}`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {formatBloodGroup(donor)}
                      {donor === "O-" && (
                        <span className="rounded-[3px] bg-blood-deep/50 px-1 py-0.2 font-mono text-[9px] uppercase tracking-wider text-blood-light">
                          Univ
                        </span>
                      )}
                    </span>
                  </th>

                  {/* Matrix Cells */}
                  {BLOOD_GROUPS.map((recipient) => {
                    const compatible = canDonateTo(donor, recipient);
                    const isCellSelected =
                      selectedGroup === donor || selectedGroup === recipient;

                    return (
                      <td
                        key={`${donor}-${recipient}`}
                        onClick={() => onSelectGroup(donor)}
                        className={cn(
                          "cursor-pointer p-2 text-center transition-colors select-none",
                          isCellSelected && "bg-blood-deep/10",
                          selectedGroup === donor && selectedGroup === recipient && "bg-blood-deep/30"
                        )}
                        title={`Donor ${donor} to Recipient ${recipient}: ${
                          compatible ? "Compatible" : "Incompatible"
                        }`}
                        aria-label={`Donor ${donor} to Recipient ${recipient}: ${
                          compatible ? "Compatible" : "Incompatible"
                        }`}
                      >
                        {compatible ? (
                          <span className="inline-flex size-6 items-center justify-center rounded-[3px] bg-blood-deep/30 text-blood-light font-semibold">
                            <Check weight="bold" className="size-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex size-6 items-center justify-center text-fg-dim/40">
                            <Minus className="size-3" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
