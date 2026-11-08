import {
  BLOOD_GROUPS,
  canDonateTo,
} from "@/lib/constants/blood-compatibility";
import { formatBloodGroup } from "@/lib/format";

/**
 * CompatibilityMatrix (Server Component)
 * Fully server-rendered semantic 8x8 table mapping red blood cell donor to recipient compatibility.
 * Provides accessible headers, row/column scopes, screen-reader text, and sticky first column.
 */
export function CompatibilityMatrix() {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-fg">
            8 by 8 Compatibility Matrix
          </h2>
          <p className="font-sans text-xs text-fg-muted">
            Cross-reference red blood cell donor compatibility against recipient blood group.
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-fg-dim">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="flex size-4 items-center justify-center rounded-[2px] bg-blood-deep/40 font-mono text-[11px] font-bold text-blood-light"
            >
              +
            </span>
            <span>Can give</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="flex size-4 items-center justify-center rounded-[2px] bg-surface-2 font-mono text-[11px] text-fg-dim"
            >
              &minus;
            </span>
            <span>Cannot give</span>
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-[6px] border border-line bg-surface">
        <table
          className="w-full min-w-[560px] border-collapse font-sans text-xs"
          aria-label="Red blood cell donor and recipient compatibility matrix"
        >
          <caption className="sr-only">
            Red blood cell compatibility by donor and recipient blood group
          </caption>
          <thead>
            <tr className="border-b border-line bg-surface-2/60 font-mono text-[11px]">
              <th
                scope="col"
                className="sticky left-0 z-20 border-r border-line bg-surface p-3 text-left font-semibold text-fg-dim"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-fg-dim">
                    RECIPIENT &rarr;
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-blood-light font-bold">
                    DONOR &darr;
                  </span>
                </div>
              </th>
              {BLOOD_GROUPS.map((recipient) => (
                <th
                  key={recipient}
                  scope="col"
                  data-recipient-col={recipient}
                  className="p-2.5 text-center font-mono text-xs font-semibold text-fg transition-colors select-none"
                >
                  {formatBloodGroup(recipient)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLOOD_GROUPS.map((donor) => (
              <tr
                key={donor}
                data-donor-row={donor}
                className="border-b border-line/60 transition-colors last:border-b-0 hover:bg-surface-2/30"
              >
                <th
                  scope="row"
                  data-donor-header={donor}
                  className="sticky left-0 z-10 border-r border-line bg-surface p-3 text-left font-mono text-xs font-semibold text-fg transition-colors select-none"
                >
                  {formatBloodGroup(donor)}
                </th>
                {BLOOD_GROUPS.map((recipient) => {
                  const compatible = canDonateTo(donor, recipient);

                  return (
                    <td
                      key={`${donor}-${recipient}`}
                      data-cell-donor={donor}
                      data-cell-recipient={recipient}
                      className="p-2 text-center transition-colors"
                    >
                      {compatible ? (
                        <span className="inline-flex size-6 items-center justify-center font-mono text-sm font-bold text-blood-light">
                          <span aria-hidden="true">+</span>
                          <span className="sr-only">can give</span>
                        </span>
                      ) : (
                        <span className="inline-flex size-6 items-center justify-center font-mono text-sm text-fg-dim/40">
                          <span aria-hidden="true">&minus;</span>
                          <span className="sr-only">cannot give</span>
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
