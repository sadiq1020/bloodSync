"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-fg group-[.toaster]:border-line group-[.toaster]:shadow-xl group-[.toaster]:rounded-[6px] group-[.toaster]:font-sans text-sm border",
          description: "group-[.toast]:text-fg-muted text-xs",
          actionButton:
            "group-[.toast]:bg-blood group-[.toast]:text-fg group-[.toast]:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] group-[.toast]:rounded-[4px] group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-surface-2 group-[.toast]:text-fg-muted group-[.toast]:rounded-[4px] group-[.toast]:text-xs",
          info: "group-[.toast]:border-line group-[.toast]:text-fg",
          success: "group-[.toast]:border-sage/40 group-[.toast]:text-sage",
          warning: "group-[.toast]:border-plasma/40 group-[.toast]:text-plasma",
          error:
            "group-[.toast]:border-blood/50 group-[.toast]:text-blood-light",
        },
      }}
    />
  );
}
