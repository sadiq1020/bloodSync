import { getCurrentUser } from "@/lib/api/server";
import { SignOutButton } from "@/components/features/auth/SignOutButton";

export default async function RequestsPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <h1 className="font-display text-fg text-2xl font-semibold">
            Emergency Blood Requests
          </h1>
          <p className="text-fg-muted mt-1 text-sm">
            Browse and respond to active emergency blood requests across Bangladesh.
          </p>
        </div>

        {/* Temporary check display for testing flow */}
        {user && (
          <div className="flex items-center gap-3 rounded-[4px] border border-line bg-surface p-2.5">
            <span className="font-sans text-xs text-fg-muted">
              Signed in as <strong className="text-fg">{user.name}</strong> ({user.email})
            </span>
            <SignOutButton />
          </div>
        )}
      </div>
    </div>
  );
}
