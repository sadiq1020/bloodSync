"use client";

import * as React from "react";
import { Copy, Check } from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyPhoneButtonProps {
  phone: string;
  className?: string;
}

export function CopyPhoneButton({ phone, className }: CopyPhoneButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      toast.success("Number copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy phone number");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy contact phone number"
      className={cn(
        "inline-flex min-h-[32px] items-center gap-1 rounded-[4px] border border-line bg-surface-2 px-2.5 py-1 font-mono text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-blood",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-sage" aria-hidden="true" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" aria-hidden="true" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
