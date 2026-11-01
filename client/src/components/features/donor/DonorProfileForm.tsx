"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { SpinnerGap } from "@phosphor-icons/react";
import {
  getDonorFormSchema,
  type DonorProfileFormData,
} from "@/lib/validation/donor";
import { normalizeDigits } from "@/lib/normalize-digits";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { BloodGroupPicker } from "./BloodGroupPicker";
import { DistrictCombobox } from "./DistrictCombobox";
import { ENUM_TO_BLOOD_GROUP_MAP, type BloodGroup } from "@/lib/constants/bloodGroups";
import type { District } from "@/lib/constants/districts";
import type { MyDonorProfile } from "@/types";
import { cn } from "@/lib/utils";

interface DonorProfileFormProps {
  initialProfile?: MyDonorProfile | null;
  mode: "create" | "edit";
  className?: string;
}

export function DonorProfileForm({
  initialProfile,
  mode,
  className,
}: DonorProfileFormProps) {
  const router = useRouter();

  // Map initial blood group if stored as Prisma enum (e.g. O_POSITIVE -> O+)
  const initialBloodGroup = initialProfile?.bloodGroup
    ? (initialProfile.bloodGroup in ENUM_TO_BLOOD_GROUP_MAP
        ? ENUM_TO_BLOOD_GROUP_MAP[
            initialProfile.bloodGroup as keyof typeof ENUM_TO_BLOOD_GROUP_MAP
          ]
        : initialProfile.bloodGroup)
    : undefined;

  const initialDateString = initialProfile?.lastDonatedAt
    ? new Date(initialProfile.lastDonatedAt).toISOString().split("T")[0]
    : "";

  const defaultValues: Partial<DonorProfileFormData> = {
    bloodGroup: (initialBloodGroup as BloodGroup) ?? undefined,
    district: (initialProfile?.district as District) ?? undefined,
    area: initialProfile?.area ?? "",
    phone: initialProfile?.phone ?? "",
    lastDonatedAt: initialDateString,
    consent: false,
  };

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<DonorProfileFormData>({
    resolver: zodResolver(getDonorFormSchema(mode)),
    defaultValues,
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationFn: async (data: DonorProfileFormData) => {
      if (mode === "create") {
        // Strip client-only consent field before sending to API
        const payload = {
          bloodGroup: data.bloodGroup,
          district: data.district,
          area: data.area.trim(),
          phone: normalizeDigits(data.phone.trim()),
          lastDonatedAt: data.lastDonatedAt
            ? new Date(data.lastDonatedAt).toISOString()
            : undefined,
        };

        return apiFetch("/api/donors/me", {
          method: "POST",
          body: payload,
        });
      } else {
        // Edit mode: only send changed fields
        const payload: Record<string, unknown> = {};

        if (dirtyFields.bloodGroup && data.bloodGroup) {
          payload.bloodGroup = data.bloodGroup;
        }
        if (dirtyFields.district && data.district) {
          payload.district = data.district;
        }
        if (dirtyFields.area && data.area) {
          payload.area = data.area.trim();
        }
        if (dirtyFields.phone && data.phone) {
          payload.phone = normalizeDigits(data.phone.trim());
        }
        if (dirtyFields.lastDonatedAt) {
          payload.lastDonatedAt = data.lastDonatedAt
            ? new Date(data.lastDonatedAt).toISOString()
            : null;
        }

        // If no fields changed, resolve immediately
        if (Object.keys(payload).length === 0) {
          return Promise.resolve();
        }

        return apiFetch("/api/donors/me", {
          method: "PATCH",
          body: payload,
        });
      }
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.errors && Array.isArray(err.errors)) {
          err.errors.forEach((e) => {
            if (e.field) {
              setError(e.field as keyof DonorProfileFormData, {
                message: e.message,
              });
            }
          });
          toast.error("Please check the form for errors.");
          return;
        }
        if (err.status === 409) {
          toast.error("A donor profile already exists for your account.");
          router.refresh();
          return;
        }
        if (err.status === 429) {
          toast.error("Too many requests. Please wait a moment and try again.");
          return;
        }
        toast.error(err.message || "An unexpected error occurred.");
      } else {
        toast.error("Network error. Please check your internet connection.");
      }
    },
    onSuccess: () => {
      toast.success(
        mode === "create" ? "You are now a donor." : "Profile saved."
      );
      router.refresh();
    },
  });

  const onSubmit = (data: DonorProfileFormData) => {
    mutation.mutate(data);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn(
        "rounded-[6px] border border-line bg-surface p-6 sm:p-8 space-y-6",
        className
      )}
    >
      <div className="border-b border-line pb-4">
        <h3 className="font-display text-lg font-semibold text-fg">
          {mode === "create" ? "Donor Information" : "Edit Profile Details"}
        </h3>
        <p className="font-sans text-xs text-fg-muted mt-0.5">
          {mode === "create"
            ? "Fill in your blood group and location to join our verified donor network."
            : "Update your contact information or blood donation availability."}
        </p>
      </div>

      {/* 1. Blood Group Picker */}
      <Controller
        name="bloodGroup"
        control={control}
        render={({ field }) => (
          <BloodGroupPicker
            value={field.value}
            onChange={field.onChange}
            disabled={mutation.isPending}
            error={errors.bloodGroup?.message}
          />
        )}
      />

      {/* 2. District Combobox */}
      <Controller
        name="district"
        control={control}
        render={({ field }) => (
          <DistrictCombobox
            value={field.value}
            onChange={field.onChange}
            disabled={mutation.isPending}
            error={errors.district?.message}
          />
        )}
      />

      {/* 3. Area Input */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="area-input"
            className="font-mono text-xs font-medium uppercase tracking-wider text-fg-dim"
          >
            Area / Thana / Hospital Proximity <span className="text-blood">*</span>
          </label>
          <span className="font-mono text-[11px] text-fg-dim">2–80 characters</span>
        </div>
        <input
          id="area-input"
          type="text"
          {...register("area")}
          disabled={mutation.isPending}
          placeholder="e.g. Shaheb Bazar, Rajshahi Medical College"
          aria-describedby={errors.area ? "area-error" : undefined}
          className={cn(
            "flex h-12 w-full rounded-[6px] border bg-surface-2 px-3.5 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors outline-none",
            "border-line hover:border-line-strong",
            "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50",
            errors.area && "border-blood focus-visible:ring-blood"
          )}
        />
        {errors.area && (
          <p id="area-error" role="alert" className="font-sans text-xs text-blood-light">
            {errors.area.message}
          </p>
        )}
      </div>

      {/* 4. Phone Input */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="phone-input"
            className="font-mono text-xs font-medium uppercase tracking-wider text-fg-dim"
          >
            Phone Number <span className="text-blood">*</span>
          </label>
          <span className="font-mono text-[11px] text-fg-dim">
            01XXXXXXXXX or +8801XXXXXXXXX
          </span>
        </div>
        <input
          id="phone-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          {...register("phone")}
          disabled={mutation.isPending}
          placeholder="01XXXXXXXXX"
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className={cn(
            "flex h-12 w-full rounded-[6px] border bg-surface-2 px-3.5 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors outline-none",
            "border-line hover:border-line-strong",
            "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50",
            errors.phone && "border-blood focus-visible:ring-blood"
          )}
        />
        <p className="font-sans text-xs text-fg-dim">
          Bangla digits (০-৯) are automatically converted to standard numbers.
        </p>
        {errors.phone && (
          <p id="phone-error" role="alert" className="font-sans text-xs text-blood-light">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* 5. Last Donation Date (Optional) */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="lastDonatedAt-input"
            className="font-mono text-xs font-medium uppercase tracking-wider text-fg-dim"
          >
            Last Donation Date
          </label>
          <span className="font-mono text-[11px] text-fg-dim">Optional</span>
        </div>
        <input
          id="lastDonatedAt-input"
          type="date"
          max={today}
          {...register("lastDonatedAt")}
          disabled={mutation.isPending}
          aria-describedby="lastDonatedAt-hint"
          className={cn(
            "flex h-12 w-full rounded-[6px] border bg-surface-2 px-3.5 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors outline-none",
            "border-line hover:border-line-strong",
            "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50",
            errors.lastDonatedAt && "border-blood focus-visible:ring-blood"
          )}
        />
        <p id="lastDonatedAt-hint" className="font-sans text-xs text-fg-dim">
          Updated automatically when a requester confirms your donation. Leave empty if you have never donated.
        </p>
        {errors.lastDonatedAt && (
          <p role="alert" className="font-sans text-xs text-blood-light">
            {errors.lastDonatedAt.message}
          </p>
        )}
      </div>

      {/* Extra required checkbox for Create Mode */}
      {mode === "create" && (
        <div className="space-y-2 rounded-[6px] border border-line bg-surface-2/40 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("consent")}
              disabled={mutation.isPending}
              className="mt-1 size-4.5 rounded-[4px] border border-line bg-surface text-blood focus:ring-blood focus:ring-offset-bg accent-blood"
            />
            <span className="font-sans text-xs text-fg leading-relaxed select-none">
              I agree that people who post a matching request can see my phone number.
            </span>
          </label>
          {errors.consent && (
            <p role="alert" className="font-sans text-xs text-blood-light pl-7">
              {errors.consent.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={
            mutation.isPending || (mode === "edit" && !isDirty)
          }
          className={cn(
            "flex min-h-[44px] flex-1 sm:flex-none items-center justify-center gap-2 rounded-[4px] px-6 font-sans text-sm font-medium text-fg shadow-sm transition-colors",
            "bg-blood hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {mutation.isPending && (
            <SpinnerGap
              className="size-4 animate-spin text-fg"
              aria-hidden="true"
            />
          )}
          <span>
            {mutation.isPending
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Become a donor"
              : "Save changes"}
          </span>
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={() => reset(defaultValues)}
            disabled={!isDirty || mutation.isPending}
            className={cn(
              "flex min-h-[44px] items-center justify-center rounded-[4px] border border-line px-5 font-sans text-sm font-medium text-fg-muted transition-colors",
              "hover:border-line-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-blood",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
}
