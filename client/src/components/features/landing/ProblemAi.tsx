import { Reveal } from "@/components/motion/Reveal";
import { AiPreview } from "./AiPreview";

/**
 * ProblemAi (Server Component with AiPreview client demo)
 * Editorial 2-column breakdown of social media friction vs structured matching.
 */
export function ProblemAi() {
  return (
    <section
      aria-labelledby="problem-heading"
      className="py-16 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Problem statement */}
          <div className="lg:col-span-6">
            <Reveal>
              <p className="text-fg-dim font-mono text-xs uppercase tracking-widest">
                THE PROBLEM
              </p>
              <h2
                id="problem-heading"
                className="font-display text-fg mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl leading-[1.12]"
              >
                Urgent requests drown in feeds within sixty minutes.
              </h2>
              <div className="text-fg-muted mt-6 flex flex-col gap-4 font-sans text-base leading-relaxed">
                <p>
                  When a patient needs blood in Bangladesh, relatives copy and paste
                  distress messages into public groups and chat apps. Within an hour,
                  newer posts push the call out of sight.
                </p>
                <p>
                  Phone numbers circulate without hospital names, donors from distant
                  districts respond by mistake, and families waste critical hours
                  calling numbers that are already exhausted or unavailable.
                </p>
                <p>
                  BloodSync extracts the patient requirements directly from raw
                  messages, validates the district and compatibility, and directs
                  the request only to eligible donors who are ready to give.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right Column: AI Extraction Simulation */}
          <div className="lg:col-span-6">
            <Reveal delay={0.15}>
              <AiPreview />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
