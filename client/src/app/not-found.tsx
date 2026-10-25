import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="border-line bg-surface w-full max-w-md rounded-[10px] border p-8 shadow-sm">
        <span className="text-blood font-mono text-xs tracking-widest uppercase">
          404
        </span>
        <h2 className="font-display text-fg mt-2 text-2xl font-semibold">
          Page Not Found
        </h2>
        <p className="text-fg-muted mt-2 text-sm">
          The page you requested could not be found or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/requests"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Browse Requests
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
