"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { loginSchema } from "@/lib/auth/validation";
import { authSessionQueryKey } from "@/lib/tanstack/queries/auth";

type LoginErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<LoginErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      rememberMe: formData.get("rememberMe") === "on",
    };

    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: "/dashboard",
        rememberMe: parsed.data.rememberMe ?? true,
      });

      if (result.error) {
        setStatusMessage(
          result.error.message ?? "Unable to sign in with those credentials.",
        );
        return;
      }

      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
      form.reset();
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="label px-1" htmlFor="email">
          <span className="label-text font-medium text-base-content">Email</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className={[
            "input input-bordered h-13 w-full rounded-2xl bg-base-100/80 px-4",
            errors.email ? "input-error" : "",
          ].join(" ")}
        />
        {errors.email ? <p className="mt-2 text-sm text-error">{errors.email}</p> : null}
      </div>

      <div>
        <label className="label px-1" htmlFor="password">
          <span className="label-text font-medium text-base-content">Password</span>
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password"
            className={[
              "input input-bordered h-13 w-full rounded-2xl bg-base-100/80 px-4 pr-14",
              errors.password ? "input-error" : "",
            ].join(" ")}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-base-content/55"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? (
          <p className="mt-2 text-sm text-error">{errors.password}</p>
        ) : null}
      </div>

      <label className="label cursor-pointer justify-start gap-3 px-1">
        <input name="rememberMe" type="checkbox" defaultChecked className="checkbox checkbox-sm checkbox-primary" />
        <span className="label-text text-base-content/70">Keep me signed in on this device</span>
      </label>

      {statusMessage ? (
        <div className="alert alert-error rounded-2xl text-sm">{statusMessage}</div>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary h-13 w-full rounded-full text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Signing in" : "Sign in"}
      </button>

      <p className="text-sm leading-6 text-base-content/58">
        If Better Auth or MongoDB are not configured yet, the form will return a clear setup error until the env values are added.
      </p>
    </form>
  );
}