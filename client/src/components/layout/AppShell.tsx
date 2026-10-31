import { type CurrentUser } from "@/types";
import { AppTopBar } from "./AppTopBar";
import { AppBottomNav } from "./AppBottomNav";

interface AppShellProps {
  user: Pick<CurrentUser, "id" | "name" | "email" | "role" | "image">;
  children: React.ReactNode;
  /**
   * Optional full-width slot rendered between the top bar and <main>.
   * Used by AdminLayout to place the AdminNav tab strip.
   */
  subheader?: React.ReactNode;
}

/**
 * AppShell (Server Component)
 * The main logged-in app wrapper.
 * Renders the skip link, top bar, optional subheader, main content area, and mobile bottom nav.
 * Only the parts that need client-side state (UserMenu, AppBottomNav) are client components.
 */
export function AppShell({ user, children, subheader }: AppShellProps) {
  return (
    <>
      {/* Skip link for keyboard/screen-reader users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-[4px] focus:bg-blood focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:font-medium focus:text-fg focus:outline-none"
      >
        Skip to content
      </a>

      <AppTopBar user={user} />

      {/* Optional full-width subheader (e.g. AdminNav tab strip) */}
      {subheader}

      {/* Main content area */}
      <main
        id="main"
        className={[
          // Horizontal centering with comfortable side padding
          "mx-auto w-full max-w-[1200px] px-4 sm:px-6",
          // Vertical padding: top breathing room, extra bottom on mobile for the bottom bar
          "py-6 sm:py-8",
          // Extra bottom padding on mobile so content never hides behind the fixed bottom bar
          "pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] lg:pb-8",
        ].join(" ")}
      >
        {children}
      </main>

      {/* Mobile-only bottom navigation */}
      <AppBottomNav name={user.name} email={user.email} role={user.role} />
    </>
  );
}
