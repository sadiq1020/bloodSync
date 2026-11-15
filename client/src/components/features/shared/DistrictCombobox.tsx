"use client";

import dynamic from "next/dynamic";
import type { DistrictComboboxProps } from "./DistrictComboboxInner";

export type { DistrictComboboxProps };

/**
 * DistrictCombobox — dynamically imported with next/dynamic to keep `cmdk`,
 * `@base-ui/react` popover, and the 64 districts list out of the critical bundle path.
 */
export const DistrictCombobox = dynamic<DistrictComboboxProps>(
  () =>
    import("./DistrictComboboxInner").then((mod) => mod.DistrictComboboxInner),
  {
    loading: () => (
      <div className="space-y-1.5 p-1 -m-1">
        <div className="h-4 w-20 rounded bg-surface-2 animate-pulse" />
        <div className="h-10 w-full rounded-[4px] border border-line bg-surface animate-pulse" />
      </div>
    ),
  }
);
