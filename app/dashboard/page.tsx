import type { Metadata } from "next";
import {
  ArrowRight,
  Database,
  Gauge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireServerSession } from "@/lib/backend/auth/session";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description:
    "Starter protected dashboard for validating Better Auth sessions and the local MongoDB-backed template flow.",
  path: "/dashboard",
  noIndex: true,
});

const quickStarts = [
  {
    title: "Build your first protected screen",
    description:
      "The session is already available server-side here, so this is the right place to branch into account settings, billing, or team pages.",
    icon: ShieldCheck,
  },
  {
    title: "Connect your data model",
    description:
      "Add collections and Mongoose models under lib/backend and keep your route handlers thin and focused.",
    icon: Database,
  },
  {
    title: "Measure what matters",
    description:
      "Set NEXT_PUBLIC_GA_ID and GOOGLE_SITE_VERIFICATION in .env when you are ready for production analytics and search tooling.",
    icon: Gauge,
  },
] as const;

export default async function DashboardPage() {
  const session = await requireServerSession();
  const userLabel = session.user.name ?? session.user.email;

  return (
    <section className="section-shell py-8 lg:py-14">
      <div className="glass-panel rounded-[2rem] border border-base-300/70 p-8 shadow-lg shadow-primary/5 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="badge badge-outline rounded-full border-secondary/30 bg-base-100/80 px-4 py-4 text-xs uppercase tracking-[0.24em] text-secondary">
              <Sparkles className="mr-2 h-4 w-4" />
              Protected route working
            </div>
            <h1 className="mt-5 text-balance font-display text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
              Welcome to the starter dashboard, {userLabel}.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-base-content/70">
              This page proves the auth flow is live: registration, login,
              cookies, and server-side session reads are all connected.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <SignOutButton />
            <Link href="/" className="btn btn-outline rounded-full px-6">
              Back to homepage
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {quickStarts.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[1.5rem] border border-base-300/70 bg-base-100/80 p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-base-content">
                {title}
              </h2>
              <p className="mt-2 leading-7 text-base-content/68">
                {description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] bg-neutral p-6 text-neutral-content shadow-xl shadow-neutral/15">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-content/60">
            Suggested next steps
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/"
              className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/6 px-4 py-4 text-sm"
            >
              Review the public homepage
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/6 px-4 py-4 text-sm"
            >
              Test another account flow
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://www.better-auth.com/docs/basic-usage"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/6 px-4 py-4 text-sm"
            >
              Extend Better Auth
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
