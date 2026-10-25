import Image from "next/image";
import Link from "next/link";
import heroImg from "@/assets/images/hero.jpg";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { UrgencyBadge } from "@/components/brand/UrgencyBadge";
import { SpecimenCard } from "@/components/brand/SpecimenCard";
import { VialProgress } from "@/components/brand/VialProgress";
import { PulseLine } from "@/components/brand/PulseLine";

/**
 * Hero (Server Component)
 * Two columns on desktop, stacked on mobile.
 * Pure CSS entrance keyframes ensure instantaneous text visibility and optimal LCP.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7">
            {/* Mono Eyebrow */}
            <p className="animate-hero-1 text-fg-dim font-mono text-xs uppercase tracking-widest">
              BLOOD REQUEST MATCHING / BANGLADESH
            </p>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="animate-hero-2 font-display text-fg mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl xl:text-[4rem] leading-[1.08]"
            >
              Don&apos;t let a request{" "}
              <span className="text-blood">get buried</span> in a feed.
            </h1>

            {/* Subtitle */}
            <p className="animate-hero-3 text-fg-muted mt-6 max-w-xl font-sans text-base leading-relaxed sm:text-lg">
              BloodSync matches urgent blood requests with eligible donors in the
              same district, and follows each request until the bag is filled.
            </p>

            {/* CTAs */}
            <div className="animate-hero-3 mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/requests/new"
                className="flex min-h-[48px] items-center justify-center rounded-[4px] bg-blood px-6 font-sans text-base font-medium text-fg shadow-sm transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
              >
                Request blood
              </Link>
              <Link
                href="/donor"
                className="flex min-h-[48px] items-center justify-center rounded-[4px] border border-line bg-surface px-6 font-sans text-base font-medium text-fg transition-colors hover:border-line-dim hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-blood"
              >
                Become a donor
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Image with Chamfered Corner & SpecimenCard Overlay */}
          <div className="animate-hero-image relative lg:col-span-5">
            {/* Image Frame with Chamfered Top-Right Corner */}
            <div
              className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-surface shadow-2xl [clip-path:polygon(0_0,calc(100%-36px)_0,100%_36px,100%_100%,0_100%)]"
            >
              <Image
                src={heroImg}
                alt="Medical professional preparing blood donation equipment in a clinical environment"
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                placeholder="blur"
                className="h-full w-full object-cover grayscale-[35%] contrast-[105%]"
              />

              {/* Warm duotone dark wine overlay from bottom */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-blood/10 mix-blend-color"
                aria-hidden="true"
              />
            </div>

            {/* Overlapping SpecimenCard preview */}
            <div className="absolute -bottom-6 left-2 sm:-bottom-8 sm:-left-6 w-[calc(100%-1rem)] sm:w-full sm:max-w-[340px] drop-shadow-2xl">
              <SpecimenCard
                header="REQ-0142 / RAJSHAHI"
                accent="blood"
                className="bg-surface/95 backdrop-blur-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-fg font-sans text-sm font-semibold">
                      Rajshahi Medical College Hospital
                    </span>
                    <span className="text-fg-dim font-mono text-[10px] uppercase tracking-widest">
                      SAMPLE REQUEST
                    </span>
                  </div>
                  <BloodTypeBadge bloodGroup="B+" size="md" />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <UrgencyBadge urgency="URGENT" />
                  <div className="flex items-center gap-2">
                    <VialProgress
                      filled={1}
                      total={2}
                      size="sm"
                      label={true}
                    />
                  </div>
                </div>
              </SpecimenCard>
            </div>
          </div>
        </div>
      </div>

      {/* Under Hero: Full-width thin PulseLine that draws once */}
      <div className="mt-16 w-full opacity-60" aria-hidden="true">
        <PulseLine className="h-6 w-full" color="blood" loop={false} />
      </div>
    </section>
  );
}
