import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { BLOOD_GROUPS, type BloodGroup } from "@/lib/constants/bloodGroups";

interface DonorsByBloodGroupProps {
  counts: Record<string, number>;
}

export function DonorsByBloodGroup({ counts }: DonorsByBloodGroupProps) {
  const maxCount = Math.max(
    1,
    ...BLOOD_GROUPS.map((bg) => counts[bg] || 0)
  );

  const totalDonors = BLOOD_GROUPS.reduce(
    (sum, bg) => sum + (counts[bg] || 0),
    0
  );

  const screenReaderSummary = `Registered donors by blood group: ${BLOOD_GROUPS.map(
    (bg) => `${bg}: ${counts[bg] || 0}`
  ).join(", ")}. Total profiled donors: ${totalDonors}.`;

  return (
    <div className="rounded-[6px] border border-line bg-surface p-5">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="font-display text-base font-semibold text-fg">
            Donors by Blood Group
          </h2>
          <p className="font-mono text-xs text-fg-dim">
            Registered donor inventory across all 8 types
          </p>
        </div>
        <span className="font-mono text-xs text-fg-muted">
          Total: <strong className="text-fg">{totalDonors}</strong>
        </span>
      </div>

      {/* Screen reader summary */}
      <p className="sr-only">{screenReaderSummary}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
        {BLOOD_GROUPS.map((bg: BloodGroup) => {
          const count = counts[bg] || 0;
          const percentage = (count / maxCount) * 100;

          return (
            <div
              key={bg}
              className="flex flex-col justify-between rounded-[4px] border border-line/70 bg-surface-2/60 p-3"
            >
              <div className="flex items-center justify-between">
                <BloodTypeBadge bloodGroup={bg} size="sm" />
                <span className="font-mono text-sm font-bold text-fg">
                  {count}
                </span>
              </div>

              <div className="mt-2.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-blood transition-all duration-700 ease-out motion-reduce:transition-none"
                    style={{
                      width: `${Math.max(percentage, count > 0 ? 4 : 0)}%`,
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
