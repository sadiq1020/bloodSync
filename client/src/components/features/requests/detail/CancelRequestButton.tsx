"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Trash, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { RequestStatus } from "@/types/api";

interface CancelRequestButtonProps {
  requestId: string;
  status: RequestStatus;
  isOwner: boolean;
  className?: string;
}

export function CancelRequestButton({
  requestId,
  status,
  isOwner,
  className,
}: CancelRequestButtonProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  // Visible only to owner while OPEN or MATCHED
  const canCancel = isOwner && (status === "OPEN" || status === "MATCHED");

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`/api/requests/${requestId}/cancel`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      toast.success("Request cancelled.");
      setOpen(false);
      router.refresh();
    },
    onError: (err: unknown) => {
      const message =
        (err as Error)?.message || "Failed to cancel request.";
      toast.error(message);
      setOpen(false);
      router.refresh();
    },
  });

  if (!canCancel) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Cancel this blood request"
        className={cn(
          "flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[4px] border border-blood/30 bg-surface px-4 font-sans text-xs font-semibold text-blood-light transition-colors hover:border-blood hover:bg-blood-deep/20 focus-visible:outline-2 focus-visible:outline-blood",
          className
        )}
      >
        <Trash className="size-4" aria-hidden="true" />
        <span>Cancel request</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-semibold text-fg">
              Cancel this request?
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-fg-muted leading-relaxed pt-2">
              Cancel this request? Pending and accepted donors will be
              released. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
            <DialogClose className="rounded-[4px] border border-line bg-surface px-4 py-2 font-sans text-xs font-medium text-fg-muted hover:text-fg">
              Keep request
            </DialogClose>
            <button
              type="button"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
              className="flex min-h-[38px] items-center gap-2 rounded-[4px] border border-blood/40 bg-blood-deep/40 px-4 py-2 font-sans text-xs font-semibold text-blood-light hover:bg-blood-deep/60 disabled:opacity-50"
            >
              {cancelMutation.isPending && (
                <SpinnerGap className="size-3.5 animate-spin" aria-hidden="true" />
              )}
              Cancel request
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
