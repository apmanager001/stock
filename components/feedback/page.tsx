"use client";

import type { FormEvent } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  LoaderCircle,
  MessageSquare,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { feedbackSubmissionSchema } from "@/lib/feedback/validation";

type TurnstileRenderer = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "flexible";
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileRenderer;
  }
}

type FeedbackErrors = {
  name?: string;
  email?: string;
  message?: string;
  captcha?: string;
};

type FeedbackStatus = {
  tone: "success" | "error";
  message: string;
};

type TurnstileFieldProps = {
  siteKey: string;
  errorMessage?: string;
  resetNonce: number;
  onTokenChange: (token: string) => void;
  onLoadError: (message: string) => void;
};

function TurnstileField({
  siteKey,
  errorMessage,
  resetNonce,
  onTokenChange,
  onLoadError,
}: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );
  const handleTokenChange = useEffectEvent(onTokenChange);
  const handleLoadError = useEffectEvent(onLoadError);

  useEffect(() => {
    if (
      !siteKey ||
      !scriptReady ||
      !containerRef.current ||
      widgetIdRef.current ||
      !window.turnstile
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "auto",
      size: "flexible",
      callback: (token) => {
        handleTokenChange(token);
      },
      "expired-callback": () => {
        handleTokenChange("");
      },
      "error-callback": () => {
        handleTokenChange("");
        handleLoadError(
          "CAPTCHA failed to load. Refresh the page and try again.",
        );
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, siteKey]);

  useEffect(() => {
    if (!resetNonce || !widgetIdRef.current || !window.turnstile) {
      return;
    }

    window.turnstile.reset(widgetIdRef.current);
    handleTokenChange("");
  }, [resetNonce]);

  return (
    <div className="rounded-[1.6rem] border border-base-300/70 bg-base-100/82 p-4">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() =>
          onLoadError("CAPTCHA failed to load. Refresh the page and try again.")
        }
      />

      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
        <ShieldCheck className="h-4 w-4" />
        Verification
      </p>
      <div ref={containerRef} className="mt-3 min-h-18" />
      <p className="mt-2 text-xs leading-5 text-base-content/52">
        This challenge helps block spam submissions.
      </p>
      {errorMessage ? (
        <p className="mt-2 text-sm text-error">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function mapFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): FeedbackErrors {
  return {
    name: fieldErrors.name?.[0],
    email: fieldErrors.email?.[0],
    message: fieldErrors.message?.[0],
    captcha: fieldErrors.captchaToken?.[0],
  };
}

export default function Feedback() {
  const pathname = usePathname();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const isCaptchaConfigured = Boolean(turnstileSiteKey);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);
  const [captchaLoadError, setCaptchaLoadError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<FeedbackStatus | null>(
    null,
  );
  const [errors, setErrors] = useState<FeedbackErrors>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const visibleStatusMessage = captchaLoadError
    ? {
        tone: "error" as const,
        message: captchaLoadError,
      }
    : statusMessage;

  function handleCaptchaTokenChange(token: string) {
    setCaptchaToken(token);
    setCaptchaLoadError(null);

    if (!token) {
      return;
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      captcha: undefined,
    }));
  }

  function handleCaptchaLoadError(message: string) {
    setCaptchaLoadError(message);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      pagePath: pathname || "/",
    };

    const parsed = feedbackSubmissionSchema.safeParse(values);

    if (!parsed.success) {
      setErrors(mapFieldErrors(parsed.error.flatten().fieldErrors));
      return;
    }

    if (!isCaptchaConfigured) {
      setStatusMessage({
        tone: "error",
        message:
          "Feedback CAPTCHA is not configured. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY.",
      });
      return;
    }

    if (!captchaToken) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        captcha: "Complete the CAPTCHA challenge.",
      }));
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setCaptchaLoadError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...parsed.data,
          captchaToken,
          company: String(formData.get("company") ?? ""),
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        fieldErrors?: Record<string, string[] | undefined>;
      } | null;

      setCaptchaResetNonce((count) => count + 1);
      setCaptchaToken("");

      if (!response.ok) {
        if (payload?.fieldErrors) {
          setErrors(mapFieldErrors(payload.fieldErrors));
        }

        setStatusMessage({
          tone: "error",
          message: payload?.error ?? "Unable to send feedback right now.",
        });
        return;
      }

      form.reset();
      setStatusMessage({
        tone: "success",
        message: "Thanks. Your feedback has been sent.",
      });
    } catch (error) {
      setCaptchaResetNonce((count) => count + 1);
      setCaptchaToken("");
      setStatusMessage({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to send feedback right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close feedback form"
        onClick={() => setIsOpen(false)}
        tabIndex={isOpen ? 0 : -1}
        className={[
          "absolute inset-0 transition-opacity duration-300",
          isOpen
            ? "pointer-events-auto bg-neutral/42 opacity-100 backdrop-blur-sm"
            : "opacity-0",
        ].join(" ")}
      />

      <aside
        id="feedback-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-panel-title"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={[
          "pointer-events-auto absolute right-0 top-0 flex h-dvh w-full max-w-none flex-col bg-base-100/95 shadow-2xl shadow-neutral/25 backdrop-blur-xl transition-transform duration-300 ease-out sm:max-w-md sm:rounded-l-4xl sm:border-l sm:border-base-300/70",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-base-300/60 p-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:p-6 sm:pt-6">
          <div className="space-y-4">
            <div className="badge badge-outline gap-2 rounded-full border-primary/30 bg-base-100/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <MessageSquare className="h-4 w-4" />
              Share feedback
            </div>

            <div>
              <h2
                id="feedback-panel-title"
                className="font-display text-3xl font-semibold text-base-content"
              >
                Tell us what to improve
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-base-content/68">
                Anyone can submit feedback or suggestions. Leave your email if
                you want a follow-up.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => setIsOpen(false)}
            aria-label="Close feedback form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <div>
              <label className="label px-1" htmlFor="feedback-name">
                <span className="label-text font-medium text-base-content">
                  Name
                </span>
              </label>
              <input
                id="feedback-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jordan Lee"
                className={[
                  "input input-bordered h-13 w-full rounded-2xl bg-base-100/80 px-4",
                  errors.name ? "input-error" : "",
                ].join(" ")}
                required
              />
              {errors.name ? (
                <p className="mt-2 text-sm text-error">{errors.name}</p>
              ) : null}
            </div>

            <div>
              <label className="label px-1" htmlFor="feedback-email">
                <span className="label-text font-medium text-base-content">
                  Email
                </span>
              </label>
              <input
                id="feedback-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={[
                  "input input-bordered h-13 w-full rounded-2xl bg-base-100/80 px-4",
                  errors.email ? "input-error" : "",
                ].join(" ")}
                required
              />
              {errors.email ? (
                <p className="mt-2 text-sm text-error">{errors.email}</p>
              ) : null}
            </div>

            <div>
              <label className="label px-1" htmlFor="feedback-message">
                <span className="label-text font-medium text-base-content">
                  Message
                </span>
              </label>
              <textarea
                id="feedback-message"
                name="message"
                rows={7}
                placeholder="What feels broken, missing, confusing, or worth improving?"
                className={[
                  "textarea textarea-bordered min-h-40 w-full rounded-[1.6rem] bg-base-100/80 px-4 py-4",
                  errors.message ? "textarea-error" : "",
                ].join(" ")}
                required
              />
              {errors.message ? (
                <p className="mt-2 text-sm text-error">{errors.message}</p>
              ) : null}
            </div>

            {isCaptchaConfigured ? (
              <TurnstileField
                siteKey={turnstileSiteKey}
                errorMessage={errors.captcha}
                resetNonce={captchaResetNonce}
                onTokenChange={handleCaptchaTokenChange}
                onLoadError={handleCaptchaLoadError}
              />
            ) : (
              <div className="rounded-[1.6rem] border border-dashed border-error/40 bg-error/8 p-4 text-sm leading-6 text-error">
                Feedback CAPTCHA is not configured yet. Add
                NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY before
                enabling submissions.
              </div>
            )}
          </div>

          <div className="border-t border-base-300/60 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-6">
            {visibleStatusMessage ? (
              <div
                className={[
                  "alert rounded-2xl text-sm",
                  visibleStatusMessage.tone === "success"
                    ? "alert-success"
                    : "alert-error",
                ].join(" ")}
              >
                {visibleStatusMessage.message}
              </div>
            ) : null}

            <button
              type="submit"
              className="btn btn-primary mt-4 h-13 w-full rounded-full text-base"
              disabled={isSubmitting || !isCaptchaConfigured}
            >
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? "Sending feedback" : "Send feedback"}
            </button>
          </div>
        </form>
      </aside>

      <div className="pointer-events-auto absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] sm:bottom-6 sm:right-6">
        <button
          type="button"
          aria-controls="feedback-panel"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close feedback form" : "Open feedback form"}
          onClick={() => setIsOpen((open) => !open)}
          className={[
            "btn btn-circle btn-md shadow-2xl transition-all duration-300 sm:btn-lg",
            isOpen
              ? "btn-neutral scale-95"
              : "btn-primary shadow-primary/30 hover:scale-105",
          ].join(" ")}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageSquare className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
