import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/server";
import { ApiError } from "@/lib/api/error";
import { BlockedNotice } from "@/components/features/auth/BlockedNotice";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return <BlockedNotice />;
    }
    throw err;
  }

  if (!user) {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") || "/requests";
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      }}
    >
      {children}
    </AppShell>
  );
}
