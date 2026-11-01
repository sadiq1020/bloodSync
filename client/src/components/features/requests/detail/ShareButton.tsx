"use client";

import * as React from "react";
import { ShareNetwork, Check } from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatBloodGroup } from "@/lib/format";

interface ShareButtonProps {
  bloodGroup: string;
  hospital: string;
  district: string;
  className?: string;
  variant?: "primary" | "secondary";
}

export function ShareButton({
  bloodGroup,
  hospital,
  district,
  className,
  variant = "secondary",
}: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const displayGroup = formatBloodGroup(bloodGroup);
  const shareText = `${displayGroup} blood needed at ${hospital}, ${district}`;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "BloodSync Emergency Request",
          text: shareText,
          url,
        });
        return;
      } catch (err: unknown) {
        // If user cancelled, don't fallback to copy
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    // Fallback: Copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share blood request link"
      className={cn(
        "flex min-h-[40px] items-center justify-center gap-2 rounded-[4px] px-4 font-sans text-sm font-medium transition-colors select-none",
        variant === "primary"
          ? "bg-blood text-fg hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
          : "border border-line bg-surface text-fg hover:border-line-strong hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-blood",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="size-4 text-sage" aria-hidden="true" />
          <span>Link copied</span>
        </>
      ) : (
        <>
          <ShareNetwork className="size-4" aria-hidden="true" />
          <span>Share request</span>
        </>
      )}
    </button>
  );
}
