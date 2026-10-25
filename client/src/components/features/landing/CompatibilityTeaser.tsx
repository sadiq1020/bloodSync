import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { Reveal } from "@/components/motion/Reveal";

/**
 * CompatibilityTeaser (Server Component)
 * Clean clinical teaser highlighting donor compatibility rules.
 */
export function CompatibilityTeaser() {
  const compatibleGroups = ["B+", "B-", "O+", "O-"] as const;

  return (
    <section
      aria-labelledby="compatibility-heading"
      className="border-t border-line py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative rounded-[6px] border border-line bg-surface p-6 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-fg-dim font-mono text-xs uppercase tracking-widest">
                  COMPATIBILITY MATRIX
                </p>
                <h2
                  id="compatibility-heading"
                  className="font-display text-fg mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  Who can give blood to B+?
                </h2>
                <p className="text-fg-muted mt-2 max-w-md font-sans text-sm">
                  Recipients with B+ blood can safely receive red blood cells from four
                  compatible donor groups.
                </p>
              </div>

              {/* Badges row & full chart link */}
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex flex-wrap items-center gap-2">
                  {compatibleGroups.map((group) => (
                    <BloodTypeBadge
                      key={group}
                      bloodGroup={group}
                      variant="tag"
                      size="md"
                    />
                  ))}
                </div>

                <Link
                  href="/compatibility"
                  className="inline-flex min-h-[44px] items-center gap-1.5 font-sans text-sm font-medium text-blood hover:text-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
                >
                  <span>See the full chart</span>
                  <ArrowRightIcon className="h-4 w-4" weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
