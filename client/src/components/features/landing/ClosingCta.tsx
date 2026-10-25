import Image from "next/image";
import Link from "next/link";
import ctaImg from "@/assets/images/cta.jpg";
import { PulseLine } from "@/components/brand/PulseLine";
import { Reveal } from "@/components/motion/Reveal";

/**
 * ClosingCta (Server Component with background treatment)
 * Wide call-to-action banner with dark wine treatment, heavy gradient, and faint PulseLine.
 */
export function ClosingCta() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden border-t border-line py-20 sm:py-28 lg:py-36"
    >
      {/* Background Image with Dark Wine Treatment */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden" aria-hidden="true">
        <Image
          src={ctaImg}
          alt=""
          fill
          sizes="100vw"
          className="object-cover contrast-[105%] opacity-55"
        />
        {/* Balanced Dark Wine Gradient preserving text legibility while revealing the photograph */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/45" />
        <div className="absolute inset-0 bg-blood/10 mix-blend-color" />
      </div>

      {/* Faint PulseLine behind content */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-20"
        aria-hidden="true"
      >
        <PulseLine className="h-16 w-full" color="blood" loop={true} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-fg-dim font-mono text-xs uppercase tracking-widest">
            JOIN THE REGISTRY
          </p>
          <h2
            id="cta-heading"
            className="font-display text-fg mt-4 text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Be the one who answers.
          </h2>
          <p className="text-fg-muted mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed sm:text-lg">
            A single donation can provide red cells, platelets, and plasma for
            patients in emergency care. Register today to be notified when
            someone in your district needs blood.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
        </Reveal>
      </div>
    </section>
  );
}
