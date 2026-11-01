"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowCounterClockwise, Sparkle } from "@phosphor-icons/react";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { PulseLine } from "@/components/brand/PulseLine";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { CountUp } from "@/components/motion/CountUp";
import type { AiParseResponse } from "@/types";
import { cn } from "@/lib/utils";

interface AiPasteBoxProps {
  onApplyResult: (result: AiParseResponse) => void;
  onUndo: () => void;
  canUndo: boolean;
  className?: string;
}

const EXAMPLES = [
  {
    label: "English",
    text: "Need B+ blood at Rajshahi Medical College urgently for surgery, 2 bags needed",
  },
  {
    label: "Bangla",
    text: "আমার মায়ের জন্য এ পজিটিভ রক্ত লাগবে, বগুড়া শহীদ জিয়াউর রহমান মেডিকেল কলেজ, ২ ব্যাগ জরুরি",
  },
  {
    label: "Mixed with phone",
    text: "Urgent O- blood needed at Dhaka Medical College Hospital for ICU patient, please contact 01712345678 immediately",
  },
];

export function AiPasteBox({
  onApplyResult,
  onUndo,
  canUndo,
  className,
}: AiPasteBoxProps) {
  const [text, setText] = React.useState("");
  const [lastResult, setLastResult] = React.useState<AiParseResponse | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = React.useState("");

  const length = text.trim().length;
  const isValidLength = length >= 10 && length <= 1000;

  const mutation = useMutation({
    mutationFn: async (messageText: string) => {
      return apiFetch<AiParseResponse>("/api/ai/parse-request", {
        method: "POST",
        body: { text: messageText },
      });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          toast.error(
            "You have used the AI reader several times. Fill the form by hand or try again in a few minutes."
          );
          return;
        }
        if (err.status === 502 || err.status === 504) {
          toast.error(
            "The AI reader is not available right now. You can fill the form by hand."
          );
          return;
        }
        toast.error(err.message || "Could not read message.");
      } else {
        toast.error(
          "The AI reader is not available right now. You can fill the form by hand."
        );
      }
    },
    onSuccess: (data) => {
      setLastResult(data);
      onApplyResult(data);

      // Compute summary for screen readers
      const fields = data.fields;
      const filledCount = Object.values(fields).filter(
        (v) => v !== null && v !== undefined
      ).length;
      const missingCount = data.missingFields.length + 1; // +1 for neededBy (always manual)
      setLiveAnnouncement(
        `Filled ${filledCount} fields. ${missingCount} fields need checking.`
      );

      toast.success("Message parsed. Suggested values filled in the form.");
    },
  });

  const handleReadMessage = () => {
    if (!isValidLength) return;
    mutation.mutate(text);
  };

  const handleUndo = () => {
    onUndo();
    setLastResult(null);
    setLiveAnnouncement("AI suggestions reverted.");
    toast.info("Reverted to previous form values.");
  };

  // Convert field keys to friendly display labels
  const getFoundChips = (result: AiParseResponse) => {
    const chips: { label: string; value: string }[] = [];
    const f = result.fields;
    if (f.bloodGroup) chips.push({ label: "BLOOD GROUP", value: f.bloodGroup });
    if (f.unitsNeeded) chips.push({ label: "UNITS", value: `${f.unitsNeeded} unit(s)` });
    if (f.urgency) chips.push({ label: "URGENCY", value: f.urgency });
    if (f.district) chips.push({ label: "DISTRICT", value: f.district });
    if (f.hospital) chips.push({ label: "HOSPITAL", value: f.hospital });
    if (f.area) chips.push({ label: "AREA", value: f.area });
    if (f.patientName) chips.push({ label: "PATIENT", value: f.patientName });
    if (f.contactPhone) chips.push({ label: "PHONE", value: f.contactPhone });
    return chips;
  };

  const formatMissingLabel = (field: string) => {
    if (field === "bloodGroup") return "blood group";
    if (field === "district") return "district";
    if (field === "hospital") return "hospital";
    return field;
  };

  return (
    <div
      className={cn(
        "rounded-[6px] border border-line bg-surface p-5 sm:p-6 space-y-4 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-[4px] bg-blood-deep/20 text-blood">
            <Sparkle weight="bold" className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-fg">
              Quick paste assistant
            </h2>
            <p className="font-sans text-xs text-fg-muted">
              Paste a WhatsApp, Facebook, or SMS message to prefill the request form.
            </p>
          </div>
        </div>

        {canUndo && (
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-1.5 rounded-[4px] border border-line px-2.5 py-1 font-sans text-xs font-medium text-fg-muted hover:border-line-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
          >
            <ArrowCounterClockwise className="size-3.5" aria-hidden="true" />
            Undo AI fill
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="ai-paste-textarea"
            className="font-mono text-xs font-medium uppercase tracking-wider text-fg-dim"
          >
            Paste the message
          </label>
          <span
            className={cn(
              "font-mono text-xs",
              length > 1000 ? "text-blood" : "text-fg-dim"
            )}
          >
            {length} / 1000
          </span>
        </div>

        <textarea
          id="ai-paste-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          disabled={mutation.isPending}
          placeholder="e.g. Urgent B+ blood needed at Dhaka Medical College Hospital for a patient in ICU. Please contact 017XXXXXXXX..."
          className={cn(
            "w-full rounded-[6px] border border-line bg-surface-2 p-3 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors outline-none resize-y min-h-[80px]",
            "hover:border-line-strong focus-visible:border-blood focus-visible:ring-1 focus-visible:ring-blood",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>

      {/* Explanatory note & Example chips */}
      <div className="space-y-2">
        <p className="font-sans text-xs text-fg-dim">
          Your message is sent to an AI service to read it. BloodSync does not save it.
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-fg-dim mr-1">
            Try an example:
          </span>
          {EXAMPLES.map((eg) => (
            <button
              key={eg.label}
              type="button"
              disabled={mutation.isPending}
              onClick={() => setText(eg.text)}
              className="rounded-[4px] border border-line bg-surface-2 px-2.5 py-1 font-sans text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-blood disabled:opacity-40"
            >
              {eg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action button */}
      <div>
        <button
          type="button"
          onClick={handleReadMessage}
          disabled={!isValidLength || mutation.isPending}
          className={cn(
            "flex min-h-[40px] items-center justify-center gap-2 rounded-[4px] px-5 font-sans text-sm font-medium text-fg shadow-xs transition-colors",
            "bg-blood hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {mutation.isPending ? (
            <>
              <span>Reading...</span>
              <PulseLine loop color="blood" className="w-10 h-3.5 inline-block" />
            </>
          ) : (
            <>
              <Sparkle weight="bold" className="size-4" aria-hidden="true" />
              <span>Read message</span>
            </>
          )}
        </button>
      </div>

      {/* Screen Reader live region */}
      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* What was found results */}
      {lastResult && (
        <div className="rounded-[6px] border border-line bg-surface-2/60 p-4 space-y-3 pt-3 mt-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-fg-dim">
              What was found
            </span>
            <span className="font-mono text-[10px] text-fg-dim">
              Suggested by AI. Check everything before posting.
            </span>
          </div>

          {/* Found Chips */}
          <Stagger className="flex flex-wrap gap-1.5" staggerMs={40}>
            {getFoundChips(lastResult).map((chip) => (
              <StaggerItem key={chip.label}>
                <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-line bg-surface px-2.5 py-1 font-sans text-xs text-fg">
                  <span className="font-mono text-[10px] text-fg-dim uppercase">
                    {chip.label}:
                  </span>
                  <span className="font-semibold text-fg">{chip.value}</span>
                </span>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Missing fields line */}
          {lastResult.missingFields.length > 0 && (
            <p className="font-sans text-xs text-plasma flex items-center gap-1">
              <span className="font-mono text-[10px] uppercase font-bold bg-plasma/20 px-1 py-0.5 rounded-[2px]">
                Not found:
              </span>
              <span>
                {lastResult.missingFields.map(formatMissingLabel).join(", ")}, when needed
              </span>
            </p>
          )}

          {/* Matching Donors Count line */}
          {lastResult.matchingDonorsCount !== null && (
            <div className="font-sans text-xs text-fg-muted pt-1 border-t border-dashed border-line">
              {lastResult.matchingDonorsCount > 0 ? (
                <span>
                  <strong className="font-semibold text-fg">
                    <CountUp value={lastResult.matchingDonorsCount} />
                  </strong>{" "}
                  eligible donors in {lastResult.fields.district} can give to{" "}
                  {lastResult.fields.bloodGroup}
                </span>
              ) : (
                <span>
                  No eligible donors found in this district yet. Your request will still be visible to new donors.
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
