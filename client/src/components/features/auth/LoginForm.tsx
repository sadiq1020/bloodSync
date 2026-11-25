"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { PasswordField } from "./PasswordField";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { cn } from "@/lib/utils";

type DemoRole = "requester" | "donor" | "admin";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const safeNext = getSafeRedirect(nextParam);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pendingDemoRole, setPendingDemoRole] = React.useState<DemoRole | null>(null);

  const showDemoLogin = process.env.NEXT_PUBLIC_DEMO_LOGIN === "true";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isAnySubmitting = isSubmitting || pendingDemoRole !== null;

  const handleAuthError = (status?: number, message?: string) => {
    const msg = message?.toLowerCase() || "";

    if (status === 429) {
      setFormError("Too many attempts. Please wait a minute and try again.");
    } else if (
      status === 401 ||
      status === 400 ||
      msg.includes("invalid") ||
      msg.includes("credential") ||
      msg.includes("password") ||
      msg.includes("email")
    ) {
      setFormError("Email or password is incorrect.");
    } else {
      setFormError("Something went wrong. Check your connection and try again.");
      console.error("Authentication error:", { status, message });
    }
  };

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);

    try {
      const res = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        handleAuthError(res.error.status, res.error.message);
        return;
      }

      toast.success("Welcome back.");
      router.replace(safeNext);
      router.refresh();
    } catch (err: unknown) {
      console.error("Unexpected sign-in error:", err);
      setFormError("Something went wrong. Check your connection and try again.");
    }
  };

  const handleDemoLogin = async (role: DemoRole) => {
    setFormError(null);
    setPendingDemoRole(role);

    let email = "";
    let password = "";

    if (role === "requester") {
      email = process.env.NEXT_PUBLIC_DEMO_REQUESTER_EMAIL || "";
      password = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";
    } else if (role === "donor") {
      email = process.env.NEXT_PUBLIC_DEMO_DONOR_EMAIL || "";
      password = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";
    } else if (role === "admin") {
      email = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || "";
      password = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "";
    }

    if (!email || !password) {
      setFormError("Demo credentials are not configured in environment variables.");
      setPendingDemoRole(null);
      return;
    }

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res?.error) {
        handleAuthError(res.error.status, res.error.message);
        setPendingDemoRole(null);
        return;
      }

      toast.success("Welcome back.");
      const defaultDestination = role === "admin" ? "/admin" : "/requests";
      const target = nextParam ? safeNext : defaultDestination;
      router.replace(target);
      router.refresh();
    } catch (err: unknown) {
      console.error("Unexpected demo sign-in error:", err);
      setFormError("Something went wrong. Check your connection and try again.");
      setPendingDemoRole(null);
    }
  };

  const registerHref = nextParam
    ? `/register?next=${encodeURIComponent(nextParam)}`
    : "/register";

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
          Log in
        </h1>
        <p className="text-fg-muted mt-2 font-sans text-sm">
          Enter your credentials to manage requests and donor status.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-6 rounded-[4px] border border-blood/40 bg-blood/10 p-3.5 font-sans text-xs text-blood animate-in fade-in duration-200"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stagger className="flex flex-col gap-5">
          {/* Email field */}
          <StaggerItem>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="font-mono text-xs uppercase tracking-wider text-fg-dim"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                disabled={isAnySubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                className={cn(
                  "h-12 w-full rounded-[4px] border border-line bg-surface px-3.5 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors",
                  "focus-visible:border-blood focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blood",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  errors.email && "border-blood/70 focus-visible:border-blood"
                )}
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email?.message && (
                <p
                  id="login-email-error"
                  role="alert"
                  className="font-sans text-xs text-blood animate-in fade-in duration-200"
                >
                  {errors.email.message}
                </p>
              )}
            </div>
          </StaggerItem>

          {/* Password field */}
          <StaggerItem>
            <PasswordField
              id="login-password"
              label="Password"
              autoComplete="current-password"
              disabled={isAnySubmitting}
              error={errors.password?.message}
              {...register("password")}
            />
          </StaggerItem>

          {/* Submit button */}
          <StaggerItem>
            <button
              type="submit"
              disabled={isAnySubmitting}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-[4px] bg-blood px-4 font-sans text-sm font-medium text-fg shadow-sm transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-fg/30 border-t-fg" />
                  <span>Signing in...</span>
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </StaggerItem>
        </Stagger>
      </form>

      {/* Demo accounts for reviewers */}
      {showDemoLogin && (
        <div className="mt-8 border-t border-line/60 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wider text-fg-dim">
              Demo accounts
            </h2>
            <span className="rounded-[3px] bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
              Reviewer access
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("requester")}
              disabled={isAnySubmitting}
              aria-label="Log in as demo Requester"
              className={cn(
                "group flex min-h-[44px] flex-col items-center justify-center rounded-[4px] border border-line bg-surface px-3 py-2 text-center transition-colors",
                "hover:border-blood/50 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-blood",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {pendingDemoRole === "requester" ? (
                <span className="flex items-center gap-1.5 font-sans text-xs font-medium text-fg">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blood/30 border-t-blood" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <>
                  <span className="font-sans text-xs font-semibold text-fg group-hover:text-blood">
                    Requester
                  </span>
                  <span className="font-mono text-[10px] text-fg-dim">
                    requester
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("donor")}
              disabled={isAnySubmitting}
              aria-label="Log in as demo Donor"
              className={cn(
                "group flex min-h-[44px] flex-col items-center justify-center rounded-[4px] border border-line bg-surface px-3 py-2 text-center transition-colors",
                "hover:border-blood/50 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-blood",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {pendingDemoRole === "donor" ? (
                <span className="flex items-center gap-1.5 font-sans text-xs font-medium text-fg">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blood/30 border-t-blood" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <>
                  <span className="font-sans text-xs font-semibold text-fg group-hover:text-blood">
                    Donor
                  </span>
                  <span className="font-mono text-[10px] text-fg-dim">
                    donor
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              disabled={isAnySubmitting}
              aria-label="Log in as demo Admin"
              className={cn(
                "group flex min-h-[44px] flex-col items-center justify-center rounded-[4px] border border-line bg-surface px-3 py-2 text-center transition-colors",
                "hover:border-blood/50 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-blood",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {pendingDemoRole === "admin" ? (
                <span className="flex items-center gap-1.5 font-sans text-xs font-medium text-fg">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blood/30 border-t-blood" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <>
                  <span className="font-sans text-xs font-semibold text-fg group-hover:text-blood">
                    Admin
                  </span>
                  <span className="font-mono text-[10px] text-fg-dim">
                    admin
                  </span>
                </>
              )}
            </button>
          </div>

          <p className="mt-2.5 text-center font-sans text-xs text-fg-dim">
            Shared demo accounts. Do not enter personal data.
          </p>
        </div>
      )}

      {/* Switch to Register link */}
      <div className="mt-8 border-t border-line pt-6 text-center">
        <p className="font-sans text-sm text-fg-muted">
          New here?{" "}
          <Link
            href={registerHref}
            className="font-medium text-fg underline decoration-line hover:text-blood hover:decoration-blood focus-visible:outline-2 focus-visible:outline-blood"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blood/30 border-t-blood" />
        </div>
      }
    >
      <LoginFormInner />
    </React.Suspense>
  );
}
