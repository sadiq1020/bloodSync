import { CountUp } from "@/components/motion/CountUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const facts = [
  {
    value: 8,
    caption: "blood groups matched by compatibility",
  },
  {
    value: 64,
    caption: "districts covered",
  },
  {
    value: 90,
    caption: "days between donations, enforced",
  },
  {
    value: 4,
    caption: "request stages, from open to fulfilled",
  },
];

/**
 * FactsStrip (Server Component container with motion)
 * Four true product parameters. No invented usage numbers.
 */
export function FactsStrip() {
  return (
    <section
      aria-label="Platform parameters"
      className="border-y border-line bg-surface py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Stagger className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {facts.map((fact) => (
            <StaggerItem key={fact.caption}>
              <div className="flex flex-col border-l border-line pl-4 sm:pl-6">
                <CountUp
                  value={fact.value}
                  className="font-display text-fg text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
                />
                <span className="text-fg-muted mt-2 font-mono text-xs uppercase tracking-wide leading-relaxed">
                  {fact.caption}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
