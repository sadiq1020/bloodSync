import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/server";
import { ApiError } from "@/lib/api/error";
import { BlockedNotice } from "@/components/features/auth/BlockedNotice";
import { AppShell } from "@/components/layout/AppShell";
import { AdminNav } from "@/components/layout/AdminNav";

export default async function AdminLayout({
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
    const pathname = headerList.get("x-pathname") || "/admin";
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  if (user.role !== "ADMIN") {
    redirect("/requests");
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
      subheader={<AdminNav />}
    >
      {children}
    </AppShell>
  );
}
