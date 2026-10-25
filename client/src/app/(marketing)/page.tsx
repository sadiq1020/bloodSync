import type { Metadata } from "next";
import {
  Hero,
  FactsStrip,
  ProblemAi,
  HowItWorks,
  CompatibilityTeaser,
  ClosingCta,
} from "@/components/features/landing";

export const metadata: Metadata = {
  title: "BloodSync | Find blood donors in Bangladesh",
  description:
    "Targeted blood donation matching across 64 districts in Bangladesh. Connect urgent patient requests directly with eligible local donors.",
  openGraph: {
    title: "BloodSync | Find blood donors in Bangladesh",
    description:
      "Targeted blood donation matching across 64 districts in Bangladesh. Connect urgent patient requests directly with eligible local donors.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "BloodSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "BloodSync | Find blood donors in Bangladesh",
    description:
      "Targeted blood donation matching across 64 districts in Bangladesh. Connect urgent patient requests directly with eligible local donors.",
  },
};

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <FactsStrip />
      <ProblemAi />
      <HowItWorks />
      <CompatibilityTeaser />
      <ClosingCta />
    </>
  );
}
