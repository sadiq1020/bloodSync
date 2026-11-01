import { PhoneCall } from "@phosphor-icons/react/dist/ssr";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { CopyPhoneButton } from "./CopyPhoneButton";
import type { BloodRequest } from "@/types/api";

interface RequestDetailsProps {
  request: BloodRequest;
}

/**
 * RequestDetails (Server Component): Renders a definition list with mono labels.
 * Includes contact phone with Call link and Copy button if returned by API.
 */
export function RequestDetails({ request }: RequestDetailsProps) {
  const { unitsNeeded, urgency, neededBy, contactPhone, note } = request;

  const absoluteNeededBy = formatDateTime(neededBy);
  const relativeNeededBy = formatRelativeTime(neededBy);

  return (
    <div className="rounded-[6px] border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-mono text-xs uppercase tracking-widest text-fg-dim mb-4">
        Request Details
      </h2>

      <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
        {/* Units Needed */}
        <div className="space-y-1">
          <dt className="font-mono text-[11px] uppercase tracking-wider text-fg-dim">
            Units needed
          </dt>
          <dd className="font-sans text-sm font-medium text-fg">
            {unitsNeeded} {unitsNeeded === 1 ? "unit (bag)" : "units (bags)"}
          </dd>
        </div>

        {/* Urgency */}
        <div className="space-y-1">
          <dt className="font-mono text-[11px] uppercase tracking-wider text-fg-dim">
            Urgency
          </dt>
          <dd className="font-sans text-sm font-medium text-fg">
            {urgency === "CRITICAL"
              ? "Critical (Immediate)"
              : urgency === "URGENT"
                ? "Urgent (Within hours)"
                : "Normal (Standard schedule)"}
          </dd>
        </div>

        {/* Needed By */}
        <div className="space-y-1 sm:col-span-2">
          <dt className="font-mono text-[11px] uppercase tracking-wider text-fg-dim">
            Needed by
          </dt>
          <dd className="font-sans text-sm font-medium text-fg">
            {absoluteNeededBy}{" "}
            <span className="font-mono text-xs text-fg-dim">
              ({relativeNeededBy})
            </span>
          </dd>
        </div>

        {/* Contact Phone (only rendered if API returned it) */}
        {contactPhone && (
          <div className="space-y-1.5 sm:col-span-2 border-t border-line pt-3">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-fg-dim">
              Contact phone
            </dt>
            <dd className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold tracking-wide text-fg">
                {contactPhone}
              </span>

              {/* Call link */}
              <a
                href={`tel:${contactPhone}`}
                aria-label="Call requester"
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-[4px] bg-blood px-3 py-1 font-sans text-xs font-medium text-fg transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood"
              >
                <PhoneCall className="size-3.5" aria-hidden="true" />
                <span>Call</span>
              </a>

              {/* Copy button */}
              <CopyPhoneButton phone={contactPhone} />
            </dd>
          </div>
        )}

        {/* Note */}
        {note && (
          <div className="space-y-1 sm:col-span-2 border-t border-line pt-3">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-fg-dim">
              Note from requester
            </dt>
            <dd className="font-sans text-sm text-fg-muted whitespace-pre-wrap leading-relaxed">
              {note}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
