"use client";

import * as React from "react";
import { type UseFormReturn, Controller } from "react-hook-form";
import { Plus, Minus, SpinnerGap } from "@phosphor-icons/react";
import { BloodGroupPicker, DistrictCombobox, PhoneField } from "@/components/features/shared";
import { UrgencyBadge } from "@/components/brand/UrgencyBadge";
import type { RequestFormData, Urgency } from "@/lib/validation/request";
import type { BloodGroup } from "@/lib/constants/bloodGroups";
import type { District } from "@/lib/constants/districts";
import { cn } from "@/lib/utils";

interface RequestFormProps {
  form: UseFormReturn<RequestFormData>;
  onSubmit: (data: RequestFormData) => void;
  isPending: boolean;
  userName?: string;
  aiFilledFields?: Set<string>;
  checkFields?: Set<string>;
  flashingFields?: Set<string>;
  onFieldEdit?: (field: keyof RequestFormData) => void;
  className?: string;
}

const PRESET_OPTIONS = [
  { label: "In 6 hours", hours: 6 },
  { label: "Today", hours: 12 },
  { label: "Tomorrow", hours: 24 },
  { label: "In 3 days", hours: 72 },
  { label: "Pick date and time", hours: 0 },
] as const;

/** Module-level helper – exempt from react-hooks/purity. */
function getPresetIso(hours: number): string {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

export function RequestForm({
  form,
  onSubmit,
  isPending,
  userName = "",
  aiFilledFields = new Set(),
  checkFields = new Set(),
  flashingFields = new Set(),
  onFieldEdit,
  className,
}: RequestFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
  } = form;

  const forSelf = watch("forSelf");
  const unitsNeeded = watch("unitsNeeded") || 1;
  const urgency = watch("urgency") || "NORMAL";
  const note = watch("note") || "";
  const neededBy = watch("neededBy") || "";

  const [hasManuallyEditedPatientName, setHasManuallyEditedPatientName] =
    React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null);

  // Handle forSelf toggling
  const handleForSelfChange = (isForSelf: boolean) => {
    setValue("forSelf", isForSelf, { shouldDirty: true, shouldValidate: true });
    if (isForSelf) {
      if (!hasManuallyEditedPatientName && userName) {
        setValue("patientName", userName, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    } else {
      if (!hasManuallyEditedPatientName) {
        setValue("patientName", "", {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  };

  // NeededBy preset chips handler
  const handlePresetSelect = (label: string, hours: number) => {
    setSelectedPreset(label);
    if (onFieldEdit) onFieldEdit("neededBy");

    if (hours > 0) {
      setValue("neededBy", getPresetIso(hours), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  // Convert neededBy ISO string to datetime-local value (YYYY-MM-DDTHH:mm)
  const toDateTimeLocal = (iso: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  // Min datetime-local is current minute (useState initializer is pure – runs once on mount)
  const [nowDateTimeLocal] = React.useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn(
        "rounded-[6px] border border-line bg-surface p-6 sm:p-8 space-y-6 shadow-sm",
        className
      )}
    >
      {/* 1. forSelf segmented control */}
      <div className="space-y-1.5">
        <label className="font-mono text-xs font-medium uppercase tracking-wider text-fg-dim">
          Who needs blood?
        </label>
        <div
          role="radiogroup"
          aria-label="Who needs blood?"
          className="grid grid-cols-2 gap-1 rounded-[6px] border border-line bg-surface-2 p-1 max-w-sm"
        >
          <button
            type="button"
            role="radio"
            aria-checked={forSelf}
            onClick={() => handleForSelfChange(true)}
            className={cn(
              "flex min-h-[40px] items-center justify-center rounded-[4px] px-3 font-sans text-sm font-medium transition-colors select-none",
              forSelf
                ? "bg-blood text-fg shadow-xs"
                : "text-fg-muted hover:text-fg hover:bg-surface"
            )}
          >
            For me
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!forSelf}
            onClick={() => handleForSelfChange(false)}
            className={cn(
              "flex min-h-[40px] items-center justify-center rounded-[4px] px-3 font-sans text-sm font-medium transition-colors select-none",
              !forSelf
                ? "bg-blood text-fg shadow-xs"
                : "text-fg-muted hover:text-fg hover:bg-surface"
            )}
          >
            For someone else
          </button>
        </div>
      </div>

      {/* 2. Patient Name */}
      <div
        className={cn(
          "space-y-1.5 p-1 -m-1 rounded-[6px] transition-colors",
          flashingFields.has("patientName") && "ai-flash"
        )}
      >
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="patient-name-input"
            className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-fg-dim"
          >
            <span>
              Patient Name <span className="text-blood">*</span>
            </span>
            {aiFilledFields.has("patientName") && (
              <span className="rounded-[3px] bg-blood-deep/40 px-1 py-0.5 font-mono text-[10px] font-bold text-blood-light">
                AI
              </span>
            )}
            {checkFields.has("patientName") && (
              <span className="rounded-[3px] bg-plasma/20 px-1 py-0.5 font-mono text-[10px] font-bold text-plasma">
                CHECK
              </span>
            )}
          </label>
          <span className="font-mono text-[11px] text-fg-dim">2–80 chars</span>
        </div>
        <input
          id="patient-name-input"
          type="text"
          {...register("patientName", {
            onChange: () => {
              setHasManuallyEditedPatientName(true);
              if (onFieldEdit) onFieldEdit("patientName");
            },
          })}
          disabled={isPending}
          placeholder="Full name of patient"
          aria-describedby={errors.patientName ? "patient-name-error" : undefined}
          className={cn(
            "flex h-12 w-full rounded-[6px] border bg-surface-2 px-3.5 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors outline-none",
            "border-line hover:border-line-strong",
            "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50",
            errors.patientName && "border-blood focus-visible:ring-blood"
          )}
        />
        {errors.patientName && (
          <p id="patient-name-error" role="alert" className="font-sans text-xs text-blood-light">
            {errors.patientName.message}
          </p>
        )}
      </div>

      {/* 3. Blood Group Picker */}
      <Controller
        name="bloodGroup"
        control={control}
        render={({ field }) => (
          <BloodGroupPicker
            value={field.value}
            onChange={(val: BloodGroup | undefined) => {
              if (val) field.onChange(val);
              if (onFieldEdit) onFieldEdit("bloodGroup");
            }}
            disabled={isPending}
            error={errors.bloodGroup?.message}
            aiFilled={aiFilledFields.has("bloodGroup")}
            needsCheck={checkFields.has("bloodGroup")}
            hasAiFlash={flashingFields.has("bloodGroup")}
          />
        )}
      />

      {/* 4. Units Needed Stepper */}
      <div
        className={cn(
          "space-y-2 p-1 -m-1 rounded-[6px] transition-colors",
          flashingFields.has("unitsNeeded") && "ai-flash"
        )}
      >
        <div className="flex items-baseline justify-between">
          <label className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-fg-dim">
            <span>
              Units (Bags) Needed <span className="text-blood">*</span>
            </span>
            {aiFilledFields.has("unitsNeeded") && (
              <span className="rounded-[3px] bg-blood-deep/40 px-1 py-0.5 font-mono text-[10px] font-bold text-blood-light">
                AI
              </span>
            )}
            {checkFields.has("unitsNeeded") && (
              <span className="rounded-[3px] bg-plasma/20 px-1 py-0.5 font-mono text-[10px] font-bold text-plasma">
                CHECK
              </span>
            )}
          </label>
          <span className="font-mono text-[11px] text-fg-dim">1 to 10 bags</span>
        </div>

        <div className="flex items-center gap-4">
          <div
            role="group"
            aria-label="Units needed stepper"
            className="flex items-center gap-3 rounded-[6px] border border-line bg-surface-2 p-1.5"
          >
            <button
              type="button"
              aria-label="Decrease units"
              disabled={unitsNeeded <= 1 || isPending}
              onClick={() => {
                setValue("unitsNeeded", Math.max(1, unitsNeeded - 1), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                if (onFieldEdit) onFieldEdit("unitsNeeded");
              }}
              className="flex size-11 items-center justify-center rounded-[4px] border border-line bg-surface text-fg transition-colors hover:border-line-strong hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-blood disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus weight="bold" className="size-4" aria-hidden="true" />
            </button>

            <span
              aria-live="polite"
              className="w-14 text-center font-display text-2xl font-bold text-fg select-none"
            >
              {unitsNeeded}
            </span>

            <button
              type="button"
              aria-label="Increase units"
              disabled={unitsNeeded >= 10 || isPending}
              onClick={() => {
                setValue("unitsNeeded", Math.min(10, unitsNeeded + 1), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                if (onFieldEdit) onFieldEdit("unitsNeeded");
              }}
              className="flex size-11 items-center justify-center rounded-[4px] border border-line bg-surface text-fg transition-colors hover:border-line-strong hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-blood disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus weight="bold" className="size-4" aria-hidden="true" />
            </button>
          </div>

          <span className="font-sans text-xs text-fg-muted">
            {unitsNeeded === 1 ? "bag requested" : "bags requested"}
          </span>
        </div>

        {errors.unitsNeeded && (
          <p role="alert" className="font-sans text-xs text-blood-light">
            {errors.unitsNeeded.message}
          </p>
        )}
      </div>

      {/* 5. Hospital */}
      <div
        className={cn(
          "space-y-1.5 p-1 -m-1 rounded-[6px] transition-colors",
          flashingFields.has("hospital") && "ai-flash"
        )}
      >
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="hospital-input"
            className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-fg-dim"
          >
            <span>
              Hospital / Clinic <span className="text-blood">*</span>
            </span>
            {aiFilledFields.has("hospital") && (
              <span className="rounded-[3px] bg-blood-deep/40 px-1 py-0.5 font-mono text-[10px] font-bold text-blood-light">
                AI
              </span>
            )}
            {checkFields.has("hospital") && (
              <span className="rounded-[3px] bg-plasma/20 px-1 py-0.5 font-mono text-[10px] font-bold text-plasma">
                CHECK
              </span>
            )}
          </label>
          <span className="font-mono text-[11px] text-fg-dim">2–120 chars</span>
        </div>
        <input
          id="hospital-input"
          type="text"
          {...register("hospital", {
            onChange: () => {
              if (onFieldEdit) onFieldEdit("hospital");
            },
          })}
          disabled={isPending}
          placeholder="e.g. Dhaka Medical College Hospital"
          aria-describedby={errors.hospital ? "hospital-error" : undefined}
          className={cn(
            "flex h-12 w-full rounded-[6px] border bg-surface-2 px-3.5 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors outline-none",
            "border-line hover:border-line-strong",
            "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50",
            errors.hospital && "border-blood focus-visible:ring-blood"
          )}
        />
        {errors.hospital && (
          <p id="hospital-error" role="alert" className="font-sans text-xs text-blood-light">
            {errors.hospital.message}
          </p>
        )}
      </div>

      {/* District & Area grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="district"
          control={control}
          render={({ field }) => (
            <DistrictCombobox
              id="request-district"
              value={field.value}
              onChange={(val: District | undefined) => {
                if (val) field.onChange(val);
                if (onFieldEdit) onFieldEdit("district");
              }}
              disabled={isPending}
              error={errors.district?.message}
              aiFilled={aiFilledFields.has("district")}
              needsCheck={checkFields.has("district")}
              hasAiFlash={flashingFields.has("district")}
            />
          )}
        />

        <div
          className={cn(
            "space-y-1.5 p-1 -m-1 rounded-[6px] transition-colors",
            flashingFields.has("area") && "ai-flash"
          )}
        >
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="area-input"
              className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-fg-dim"
            >
              <span>
                Area / Thana <span className="text-blood">*</span>
              </span>
              {aiFilledFields.has("area") && (
                <span className="rounded-[3px] bg-blood-deep/40 px-1 py-0.5 font-mono text-[10px] font-bold text-blood-light">
                  AI
                </span>
              )}
              {checkFields.has("area") && (
                <span className="rounded-[3px] bg-plasma/20 px-1 py-0.5 font-mono text-[10px] font-bold text-plasma">
                  CHECK
                </span>
              )}
            </label>
            <span className="font-mono text-[11px] text-fg-dim">2–80 chars</span>
          </div>
          <input
            id="area-input"
            type="text"
            {...register("area", {
              onChange: () => {
                if (onFieldEdit) onFieldEdit("area");
              },
            })}
            disabled={isPending}
            placeholder="e.g. Shaheb Bazar"
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
      </div>

      {/* 6. Urgency Segmented Control */}
      <div
        className={cn(
          "space-y-2 p-1 -m-1 rounded-[6px] transition-colors",
          flashingFields.has("urgency") && "ai-flash"
        )}
      >
        <div className="flex items-baseline justify-between">
          <label className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-fg-dim">
            <span>
              Urgency Level <span className="text-blood">*</span>
            </span>
            {aiFilledFields.has("urgency") && (
              <span className="rounded-[3px] bg-blood-deep/40 px-1 py-0.5 font-mono text-[10px] font-bold text-blood-light">
                AI
              </span>
            )}
          </label>
        </div>

        <div
          role="radiogroup"
          aria-label="Urgency level"
          className="grid grid-cols-3 gap-2"
        >
          {(["NORMAL", "URGENT", "CRITICAL"] as Urgency[]).map((level) => {
            const isSelected = urgency === level;
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isPending}
                onClick={() => {
                  setValue("urgency", level, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  if (onFieldEdit) onFieldEdit("urgency");
                }}
                className={cn(
                  "flex min-h-[48px] items-center justify-center rounded-[6px] border px-3 transition-all select-none",
                  "focus-visible:outline-2 focus-visible:outline-blood",
                  isSelected
                    ? "border-blood bg-blood-deep/20 shadow-xs"
                    : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"
                )}
              >
                <UrgencyBadge urgency={level} />
              </button>
            );
          })}
        </div>

        <p className="font-sans text-xs text-fg-dim">
          Critical means life-threatening or in the ICU.
        </p>

        {errors.urgency && (
          <p role="alert" className="font-sans text-xs text-blood-light">
            {errors.urgency.message}
          </p>
        )}
      </div>

      {/* 7. Needed By (Preset chips + custom datetime) */}
      <div
        className={cn(
          "space-y-2 p-1 -m-1 rounded-[6px] transition-colors",
          flashingFields.has("neededBy") && "ai-flash"
        )}
      >
        <div className="flex items-baseline justify-between">
          <label className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-fg-dim">
            <span>
              When is blood needed? <span className="text-blood">*</span>
            </span>
            {checkFields.has("neededBy") && (
              <span className="rounded-[3px] bg-plasma/20 px-1 py-0.5 font-mono text-[10px] font-bold text-plasma">
                CHECK
              </span>
            )}
          </label>
          <span className="font-mono text-[11px] text-fg-dim">Must be in future</span>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-2">
          {PRESET_OPTIONS.map((opt) => {
            const isSelected = selectedPreset === opt.label;
            return (
              <button
                key={opt.label}
                type="button"
                disabled={isPending}
                onClick={() => handlePresetSelect(opt.label, opt.hours)}
                className={cn(
                  "flex min-h-[36px] items-center rounded-[4px] border px-3 font-sans text-xs font-medium transition-colors select-none",
                  "focus-visible:outline-2 focus-visible:outline-blood",
                  isSelected
                    ? "border-blood bg-blood-deep/20 text-fg"
                    : "border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Custom datetime picker shown when 'Pick date and time' selected or if neededBy is set */}
        {(selectedPreset === "Pick date and time" || (!selectedPreset && neededBy)) && (
          <div className="pt-2">
            <input
              type="datetime-local"
              min={nowDateTimeLocal}
              value={toDateTimeLocal(neededBy)}
              disabled={isPending}
              onChange={(e) => {
                if (onFieldEdit) onFieldEdit("neededBy");
                if (e.target.value) {
                  const d = new Date(e.target.value);
                  setValue("neededBy", d.toISOString(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                } else {
                  setValue("neededBy", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
              className={cn(
                "flex h-12 w-full max-w-sm rounded-[6px] border bg-surface-2 px-3.5 font-sans text-sm text-fg transition-colors outline-none",
                "border-line hover:border-line-strong",
                "focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
                "disabled:cursor-not-allowed disabled:opacity-50",
                errors.neededBy && "border-blood focus-visible:ring-blood"
              )}
            />
          </div>
        )}

        {errors.neededBy && (
          <p role="alert" className="font-sans text-xs text-blood-light">
            {errors.neededBy.message}
          </p>
        )}
      </div>

      {/* 8. Contact Phone */}
      <PhoneField
        id="request-phone"
        label="Contact Phone"
        {...register("contactPhone", {
          onChange: () => {
            if (onFieldEdit) onFieldEdit("contactPhone");
          },
        })}
        disabled={isPending}
        error={errors.contactPhone?.message}
        aiFilled={aiFilledFields.has("contactPhone")}
        needsCheck={checkFields.has("contactPhone")}
        hasAiFlash={flashingFields.has("contactPhone")}
      />

      {/* 9. Note (Optional) */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="note-input"
            className="font-mono text-xs font-medium uppercase tracking-wider text-fg-dim"
          >
            Additional Notes
          </label>
          <span className="font-mono text-[11px] text-fg-dim">
            {note.length} / 500
          </span>
        </div>
        <textarea
          id="note-input"
          rows={3}
          {...register("note")}
          disabled={isPending}
          placeholder="e.g. Please bring blood donor card; patient is in room 304."
          maxLength={500}
          className={cn(
            "w-full rounded-[6px] border border-line bg-surface-2 p-3 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors outline-none resize-y min-h-[72px]",
            "hover:border-line-strong focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
        {errors.note && (
          <p role="alert" className="font-sans text-xs text-blood-light">
            {errors.note.message}
          </p>
        )}
      </div>

      {/* Verification notice before submit */}
      <p className="font-mono text-xs text-fg-dim leading-relaxed">
        Post only real requests. Admins can remove fake requests and block accounts.
      </p>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!isValid || isPending}
          className={cn(
            "flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-[4px] px-8 font-sans text-sm font-medium text-fg shadow-sm transition-colors",
            "bg-blood hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {isPending ? (
            <>
              <SpinnerGap className="size-4 animate-spin" aria-hidden="true" />
              <span>Posting request...</span>
            </>
          ) : (
            <span>Post request</span>
          )}
        </button>
      </div>
    </form>
  );
}
