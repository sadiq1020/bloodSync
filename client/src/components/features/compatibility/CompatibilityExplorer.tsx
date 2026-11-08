"use client";

import * as React from "react";
import {
  BLOOD_GROUPS,
  getCanReceiveFrom,
  getCanGiveTo,
  bloodGroupToWords,
  formatGroupListWords,
  type BloodGroup,
} from "@/lib/constants/blood-compatibility";
import { formatBloodGroup } from "@/lib/format";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { MatrixHighlightWrapper } from "./MatrixHighlightWrapper";
import { cn } from "@/lib/utils";

interface CompatibilityExplorerProps {
  children: React.ReactNode;
}

/**
 * CompatibilityExplorer (Client Component)
 * Manages active blood group selection with an accessible radiogroup,
 * provides live screen-reader summaries and reactive recipient/donor panels,
 * and highlights the corresponding row and column in the server-rendered 8x8 matrix.
 */
export function CompatibilityExplorer({ children }: CompatibilityExplorerProps) {
  const [selectedGroup, setSelectedGroup] = React.useState<BloodGroup>("B+");

  const canReceiveFrom = getCanReceiveFrom(selectedGroup);
  const canGiveTo = getCanGiveTo(selectedGroup);

  // Compute special universal cases strictly from data arrays
  const isUniversalDonor = canGiveTo.length === BLOOD_GROUPS.length;
  const isUniversalRecipient = canReceiveFrom.length === BLOOD_GROUPS.length;

  const groupInWords = bloodGroupToWords(selectedGroup);
  const receiveFromWords = formatGroupListWords(canReceiveFrom);
  const giveToWords = formatGroupListWords(canGiveTo);

  return (
    <div className="space-y-10">
      {/* Interactive Blood Group Selector */}
      <section aria-labelledby="selector-heading" className="space-y-4">
        <div>
          <h2
            id="selector-heading"
            className="font-display text-lg font-semibold text-fg"
          >
            Select a blood group
          </h2>
          <p className="font-sans text-xs text-fg-muted">
            Choose a type to see donor and recipient compatibility rules.
          </p>
        </div>

        {/* Native Radiogroup with keyboard arrow support */}
        <fieldset className="space-y-2">
          <legend className="sr-only">Choose a blood group</legend>
          <div
            role="radiogroup"
            aria-label="Select blood group"
            className="grid grid-cols-4 gap-2 sm:grid-cols-8"
          >
            {BLOOD_GROUPS.map((group) => {
              const isSelected = selectedGroup === group;
              const display = formatBloodGroup(group);
              const signMatch = display.match(/[+−]$/);
              const sign = signMatch ? signMatch[0] : "";
              const letter = signMatch ? display.slice(0, -1) : display;

              return (
                <label
                  key={group}
                  className={cn(
                    "group relative flex min-h-[58px] cursor-pointer flex-col items-center justify-center rounded-[6px] border text-center select-none",
                    "transition-colors duration-150 motion-reduce:transition-none",
                    "focus-within:ring-2 focus-within:ring-blood focus-within:ring-offset-2 focus-within:ring-offset-bg",
                    isSelected
                      ? "border-blood bg-blood-deep/25 shadow-xs"
                      : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"
                  )}
                >
                  <input
                    type="radio"
                    name="compatibility-blood-group"
                    value={group}
                    checked={isSelected}
                    onChange={() => setSelectedGroup(group)}
                    className="sr-only"
                    aria-label={bloodGroupToWords(group)}
                  />
                  <span className="inline-flex items-baseline font-display text-xl font-semibold leading-none text-fg">
                    <span>{letter}</span>
                    {sign && (
                      <span className="text-sm font-semibold text-blood-light -translate-y-1.5 ml-0.5">
                        {sign}
                      </span>
                    )}
                  </span>
                  <span className="sr-only">{bloodGroupToWords(group)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Reactive Results Panels with short transition */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Panel 1: Can receive from */}
          <div className="rounded-[6px] border border-line bg-surface p-5 transition-opacity duration-200 motion-reduce:transition-none">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-fg-dim">
                {formatBloodGroup(selectedGroup)} can receive from
              </h3>
              <span className="font-mono text-xs text-fg-muted">
                {canReceiveFrom.length} {canReceiveFrom.length === 1 ? "group" : "groups"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {canReceiveFrom.map((donor) => (
                <BloodTypeBadge
                  key={donor}
                  bloodGroup={donor}
                  variant="tag"
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* Panel 2: Can give to */}
          <div className="rounded-[6px] border border-line bg-surface p-5 transition-opacity duration-200 motion-reduce:transition-none">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-fg-dim">
                {formatBloodGroup(selectedGroup)} can give to
              </h3>
              <span className="font-mono text-xs text-fg-muted">
                {canGiveTo.length} {canGiveTo.length === 1 ? "group" : "groups"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {canGiveTo.map((recipient) => (
                <BloodTypeBadge
                  key={recipient}
                  bloodGroup={recipient}
                  variant="tag"
                  size="md"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Real text summary for screen readers & polite live announcements */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="rounded-[6px] border border-line bg-surface-2/40 p-4 font-sans text-xs text-fg-muted leading-relaxed"
        >
          <p>
            <strong className="text-fg">{groupInWords}</strong> can receive red blood cells from {receiveFromWords}.
          </p>
          <p className="mt-1">
            <strong className="text-fg">{groupInWords}</strong> can give red blood cells to {giveToWords}.
          </p>

          {/* Special cases computed from data */}
          {isUniversalDonor && (
            <p className="mt-2 font-mono text-xs font-medium text-blood-light">
              {groupInWords} can give to every group.
            </p>
          )}
          {isUniversalRecipient && (
            <p className="mt-2 font-mono text-xs font-medium text-blood-light">
              {groupInWords} can receive from every group.
            </p>
          )}
        </div>
      </section>

      {/* 8x8 Matrix Table (Server-rendered markup with client row/col highlight wrapper) */}
      <section aria-labelledby="matrix-heading">
        <MatrixHighlightWrapper selectedGroup={selectedGroup}>
          {children}
        </MatrixHighlightWrapper>
      </section>
    </div>
  );
}

