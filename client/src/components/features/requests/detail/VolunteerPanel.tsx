"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  PhoneCall,
  SpinnerGap,
  Users,
  CaretDown,
  CaretUp,
  Check,
  X,
  CheckCircle,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { CopyPhoneButton } from "./CopyPhoneButton";
import { ShareButton } from "./ShareButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type {
  RequestDonationVolunteer,
  RequestStatus,
  DonationStatus,
} from "@/types/api";

interface VolunteerPanelProps {
  requestStatus: RequestStatus;
  bloodGroup: string;
  hospital: string;
  district: string;
  initialDonations: RequestDonationVolunteer[];
  readOnly?: boolean;
  className?: string;
}

const STATUS_ORDER: DonationStatus[] = [
  "ACCEPTED",
  "PENDING",
  "COMPLETED",
  "CANCELLED",
];

function DonationStatusPill({ status }: { status: DonationStatus }) {
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[3px] bg-blood-deep/40 px-2 py-0.5 font-mono text-[11px] font-semibold text-blood-light uppercase tracking-wider">
        Accepted
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[3px] bg-plasma/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-plasma uppercase tracking-wider">
        Pending
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[3px] bg-sage/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-sage uppercase tracking-wider">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-[3px] bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-fg-dim uppercase tracking-wider">
      Cancelled
    </span>
  );
}

