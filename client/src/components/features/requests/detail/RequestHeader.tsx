import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { UrgencyBadge } from "@/components/brand/UrgencyBadge";
import { StatusBadge } from "@/components/brand/StatusBadge";
import {
  formatDateTime,
  formatRelativeTime,
  formatRequestCode,
} from "@/lib/format";
import type { BloodRequest } from "@/types/api";

interface RequestHeaderProps {
  request: BloodRequest;
}

/**
 * RequestHeader (Server Component): Displays primary metadata, badges,
 * request code, hospital heading, patient information, and timestamps.
 */
export function RequestHeader({ request }: RequestHeaderProps) {
  const {
    id,
    bloodGroup,
    hospital,
    area,
    district,
    urgency,
    status,
    neededBy,
    createdAt,
    patientName,
    forSelf,
  } = request;

  const requestCode = formatRequestCode(id);
  const absoluteNeededBy = formatDateTime(neededBy);
  const relativeNeededBy = formatRelativeTime(neededBy);
  const postedRelative = formatRelativeTime(createdAt);

  return (
    <header className="space-y-4">
      {/* Top row: Request Code & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-fg-dim">
          {requestCode}
        </span>
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={urgency} />
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Main header block: Blood badge + Hospital title + Location */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="shrink-0">
          <BloodTypeBadge bloodGroup={bloodGroup} size="xl" variant="tag" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl sm:leading-tight">
            {hospital}
          </h1>
          <p className="font-mono text-sm tracking-wide text-fg-muted">
            {area}, {district}
          </p>

          <p className="font-sans text-sm text-fg-dim">
            <span className="text-fg-muted">Patient:</span>{" "}
            <span className="font-medium text-fg">{patientName}</span>
            {forSelf && (
              <span className="ml-1.5 text-xs text-fg-dim">
                (for the poster)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Meta timestamps row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3 font-mono text-xs text-fg-dim">
        <div>
          <span className="text-fg-dim">Needed: </span>
          <span className="text-fg">
            {absoluteNeededBy}{" "}
            <span className="text-fg-dim">({relativeNeededBy})</span>
          </span>
        </div>
        <span className="text-line-strong select-none" aria-hidden="true">
          •
        </span>
        <div>
          <span className="text-fg-dim">Posted: </span>
          <span className="text-fg">{postedRelative}</span>
        </div>
      </div>
    </header>
  );
}
