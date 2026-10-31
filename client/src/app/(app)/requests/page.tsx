import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";

export default async function RequestsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blood requests"
        title="Emergency Blood Requests"
        description="Browse and respond to active emergency blood requests across Bangladesh."
        actions={
          <Link
            href="/requests/new"
            className="flex min-h-[38px] items-center justify-center rounded-[4px] bg-blood px-4 font-sans text-sm font-medium text-fg transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
          >
            Request blood
          </Link>
        }
      />

      {/* TODO: Request list will be implemented in a future prompt */}
      <div className="rounded-[6px] border border-line bg-surface-2 p-12 text-center">
        <p className="font-sans text-sm text-fg-muted">
          Blood request listings coming soon.
        </p>
      </div>
    </>
  );
}
