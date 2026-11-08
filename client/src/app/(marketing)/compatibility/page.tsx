import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  CompatibilityExplorer,
  CompatibilityMatrix,
} from "@/components/features/compatibility";

export const metadata: Metadata = {
  title: "Blood group compatibility chart | BloodSync",
  description:
    "Check which blood groups can give and receive red blood cells safely. Complete ABO and Rh factor compatibility guide for blood donors and recipients.",
  alternates: {
    canonical: "/compatibility",
  },
  openGraph: {
    title: "Blood group compatibility chart | BloodSync",
    description:
      "Check which blood groups can give and receive red blood cells safely.",
    url: "/compatibility",
    type: "website",
  },
};

export default function CompatibilityPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Header section */}
      <div className="border-b border-line pb-6">
        <PageHeader
          eyebrow="COMPATIBILITY"
          title="Who can give blood to whom"
          description="A clear guide to red blood cell donor and recipient compatibility."
        />
        <p className="mt-1 font-mono text-xs text-fg-dim">
          This chart is for red blood cell donation. The hospital makes the final match.
        </p>
      </div>

      {/* Main interactive explorer wrapping the server-rendered 8x8 matrix */}
      <div className="pt-8">
        <CompatibilityExplorer>
          <CompatibilityMatrix />
        </CompatibilityExplorer>
      </div>

      {/* Rh Factor Explainer */}
      <section
        aria-labelledby="rh-heading"
        className="mt-12 rounded-[6px] border border-line bg-surface p-6 sm:p-8"
      >
        <h2
          id="rh-heading"
          className="font-display text-lg font-semibold text-fg"
        >
          Why Rh matters
        </h2>
        <p className="mt-3 font-sans text-sm text-fg-muted leading-relaxed max-w-3xl">
          The plus or minus after your blood group refers to the Rh factor, an inherited
          protein found on red blood cells. If your cells carry this protein, your blood
          type is Rh positive; if not, it is Rh negative. People with Rh positive blood
          can safely receive both Rh positive and Rh negative red blood cells. People with
          Rh negative blood should only receive Rh negative red blood cells to avoid an
          immune response.
        </p>
      </section>

      {/* Closing CTA */}
      <section
        aria-labelledby="cta-heading"
        className="mt-12 rounded-[6px] border border-line bg-surface p-6 text-center sm:p-10"
      >
        <h2
          id="cta-heading"
          className="font-display text-xl font-semibold text-fg sm:text-2xl"
        >
          Need blood or want to donate?
        </h2>
        <p className="mx-auto mt-2 max-w-md font-sans text-sm text-fg-muted">
          Connect directly with verified donors and urgent requests across Bangladesh.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/requests/new"
            className="inline-flex min-h-[42px] items-center justify-center rounded-[4px] bg-blood px-5 font-sans text-sm font-medium text-fg transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
          >
            Request blood
          </Link>
          <Link
            href="/donor"
            className="inline-flex min-h-[42px] items-center justify-center rounded-[4px] border border-line bg-surface-2 px-5 font-sans text-sm font-medium text-fg transition-colors hover:border-line-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-blood"
          >
            Become a donor
          </Link>
        </div>
      </section>
    </div>
  );
}
