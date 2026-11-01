import { getCurrentUser, serverFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/error";
import { PageHeader } from "@/components/layout/PageHeader";
import { DonorCard, DonorProfileForm } from "@/components/features/donor";
import { Reveal } from "@/components/motion/Reveal";
import { Clock, ShieldCheck, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import type { MyDonorProfile } from "@/types";

export const metadata = {
  title: "Donor Profile — BloodSync",
  description: "Manage your blood donor registration, availability, and eligibility cooldown status.",
};

export default async function DonorPage() {
  const user = await getCurrentUser();

  let donorProfile: MyDonorProfile | null = null;
  try {
    donorProfile = await serverFetch<MyDonorProfile>("/api/donors/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      // 404 means user has not yet created a donor profile
      donorProfile = null;
    } else {
      throw err;
    }
  }

  // STATE A: No profile yet — "Become a donor" onboarding screen
  if (!donorProfile) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Donor Profile"
          title="Become a donor"
          description="Register your blood group to help patients in emergency need across Bangladesh."
        />

        {/* Three core facts before joining */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[6px] border border-line bg-surface p-4 space-y-2">
            <div className="flex size-8 items-center justify-center rounded-[4px] bg-blood-deep/30 text-blood">
              <Clock className="size-4.5" aria-hidden="true" />
            </div>
            <h2 className="font-sans text-sm font-semibold text-fg">
              90-day recovery tracking
            </h2>
            <p className="font-sans text-xs text-fg-muted leading-relaxed">
              You can donate safely every 90 days. The platform automatically monitors your cooldown and marks when you are ready.
            </p>
          </div>

          <div className="rounded-[6px] border border-line bg-surface p-4 space-y-2">
            <div className="flex size-8 items-center justify-center rounded-[4px] bg-blood-deep/30 text-blood">
              <ShieldCheck className="size-4.5" aria-hidden="true" />
            </div>
            <h2 className="font-sans text-sm font-semibold text-fg">
              Full availability control
            </h2>
            <p className="font-sans text-xs text-fg-muted leading-relaxed">
              Pause or resume your donor status anytime with a single toggle. You will never receive alerts while resting.
            </p>
          </div>

          <div className="rounded-[6px] border border-line bg-surface p-4 space-y-2">
            <div className="flex size-8 items-center justify-center rounded-[4px] bg-blood-deep/30 text-blood">
              <EyeSlash className="size-4.5" aria-hidden="true" />
            </div>
            <h2 className="font-sans text-sm font-semibold text-fg">
              Protected phone privacy
            </h2>
            <p className="font-sans text-xs text-fg-muted leading-relaxed">
              Your contact number is never public in donor search. It is disclosed only to verified requesters whose urgent post matches your blood group.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl">
          <DonorProfileForm mode="create" />
        </div>
      </div>
    );
  }

  // STATE B: Profile exists — Two-column layout (card first on mobile, left on desktop)
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Donor Profile"
        title="Your Donor Profile"
        description="Review your active blood group specimen, cooldown recovery timeline, and contact information."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Specimen DonorCard with Reveal entrance */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <Reveal delay={0.05}>
            <DonorCard
              profile={donorProfile}
              userName={user?.name || "Blood Donor"}
            />
          </Reveal>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="lg:col-span-7">
          <DonorProfileForm initialProfile={donorProfile} mode="edit" />
        </div>
      </div>
    </div>
  );
}
