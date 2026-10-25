"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { PasswordField } from "./PasswordField";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { cn } from "@/lib/utils";

function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);

    try {
      const res = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.toLowerCase().trim(),
        password: values.password,
      });

      if (res?.error) {
        const status = res.error.status;
        const msg = res.error.message?.toLowerCase() || "";

        if (status === 429) {
          setFormError("Too many attempts. Please wait a minute and try again.");
        } else if (
          msg.includes("already") ||
          msg.includes("exist") ||
          status === 409
        ) {
          setError("email", {
            type: "manual",
            message: "An account with this email already exists.",
          });
        } else {
          setFormError("Something went wrong. Check your connection and try again.");
          console.error("Sign-up error:", { status, message: res.error.message });
        }
        return;
      }

      toast.success("Account created.");
      router.replace("/requests");
      router.refresh();
    } catch (err: unknown) {
      console.error("Unexpected sign-up error:", err);
      setFormError("Something went wrong. Check your connection and try again.");
    }
  };

  const loginHref = nextParam
    ? `/login?next=${encodeURIComponent(nextParam)}`
    : "/login";

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
          Create account
        </h1>
        <p className="text-fg-muted mt-2 font-sans text-sm">
          Register to find blood donors or volunteer in your district.
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
        <Stagger className="flex flex-col gap-4.5">
          {/* Full Name */}
          <StaggerItem>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-name"
                className="font-mono text-xs uppercase tracking-wider text-fg-dim"
              >
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "register-name-error" : undefined}
                className={cn(
                  "h-12 w-full rounded-[4px] border border-line bg-surface px-3.5 font-sans text-sm text-fg placeholder:text-fg-dim transition-colors",
                  "focus-visible:border-blood focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blood",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  errors.name && "border-blood/70 focus-visible:border-blood"
                )}
                placeholder="Dr. Sadiq Masud"
                {...register("name")}
              />
              {errors.name?.message && (
                <p
                  id="register-name-error"
                  role="alert"
                  className="font-sans text-xs text-blood animate-in fade-in duration-200"
                >
                  {errors.name.message}
                </p>
              )}
            </div>
          </StaggerItem>

          {/* Email */}
          <StaggerItem>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-email"
                className="font-mono text-xs uppercase tracking-wider text-fg-dim"
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "register-email-error" : undefined}
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
                  id="register-email-error"
                  role="alert"
                  className="font-sans text-xs text-blood animate-in fade-in duration-200"
                >
                  {errors.email.message}
                </p>
              )}
            </div>
          </StaggerItem>

          {/* Password */}
          <StaggerItem>
            <PasswordField
              id="register-password"
              label="Password (min 8 characters)"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </StaggerItem>

          {/* Confirm Password */}
          <StaggerItem>
            <PasswordField
              id="register-confirm-password"
              label="Confirm Password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </StaggerItem>

          {/* Submit button */}
          <StaggerItem>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-[4px] bg-blood px-4 font-sans text-sm font-medium text-fg shadow-sm transition-colors hover:bg-blood-hover focus-visible:outline-2 focus-visible:outline-blood disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-fg/30 border-t-fg" />
                  <span>Creating account...</span>
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </StaggerItem>
        </Stagger>
      </form>

      {/* Switch to Login link */}
      <div className="mt-8 border-t border-line pt-6 text-center">
        <p className="font-sans text-sm text-fg-muted">
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="font-medium text-fg underline decoration-line hover:text-blood hover:decoration-blood focus-visible:outline-2 focus-visible:outline-blood"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterForm() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blood/30 border-t-blood" />
        </div>
      }
    >
      <RegisterFormInner />
    </React.Suspense>
  );
}
