import { CountUp } from "@/components/motion/CountUp";

interface StatTilesProps {
  stats: {
    totalUsers: number;
    blockedUsers: number;
    totalDonors: number;
    availableEligibleDonors: number;
    donationsCompleted: number;
  };
}

export function StatTiles({ stats }: StatTilesProps) {
  const tiles = [
    {
      label: "TOTAL USERS",
      value: stats.totalUsers,
      helper: "Registered platform accounts",
    },
    {
      label: "BLOCKED USERS",
      value: stats.blockedUsers,
      helper: "Suspended or deactivated",
      highlight: stats.blockedUsers > 0 ? "blood" : undefined,
    },
    {
      label: "TOTAL DONORS",
      value: stats.totalDonors,
      helper: "Profiles with blood group",
    },
    {
      label: "AVAILABLE & ELIGIBLE",
      value: stats.availableEligibleDonors,
      helper: "Ready to volunteer now",
      highlight: "sage",
    },
    {
      label: "COMPLETED DONATIONS",
      value: stats.donationsCompleted,
      helper: "Units successfully given",
      highlight: "plasma",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((tile, idx) => (
        <div
          key={tile.label}
          className={`flex flex-col justify-between rounded-[6px] border border-line bg-surface p-4 transition-colors hover:border-line-strong ${
            idx === 4 ? "col-span-2 sm:col-span-1" : ""
          }`}
        >
          <div className="space-y-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-fg-muted">
              {tile.label}
            </p>
            <div className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              <CountUp value={tile.value} />
            </div>
          </div>
          <p className="mt-2 font-mono text-[11px] text-fg-dim">
            {tile.helper}
          </p>
        </div>
      ))}
    </div>
  );
}
