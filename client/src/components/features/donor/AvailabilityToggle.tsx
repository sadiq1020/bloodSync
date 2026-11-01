"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { Switch } from "@/components/ui/switch";

interface AvailabilityToggleProps {
  initialAvailable: boolean;
}

/**
 * AvailabilityToggle (Client Component)
 * Optimistically updates the donor's isAvailable status via PATCH /api/donors/me.
 * Rolls back with toast on error; calls router.refresh() on success.
 */
export function AvailabilityToggle({
  initialAvailable,
}: AvailabilityToggleProps) {
  const router = useRouter();
  const [optimisticVal, setOptimisticVal] = React.useState<boolean | null>(null);
  const available = optimisticVal ?? initialAvailable;

  const { mutate, isPending } = useMutation({
    mutationFn: async (newVal: boolean) => {
      return apiFetch("/api/donors/me", {
        method: "PATCH",
        body: { isAvailable: newVal },
      });
    },
    onMutate: (newVal) => {
      setOptimisticVal(newVal);
    },
    onError: (err) => {
      setOptimisticVal(null);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update availability. Please try again."
      );
    },
    onSuccess: (_data, newVal) => {
      setOptimisticVal(null);
      toast.success(
        newVal
          ? "You are now marked available for requests."
          : "You are now marked unavailable."
      );
      router.refresh();
    },
  });

  return (
    <div className="flex items-start justify-between gap-4 rounded-[6px] border border-line bg-surface-2/40 p-4">
      <div className="space-y-1">
        <label
          htmlFor="availability-switch"
          className="font-sans text-sm font-medium text-fg cursor-pointer select-none"
        >
          Available for requests
        </label>
        <p className="font-sans text-xs text-fg-muted">
          You appear in search only when you are available and eligible.
        </p>
      </div>

      <Switch
        id="availability-switch"
        checked={available}
        onCheckedChange={(checked) => mutate(checked)}
        disabled={isPending}
        aria-label="Available for blood requests"
      />
    </div>
  );
}
