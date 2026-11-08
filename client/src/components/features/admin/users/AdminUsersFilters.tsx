"use client";

import * as React from "react";
import { useQueryStates, debounce } from "nuqs";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import {
  adminUsersParsers,
  type AdminUserRole,
  type AdminUserStatus,
} from "@/lib/search-params/admin-users";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: Array<{ label: string; value: AdminUserRole | null }> = [
  { label: "All roles", value: null },
  { label: "Users", value: "USER" },
  { label: "Admins", value: "ADMIN" },
];

const STATUS_OPTIONS: Array<{ label: string; value: AdminUserStatus | null }> = [
  { label: "All status", value: null },
  { label: "Active", value: "ACTIVE" },
  { label: "Blocked", value: "BLOCKED" },
];

export function AdminUsersFilters() {
  const [params, setParams] = useQueryStates(adminUsersParsers, {
    shallow: true,
  });

  return (
    <div className="space-y-3 rounded-[6px] border border-line bg-surface p-4">
      {/* Search Input */}
      <div className="relative">
        <label htmlFor="admin-users-search" className="sr-only">
          Search users by name or email
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-dim">
          <MagnifyingGlass className="h-4 w-4" aria-hidden="true" />
        </div>
        <input
          id="admin-users-search"
          type="text"
          value={params.search ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setParams(
              { search: val || null, page: 1 },
              { limitUrlUpdates: debounce(400) }
            );
          }}
          placeholder="Search users by name or email..."
          className="h-10 w-full rounded-[4px] border border-line bg-surface-2 pl-9 pr-9 font-sans text-xs text-fg placeholder:text-fg-dim focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong"
        />
        {params.search && (
          <button
            type="button"
            onClick={() => {
              setParams({ search: null, page: 1 });
            }}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-fg-dim hover:text-fg"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Role and Status Chips */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        {/* Role group */}
        <div
          role="group"
          aria-label="Filter by role"
          className="flex flex-wrap items-center gap-1.5"
        >
          <span className="font-mono text-[11px] text-fg-dim mr-1">Role:</span>
          {ROLE_OPTIONS.map((opt) => {
            const isSelected =
              opt.value === null ? !params.role : params.role === opt.value;

            return (
              <button
                key={opt.label}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setParams({ role: opt.value, page: 1 });
                }}
                className={cn(
                  "min-h-[30px] rounded-[4px] px-2.5 font-sans text-xs font-medium transition-colors select-none",
                  isSelected
                    ? "bg-blood text-fg shadow-xs"
                    : "border border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Status group */}
        <div
          role="group"
          aria-label="Filter by status"
          className="flex flex-wrap items-center gap-1.5"
        >
          <span className="font-mono text-[11px] text-fg-dim mr-1">Status:</span>
          {STATUS_OPTIONS.map((opt) => {
            const isSelected =
              opt.value === null ? !params.status : params.status === opt.value;

            return (
              <button
                key={opt.label}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setParams({ status: opt.value, page: 1 });
                }}
                className={cn(
                  "min-h-[30px] rounded-[4px] px-2.5 font-sans text-xs font-medium transition-colors select-none",
                  isSelected
                    ? "bg-blood text-fg shadow-xs"
                    : "border border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
