import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/config/site";

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  alternateHref: string;
  alternateText: string;
  alternateLabel: string;
  children: React.ReactNode;
};

export function AuthShell({
  badge,
  title,
  description,
  highlights,
  alternateHref,
  alternateText,
  alternateLabel,
  children,
}: AuthShellProps) {
  return (
    <section className="section-shell grid gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
      <div className="order-2 lg:order-1">
        <div className="glass-panel rounded-2xl border border-base-300/70 p-8 shadow-lg shadow-primary/5 lg:sticky lg:top-28">
          <div className="badge badge-outline rounded-full border-secondary/30 bg-base-100/75 px-4 py-4 text-xs uppercase tracking-[0.24em] text-secondary">
            <Sparkles className="mr-2 h-4 w-4" />
            {badge}
          </div>

          <h1 className="mt-5 text-balance font-display text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-base-content/70">
            {description}
          </p>

          <div className="mt-8 space-y-4">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-start gap-3 rounded-lg border border-base-300/70 bg-base-100/70 p-4"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-success/12 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="leading-7 text-base-content/72">{highlight}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {siteConfig.stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-base-300/70 bg-base-100/85 px-3 py-2 text-sm text-base-content/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <div className="glass-panel rounded-2xl border border-base-300/70 shadow-[0_24px_100px_-40px_color-mix(in_oklab,var(--color-primary)_40%,transparent)]">
          <div className="p-8 sm:p-10">
            {children}

            <p className="mt-8 flex flex-wrap items-center gap-2 text-sm text-base-content/68">
              <span>{alternateText}</span>
              <Link
                href={alternateHref}
                className="inline-flex items-center gap-2 font-semibold text-primary"
              >
                {alternateLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