export function VolunteerPanel({
  requestStatus,
  bloodGroup,
  hospital,
  district,
  initialDonations,
  readOnly = false,
  className,
}: VolunteerPanelProps) {
  const router = useRouter();
  const [showCancelled, setShowCancelled] = React.useState(false);
  const [activeMutationId, setActiveMutationId] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  // Dialog state
  const [confirmDialog, setConfirmDialog] = React.useState<{
    type: "decline" | "complete" | "cancel";
    donation: RequestDonationVolunteer;
  } | null>(null);

  const isTerminalRequest =
    requestStatus === "FULFILLED" ||
    requestStatus === "EXPIRED" ||
    requestStatus === "CANCELLED";

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: async (donation: RequestDonationVolunteer) => {
      setActiveMutationId(donation.id);
      return apiFetch<{ status: DonationStatus }>(
        `/api/donations/${donation.id}/accept`,
        { method: "PATCH" }
      );
    },
    onSuccess: (_, donation) => {
      const msg = `Donor ${donation.donorName} accepted.`;
      toast.success(msg);
      setAnnouncement(msg);
      router.refresh();
    },
    onError: (err: unknown) => {
      const message = (err as Error)?.message || "Failed to accept donor.";
      toast.error(message);
      router.refresh();
    },
    onSettled: () => setActiveMutationId(null),
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: async (donation: RequestDonationVolunteer) => {
      setActiveMutationId(donation.id);
      return apiFetch<{ status: DonationStatus }>(
        `/api/donations/${donation.id}/complete`,
        { method: "PATCH" }
      );
    },
    onSuccess: (_, donation) => {
      const msg = `Donation recorded for ${donation.donorName}.`;
      toast.success(msg);
      setAnnouncement(msg);
      setConfirmDialog(null);
      router.refresh();
    },
    onError: (err: unknown) => {
      const message = (err as Error)?.message || "Failed to complete donation.";
      toast.error(message);
      setConfirmDialog(null);
      router.refresh();
    },
    onSettled: () => setActiveMutationId(null),
  });

  // Cancel/Decline mutation
  const cancelMutation = useMutation({
    mutationFn: async (donation: RequestDonationVolunteer) => {
      setActiveMutationId(donation.id);
      return apiFetch<{ status: DonationStatus }>(
        `/api/donations/${donation.id}/cancel`,
        { method: "PATCH" }
      );
    },
    onSuccess: (_, donation) => {
      const isDecline = donation.status === "PENDING";
      const msg = isDecline
        ? `Offer from ${donation.donorName} declined.`
        : `Donation from ${donation.donorName} cancelled.`;
      toast.success(msg);
      setAnnouncement(msg);
      setConfirmDialog(null);
      router.refresh();
    },
    onError: (err: unknown) => {
      const message = (err as Error)?.message || "Failed to cancel donation.";
      toast.error(message);
      setConfirmDialog(null);
      router.refresh();
    },
    onSettled: () => setActiveMutationId(null),
  });

  const isAnyPending =
    acceptMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending;

  // Group donations by status order
  const nonCancelledDonations = initialDonations
    .filter((d) => d.status !== "CANCELLED")
    .sort(
      (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    );

  const cancelledDonations = initialDonations.filter(
    (d) => d.status === "CANCELLED"
  );

  return (
    <section
      aria-labelledby="volunteers-heading"
      className={cn(
        "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-5",
        className
      )}
    >
      {/* Aria-live polite region for actions */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <Users className="size-5 text-fg-dim" aria-hidden="true" />
          <h2
            id="volunteers-heading"
            className="font-display text-lg font-semibold text-fg"
          >
            Volunteers
          </h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold text-fg-dim">
            {initialDonations.length}
          </span>
        </div>

        {readOnly && (
          <span className="rounded-[3px] border border-line bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold text-fg-dim uppercase tracking-wider">
            ADMIN VIEW
          </span>
        )}
      </div>

      {/* Empty State */}
      {initialDonations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="font-sans text-sm text-fg-muted max-w-sm">
            No one has volunteered yet. Share the link or contact the suggested
            donors below.
          </p>
          <ShareButton
            bloodGroup={bloodGroup}
            hospital={hospital}
            district={district}
            variant="primary"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active and completed donation rows */}
          <ul className="divide-y divide-line" role="list">
            {nonCancelledDonations.map((donation) => {
              const isThisPending = activeMutationId === donation.id;

              return (
                <li
                  key={donation.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left: Donor meta */}
                  <div className="flex items-start gap-3 min-w-0">
                    {donation.bloodGroup && (
                      <div className="shrink-0 mt-0.5">
                        <BloodTypeBadge
                          bloodGroup={donation.bloodGroup}
                          size="sm"
                          variant="tag"
                        />
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-sm font-semibold text-fg truncate">
                          {donation.donorName || donation.name}
                        </p>
                        <DonationStatusPill status={donation.status} />
                      </div>

                      <p className="font-mono text-xs text-fg-muted truncate">
                        {donation.district} / {donation.area}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-0.5 font-mono text-[11px] text-fg-dim">
                        <span>
                          Volunteered {formatRelativeTime(donation.createdAt)}
                        </span>

                        {/* Phone if provided */}
                        {donation.phone && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-fg font-medium">
                              {donation.phone}
                            </span>
                            <a
                              href={`tel:${donation.phone}`}
                              aria-label={`Call ${donation.donorName}`}
                              className="inline-flex size-6 items-center justify-center rounded-[3px] bg-blood text-fg hover:bg-blood-hover"
                            >
                              <PhoneCall className="size-3" aria-hidden="true" />
                            </a>
                            <CopyPhoneButton phone={donation.phone} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (only for owner, not read-only, not terminal) */}
                  {!readOnly && !isTerminalRequest && (
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {donation.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            disabled={isAnyPending}
                            onClick={() => acceptMutation.mutate(donation)}
                            aria-label={`Accept ${donation.donorName}`}
                            className="flex min-h-[34px] items-center gap-1.5 rounded-[4px] bg-blood px-3 font-sans text-xs font-semibold text-fg transition-colors hover:bg-blood-hover disabled:opacity-50"
                          >
                            {isThisPending && acceptMutation.isPending ? (
                              <SpinnerGap className="size-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Check className="size-3.5" weight="bold" aria-hidden="true" />
                            )}
                            Accept
                          </button>

                          <button
                            type="button"
                            disabled={isAnyPending}
                            onClick={() =>
                              setConfirmDialog({
                                type: "decline",
                                donation,
                              })
                            }
                            aria-label={`Decline ${donation.donorName}`}
                            className="flex min-h-[34px] items-center gap-1.5 rounded-[4px] border border-line bg-surface px-3 font-sans text-xs font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-50"
                          >
                            <X className="size-3.5" aria-hidden="true" />
                            Decline
                          </button>
                        </>
                      )}

                      {donation.status === "ACCEPTED" && (
                        <>
                          <button
                            type="button"
                            disabled={isAnyPending}
                            onClick={() =>
                              setConfirmDialog({
                                type: "complete",
                                donation,
                              })
                            }
                            aria-label={`Mark donation done from ${donation.donorName}`}
                            className="flex min-h-[34px] items-center gap-1.5 rounded-[4px] bg-sage px-3 font-sans text-xs font-semibold text-black transition-colors hover:bg-sage/90 disabled:opacity-50"
                          >
                            <CheckCircle className="size-3.5" weight="bold" aria-hidden="true" />
                            Mark done
                          </button>

                          <button
                            type="button"
                            disabled={isAnyPending}
                            onClick={() =>
                              setConfirmDialog({
                                type: "cancel",
                                donation,
                              })
                            }
                            aria-label={`Cancel donation from ${donation.donorName}`}
                            className="flex min-h-[34px] items-center gap-1.5 rounded-[4px] border border-line px-3 font-sans text-xs font-medium text-fg-muted transition-colors hover:border-blood hover:text-blood disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Cancelled section collapsible */}
          {cancelledDonations.length > 0 && (
            <div className="border-t border-line pt-3">
              <button
                type="button"
                onClick={() => setShowCancelled(!showCancelled)}
                className="flex items-center gap-1.5 font-mono text-xs text-fg-dim hover:text-fg transition-colors select-none"
              >
                {showCancelled ? (
                  <CaretUp className="size-3" aria-hidden="true" />
                ) : (
                  <CaretDown className="size-3" aria-hidden="true" />
                )}
                <span>
                  {showCancelled ? "Hide" : "Show"} cancelled ({cancelledDonations.length})
                </span>
              </button>

              {showCancelled && (
                <ul className="mt-3 divide-y divide-line" role="list">
                  {cancelledDonations.map((donation) => (
                    <li
                      key={donation.id}
                      className="flex items-center justify-between py-3 opacity-60"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {donation.bloodGroup && (
                          <BloodTypeBadge
                            bloodGroup={donation.bloodGroup}
                            size="sm"
                            variant="tag"
                          />
                        )}
                        <span className="font-display text-xs font-medium text-fg truncate">
                          {donation.donorName || donation.name}
                        </span>
                        <DonationStatusPill status="CANCELLED" />
                      </div>
                      <span className="font-mono text-[10px] text-fg-dim shrink-0">
                        {formatRelativeTime(donation.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialogs */}
      {confirmDialog && (
        <Dialog
          open={Boolean(confirmDialog)}
          onOpenChange={(open) => !open && setConfirmDialog(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-base font-semibold text-fg">
                {confirmDialog.type === "complete"
                  ? "Mark donation complete?"
                  : confirmDialog.type === "decline"
                    ? `Decline offer from ${confirmDialog.donation.donorName}?`
                    : `Cancel accepted donation from ${confirmDialog.donation.donorName}?`}
              </DialogTitle>
              <DialogDescription className="font-sans text-xs text-fg-muted leading-relaxed pt-2">
                {confirmDialog.type === "complete"
                  ? "Confirm only after the donation really happened. The donor will then rest for 90 days."
                  : confirmDialog.type === "decline"
                    ? "They will be notified that their offer to donate was not accepted."
                    : "The donor will be released and the unit requirement will reopen."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
              <DialogClose className="rounded-[4px] border border-line bg-surface px-4 py-2 font-sans text-xs font-medium text-fg-muted hover:text-fg">
                Cancel
              </DialogClose>
              <button
                type="button"
                disabled={isAnyPending}
                onClick={() => {
                  if (confirmDialog.type === "complete") {
                    completeMutation.mutate(confirmDialog.donation);
                  } else {
                    cancelMutation.mutate(confirmDialog.donation);
                  }
                }}
                className={cn(
                  "flex min-h-[38px] items-center gap-2 rounded-[4px] px-4 py-2 font-sans text-xs font-semibold text-fg disabled:opacity-50",
                  confirmDialog.type === "complete"
                    ? "bg-sage text-black hover:bg-sage/90"
                    : "border border-blood/40 bg-blood-deep/30 text-blood-light hover:bg-blood-deep/50"
                )}
              >
                {isAnyPending && (
                  <SpinnerGap className="size-3.5 animate-spin" aria-hidden="true" />
                )}
                {confirmDialog.type === "complete"
                  ? "Confirm complete"
                  : confirmDialog.type === "decline"
                    ? "Yes, decline"
                    : "Yes, cancel"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
