import Link from "next/link";
import { Users, Drop, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function AdminQuickLinks() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Link
        href="/admin/users"
        className="group flex items-center justify-between rounded-[6px] border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-blood-deep/20 text-blood">
            <Users className="h-5 w-5" weight="bold" />
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-fg">
              Manage Users
            </p>
            <p className="font-mono text-xs text-fg-dim">
              Search accounts, roles, and status
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-fg-dim transition-transform group-hover:translate-x-1 group-hover:text-fg" />
      </Link>

      <Link
        href="/admin/requests"
        className="group flex items-center justify-between rounded-[6px] border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-plasma/20 text-plasma">
            <Drop className="h-5 w-5" weight="bold" />
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-fg">
              Manage Requests
            </p>
            <p className="font-mono text-xs text-fg-dim">
              Filter by urgency, close or delete
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-fg-dim transition-transform group-hover:translate-x-1 group-hover:text-fg" />
      </Link>
    </div>
  );
}
