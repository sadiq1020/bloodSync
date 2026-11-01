"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Heart,
  SpinnerGap,
  WarningCircle,
  PhoneCall,
  CheckCircle,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime, formatRelativeTime } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { CopyPhoneButton } from "./CopyPhoneButton";
import type { BloodRequest, MyDonorProfile, DonationStatus } from "@/types/api";

interface DonorActionCardProps {
  request: BloodRequest;
  donorProfile: MyDonorProfile | null | undefined;
  myDonation: { id: string; status: DonationStatus } | null | undefined;
  className?: string;
}

export function DonorActionCard({
  request,
  donorProfile,
  myDonation,
  className,
}: DonorActionCardProps) {
  const router = useRouter();

  const [volunteerDialogOpen, setVolunteerDialogOpen] = React.useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Volunteer mutation: POST /api/requests/:id/volunteer
  const volunteerMutation = useMutation({
    mutationFn: async () => {
      setServerError(null);
      return apiFetch(`/api/requests/${request.id}/volunteer`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success("You volunteered. Thank you.");
      setVolunteerDialogOpen(false);
      router.refresh();
    },
    onError: (err: unknown) => {
      const message =
        (err as Error)?.message || "Failed to volunteer. Please try again.";
      setServerError(message);
      setVolunteerDialogOpen(false);

      // Refresh if error suggests data is stale (already volunteered, request not open)
      if (
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("status") ||
        message.toLowerCase().includes("passed")
      ) {
        router.refresh();
      }
    },
  });

  // Withdraw mutation: PATCH /api/donations/:id/cancel
  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!myDonation?.id) throw new Error("Donation ID not found.");
      return apiFetch(`/api/donations/${myDonation.id}/cancel`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      toast.success("Donation offer withdrawn.");
      setWithdrawDialogOpen(false);
      router.refresh();
    },
    onError: (err: unknown) => {
      const message =
        (err as Error)?.message || "Failed to withdraw donation.";
      toast.error(message);
      setWithdrawDialogOpen(false);
      router.refresh();
    },
  });

  const donationStatus = myDonation?.status;

  // -------------------------------------------------------------
  // STATE 1: Donor has an existing donation on this request
  // -------------------------------------------------------------
  if (donationStatus) {
    if (donationStatus === "PENDING") {
      return (
        <div
          className={cn(
            "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-4",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-plasma" weight="bold" />
            <span className="font-mono text-xs uppercase tracking-widest text-plasma">
              Volunteered · Pending
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-fg">
              Waiting for requester to confirm
            </h3>
            <p className="font-sans text-xs text-fg-muted leading-relaxed">
              You offered to donate for this request. The requester will review
              volunteers and choose according to need.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setWithdrawDialogOpen(true)}
            disabled={withdrawMutation.isPending}
            className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-[4px] border border-line bg-surface px-4 font-sans text-xs font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-50"
          >
            {withdrawMutation.isPending && (
              <SpinnerGap className="size-3.5 animate-spin" aria-hidden="true" />
            )}
            Withdraw offer
          </button>

          {/* Withdraw Dialog */}
          <WithdrawConfirmDialog
            open={withdrawDialogOpen}
            onOpenChange={setWithdrawDialogOpen}
            onConfirm={() => withdrawMutation.mutate()}
            isPending={withdrawMutation.isPending}
          />
        </div>
      );
    }

    if (donationStatus === "ACCEPTED") {
      return (
        <div
          className={cn(
            "rounded-[6px] border border-sage/40 bg-surface p-5 sm:p-6 space-y-4",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-sage" weight="fill" />
            <span className="font-mono text-xs uppercase tracking-widest text-sage">
              You were chosen
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-fg">
              Your donation was accepted
            </h3>
            <p className="font-sans text-xs text-fg-muted leading-relaxed">
              Please contact the hospital or requester and coordinate your
              arrival.
            </p>
          </div>

          {/* Highlighted hospital and needed-by block */}
          <div className="rounded-[4px] border border-sage/30 bg-sage/5 p-3.5 space-y-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">
                Hospital
              </span>
              <p className="font-display text-sm font-semibold text-fg">
                {request.hospital}
              </p>
              <p className="font-sans text-xs text-fg-muted">
                {request.area}, {request.district}
              </p>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">
                Needed by
              </span>
              <p className="font-mono text-xs font-medium text-fg">
                {formatDateTime(request.neededBy)}{" "}
                <span className="text-fg-dim">
                  ({formatRelativeTime(request.neededBy)})
                </span>
              </p>
            </div>

            {/* Direct contact info if available */}
            {request.contactPhone && (
              <div className="border-t border-sage/20 pt-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">
                  Requester phone
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-fg">
                    {request.contactPhone}
                  </span>
                  <a
                    href={`tel:${request.contactPhone}`}
                    aria-label="Call requester"
                    className="inline-flex min-h-[28px] items-center gap-1 rounded-[4px] bg-blood px-2.5 py-0.5 font-sans text-xs font-medium text-fg transition-colors hover:bg-blood-hover"
                  >
                    <PhoneCall className="size-3" aria-hidden="true" />
                    <span>Call</span>
                  </a>
                  <CopyPhoneButton phone={request.contactPhone} />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setWithdrawDialogOpen(true)}
            disabled={withdrawMutation.isPending}
            className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-[4px] border border-line px-4 font-sans text-xs font-medium text-fg-muted transition-colors hover:border-blood hover:text-blood disabled:opacity-50"
          >
            {withdrawMutation.isPending && (
              <SpinnerGap className="size-3.5 animate-spin" aria-hidden="true" />
            )}
            Withdraw donation
          </button>

          <WithdrawConfirmDialog
            open={withdrawDialogOpen}
            onOpenChange={setWithdrawDialogOpen}
            onConfirm={() => withdrawMutation.mutate()}
            isPending={withdrawMutation.isPending}
          />
        </div>
      );
    }

    if (donationStatus === "COMPLETED") {
      const nextDate = donorProfile?.nextEligibleDate
        ? formatDate(donorProfile.nextEligibleDate)
        : null;

      return (
        <div
          className={cn(
            "rounded-[6px] border border-sage/30 bg-surface p-5 sm:p-6 space-y-3",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-sage" weight="fill" />
            <span className="font-mono text-xs uppercase tracking-widest text-sage">
              Donation recorded
            </span>
          </div>

          <h3 className="font-display text-base font-semibold text-fg">
            Thank you for saving a life.
          </h3>
          <p className="font-sans text-xs text-fg-muted leading-relaxed">
            Your blood donation for this request has been marked as complete.
          </p>

          {nextDate && (
            <p className="font-mono text-xs text-fg-dim">
              You can donate again after <span className="text-fg">{nextDate}</span>.
            </p>
          )}
        </div>
      );
    }

    if (donationStatus === "CANCELLED") {
      return (
        <div
          className={cn(
            "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-2",
            className
          )}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-fg-dim">
            Status
          </span>
          <p className="font-sans text-sm text-fg-muted">
            Your volunteer response was cancelled.
          </p>
        </div>
      );
    }
  }

  // -------------------------------------------------------------
  // STATE 2: No donation and request is NOT open
  // -------------------------------------------------------------
  if (request.status !== "OPEN") {
    let message = "This request is not currently accepting volunteers.";
    if (request.status === "MATCHED") {
      message = "This request is already matched with volunteer donors.";
    } else if (request.status === "FULFILLED") {
      message = "This request has been fulfilled.";
    } else if (request.status === "EXPIRED") {
      message = "This request has expired and is no longer open.";
    } else if (request.status === "CANCELLED") {
      message = "This request was cancelled by the poster.";
    }

    return (
      <div
        className={cn(
          "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-2",
          className
        )}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-fg-dim">
          Request status
        </span>
        <p className="font-sans text-sm text-fg-muted leading-relaxed">
          {message}
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 3: Request is OPEN, user has no donation
  // Check donor profile prerequisites
  // -------------------------------------------------------------

  // 3a. No profile yet
  if (!donorProfile) {
    return (
      <div
        className={cn(
          "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-4",
          className
        )}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-fg-dim">
          Volunteer
        </span>
        <div className="space-y-1">
          <h3 className="font-display text-base font-semibold text-fg">
            Become a blood donor
          </h3>
          <p className="font-sans text-xs text-fg-muted leading-relaxed">
            Create a donor profile to volunteer for this request and help save a
            patient in need.
          </p>
        </div>

        <Link
          href="/donor"
          className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[4px] bg-blood px-4 font-sans text-sm font-medium text-fg transition-colors hover:bg-blood-hover"
        >
          <span>Create donor profile</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  // 3b. Profile is set to unavailable
  if (!donorProfile.isAvailable) {
    return (
      <div
        className={cn(
          "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-4",
          className
        )}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-fg-dim">
          Volunteer
        </span>
        <div className="space-y-1">
          <h3 className="font-display text-base font-semibold text-fg">
            You are set as unavailable
          </h3>
          <p className="font-sans text-xs text-fg-muted leading-relaxed">
            Your donor profile is currently inactive. Turn on your availability
            if you are ready to donate blood.
          </p>
        </div>

        <Link
          href="/donor"
          className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-[4px] border border-line bg-surface-2 px-4 font-sans text-xs font-medium text-fg transition-colors hover:border-line-strong hover:bg-surface"
        >
          Manage availability in profile
        </Link>
      </div>
    );
  }

  // 3c. Resting / recovery cooldown period
  if (!donorProfile.isEligible) {
    const nextDate = donorProfile.nextEligibleDate
      ? formatDate(donorProfile.nextEligibleDate)
      : null;

    return (
      <div
        className={cn(
          "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-3",
          className
        )}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-fg-dim">
          Recovery period
        </span>
        <h3 className="font-display text-base font-semibold text-fg">
          Currently on donation cooldown
        </h3>
        <p className="font-sans text-xs text-fg-muted leading-relaxed">
          {nextDate
            ? `You can donate again on ${nextDate}.`
            : "Please wait for the 90-day recovery period between donations."}
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 4: Ready and eligible to volunteer
  // -------------------------------------------------------------
  return (
    <div
      className={cn(
        "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-4 shadow-xs",
        className
      )}
    >
      <span className="font-mono text-xs uppercase tracking-widest text-fg-dim">
        Volunteer
      </span>

      <div className="space-y-1">
        <h3 className="font-display text-base font-semibold text-fg">
          Can you donate blood?
        </h3>
        <p className="font-sans text-xs text-fg-muted leading-relaxed">
          Your response will be visible to the requester. They will contact you
          directly to coordinate.
        </p>
      </div>

      {/* Inline server rejection notice if mutation errored */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[4px] border border-blood/40 bg-blood-deep/20 p-3"
        >
          <WarningCircle
            className="size-4 shrink-0 text-blood-light mt-0.5"
            weight="fill"
          />
          <div className="space-y-0.5">
            <p className="font-sans text-xs font-semibold text-blood-light">
              Unable to volunteer
            </p>
            <p className="font-sans text-xs text-fg-muted leading-relaxed">
              {serverError}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setVolunteerDialogOpen(true)}
        disabled={volunteerMutation.isPending}
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[4px] bg-blood px-4 font-sans text-sm font-semibold text-fg transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood disabled:cursor-not-allowed disabled:opacity-50"
      >
        {volunteerMutation.isPending ? (
          <>
            <SpinnerGap className="size-4 animate-spin" aria-hidden="true" />
            <span>Volunteering...</span>
          </>
        ) : (
          <>
            <Heart className="size-4" weight="fill" aria-hidden="true" />
            <span>I can donate</span>
          </>
        )}
      </button>

      {/* Volunteer Confirm Dialog */}
      <Dialog
        open={volunteerDialogOpen}
        onOpenChange={setVolunteerDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-fg">
              Volunteer to donate
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-fg-muted leading-relaxed pt-2">
              You will be visible to the person who posted this request. They
              may contact you on the phone number in your profile (
              <span className="font-mono text-fg font-medium">
                {donorProfile.phone}
              </span>
              ).
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
            <DialogClose className="rounded-[4px] border border-line bg-surface px-4 py-2 font-sans text-xs font-medium text-fg-muted hover:text-fg">
              Cancel
            </DialogClose>
            <button
              type="button"
              disabled={volunteerMutation.isPending}
              onClick={() => volunteerMutation.mutate()}
              className="flex min-h-[38px] items-center gap-2 rounded-[4px] bg-blood px-4 py-2 font-sans text-xs font-semibold text-fg hover:bg-blood-hover disabled:opacity-50"
            >
              {volunteerMutation.isPending && (
                <SpinnerGap className="size-3.5 animate-spin" aria-hidden="true" />
              )}
              Confirm & volunteer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WithdrawConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold text-fg">
            Withdraw volunteer offer?
          </DialogTitle>
          <DialogDescription className="font-sans text-xs text-fg-muted leading-relaxed pt-2">
            Are you sure you want to withdraw your offer to donate? The
            requester will be notified that you are no longer available for this
            request.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
          <DialogClose className="rounded-[4px] border border-line bg-surface px-4 py-2 font-sans text-xs font-medium text-fg-muted hover:text-fg">
            Keep offer
          </DialogClose>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="flex min-h-[38px] items-center gap-2 rounded-[4px] border border-blood/40 bg-blood-deep/30 px-4 py-2 font-sans text-xs font-semibold text-blood-light hover:bg-blood-deep/50 disabled:opacity-50"
          >
            {isPending && (
              <SpinnerGap className="size-3.5 animate-spin" aria-hidden="true" />
            )}
            Yes, withdraw
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
