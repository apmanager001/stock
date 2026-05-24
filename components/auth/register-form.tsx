"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { registerSchema } from "@/lib/auth/validation";
import { authSessionQueryKey } from "@/lib/tanstack/queries/auth";

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<RegisterErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const parsed = registerSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setStatusMessage(
          result.error.message ?? "Unable to create your account.",
        );
        return;
      }

      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
      form.reset();
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your account right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="label px-1" htmlFor="name">
          <span className="label-text font-medium text-base-content">
            Full name
          </span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Avery Mason"
          className={[
            "input input-bordered h-13 w-full rounded-2xl bg-base-100/80 px-4",
            errors.name ? "input-error" : "",
          ].join(" ")}
        />
        {errors.name ? (
          <p className="mt-2 text-sm text-error">{errors.name}</p>
        ) : null}
      </div>

      <div>
        <label className="label px-1" htmlFor="register-email">
          <span className="label-text font-medium text-base-content">
            Email
          </span>
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className={[
            "input input-bordered h-13 w-full rounded-2xl bg-base-100/80 px-4",
            errors.email ? "input-error" : "",
          ].join(" ")}
        />
        {errors.email ? (
          <p className="mt-2 text-sm text-error">{errors.email}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label px-1" htmlFor="register-password">
            <span className="label-text font-medium text-base-content">
              Password
            </span>
          </label>
          <div className="relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
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
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-2 text-sm text-error">{errors.password}</p>
          ) : null}
        </div>

        <div>
          <label className="label px-1" htmlFor="confirmPassword">
            <span className="label-text font-medium text-base-content">
              Confirm password
            </span>
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your password"
            className={[
              "input input-bordered h-13 w-full rounded-2xl bg-base-100/80 px-4",
              errors.confirmPassword ? "input-error" : "",
            ].join(" ")}
          />
          {errors.confirmPassword ? (
            <p className="mt-2 text-sm text-error">{errors.confirmPassword}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.4rem] border border-base-300/70 bg-base-100/75 p-4 text-sm leading-6 text-base-content/62">
        Passwords should be at least 8 characters and include an uppercase
        letter, a number, and a special character.
      </div>

      {statusMessage ? (
        <div className="alert alert-error rounded-2xl text-sm">
          {statusMessage}
        </div>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary h-13 w-full rounded-full text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : null}
        {isSubmitting ? "Creating account" : "Create account"}
      </button>
    </form>
  );
}
