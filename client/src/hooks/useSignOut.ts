"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

/**
 * useSignOut
 * Shared sign-out logic used by UserMenu and AppBottomNav.
 * Signs out via Better Auth, clears the React Query cache,
 * redirects to /login, and refreshes server-component data.
 */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const signOut = async () => {
    try {
      await authClient.signOut();
      queryClient.clear();
      toast.success("You have been signed out.");
      router.replace("/login");
      router.refresh();
    } catch {
      // Even on error, clear local state and redirect
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    }
  };

  return { signOut };
}
