"use client";

import * as React from "react";
import type { BloodGroup } from "@/lib/constants/blood-compatibility";

interface MatrixHighlightWrapperProps {
  selectedGroup: BloodGroup;
  children: React.ReactNode;
}

/**
 * MatrixHighlightWrapper (Client Component)
 * Tiny wrapper that dynamically applies row and column highlight classes
 * to the server-rendered 8x8 compatibility matrix table.
 */
export function MatrixHighlightWrapper({
  selectedGroup,
  children,
}: MatrixHighlightWrapperProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Clear previous highlights
    root.querySelectorAll(".matrix-active-row").forEach((el) => {
      el.classList.remove("matrix-active-row", "bg-blood-deep/20");
    });
    root.querySelectorAll(".matrix-active-header").forEach((el) => {
      el.classList.remove("matrix-active-header", "text-blood-light", "font-bold");
    });
    root.querySelectorAll(".matrix-active-col").forEach((el) => {
      el.classList.remove("matrix-active-col", "bg-blood-deep/15");
    });
    root.querySelectorAll(".matrix-active-col-header").forEach((el) => {
      el.classList.remove("matrix-active-col-header", "bg-blood-deep/30", "text-blood-light", "font-bold");
    });

    // Highlight donor row
    const row = root.querySelector(`tr[data-donor-row="${CSS.escape(selectedGroup)}"]`);
    if (row) {
      row.classList.add("matrix-active-row", "bg-blood-deep/20");
      const th = row.querySelector("th");
      if (th) {
        th.classList.add("matrix-active-header", "text-blood-light", "font-bold");
      }
    }

    // Highlight recipient column header
    const colHeader = root.querySelector(`th[data-recipient-col="${CSS.escape(selectedGroup)}"]`);
    if (colHeader) {
      colHeader.classList.add("matrix-active-col-header", "bg-blood-deep/30", "text-blood-light", "font-bold");
    }

    // Highlight recipient cells
    const cells = root.querySelectorAll(`td[data-cell-recipient="${CSS.escape(selectedGroup)}"]`);
    cells.forEach((cell) => {
      cell.classList.add("matrix-active-col", "bg-blood-deep/15");
    });
  }, [selectedGroup]);

  return <div ref={containerRef}>{children}</div>;
}

