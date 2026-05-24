import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  DatabaseZap,
  LayoutTemplate,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/config/site";
import { absoluteUrl, createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Next.js template with Better Auth, MongoDB, and DaisyUI",
  description:
    "Clone a production-ready Next.js template with Better Auth, MongoDB, Mongoose, DaisyUI, TanStack Query, Google Analytics, and strong SEO already wired.",
  path: "/",
  keywords: [
    ...siteConfig.keywords,
    "Next.js boilerplate",
    "full-stack starter template",
    "Google Analytics setup",
  ],
});

const featureCards = [
  {
    title: "Shared foundation",
    description:
      "A polished homepage, sticky header, and footer are already in place so new projects start from a finished-feeling shell.",
    icon: LayoutTemplate,
  },
  {
    title: "Auth-ready routes",
    description:
      "Login and register experiences are wired to Better Auth client calls, with an App Router handler ready for the server side.",
    icon: ShieldCheck,
  },
  {
    title: "Clean data layer",
    description:
      "MongoDB, Mongoose, and TanStack Query utilities live in predictable folders so feature work stays organized.",
    icon: DatabaseZap,
  },
] as const;

const workflowPillars = [
  {
    title: "Backend utilities",
    description:
      "Auth wiring, MongoDB access, and Mongoose connection helpers live under one backend surface instead of leaking into pages.",
  },
  {
    title: "Schema-first growth",
    description:
      "A starter Mongoose schema is in place so product data has an obvious home as the app evolves.",
  },
  {
    title: "Query boundaries",
    description:
      "TanStack Query hooks and keys are split from components, making fetch logic reusable across dashboards and settings pages.",
  },
] as const;

const folderTree = [
  "app/",
  "  api/auth/[...all]/route.ts",
  "  dashboard/page.tsx",
  "  login/page.tsx",
  "  register/page.tsx",
  "  robots.ts",
  "  sitemap.ts",
  "  opengraph-image.tsx",
  "components/layout/",
  "components/auth/",
  "components/analytics/",
  "components/providers/",
  "lib/backend/auth/",
  "lib/backend/mongodb/",
  "lib/backend/mongoose/schemas/",
  "lib/seo/",
  "lib/tanstack/queries/",
] as const;

const heroStats = [
  { label: "UI shell", value: "Global header + footer" },
  { label: "Auth", value: "Better Auth route" },
  { label: "SEO", value: "OG + robots + sitemap" },
];

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: "en-US",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/#webpage"),
    url: absoluteUrl("/"),
    name: `${siteConfig.name} homepage`,
    description: siteConfig.description,
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
  },
];

export default function Home() {
  return (
    <div className="pb-24 pt-6 sm:pt-8 lg:pt-12">
      <JsonLd data={homeJsonLd} />
      <section className="section-shell grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-8">
          <div className="badge badge-outline badge-lg gap-2 rounded-full border-primary/30 bg-base-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            <Sparkles className="h-4 w-4" />
            Future project starter
          </div>

          <div className="space-y-5">
            <h1 className="text-balance font-display text-5xl font-semibold tracking-tight text-base-content sm:text-6xl lg:text-7xl">
              Ship the product idea, not the setup tax.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-base-content/72 sm:text-xl">
              {siteConfig.name} gives you a strong public shell, custom DaisyUI
              styling, auth entry points, and a clean data structure before the
              first real feature lands.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="btn btn-primary btn-lg rounded-full px-7 shadow-lg shadow-primary/20"
            >
              Create an account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="btn btn-ghost btn-lg rounded-full border border-base-300/70 bg-base-100/75 px-7"
            >
              Open login
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="glass-panel rounded-[1.5rem] border border-base-300/70 p-4 shadow-lg shadow-primary/5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
                  {stat.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-base-content">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl" />
          <div className="glass-panel relative overflow-hidden rounded-[2rem] border border-base-300/70 p-6 shadow-[0_30px_120px_-44px_color-mix(in_oklab,var(--color-primary)_45%,transparent)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
                  Starter preview
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-base-content">
                  A refined baseline for authenticated apps
                </h2>
              </div>
              <span className="badge badge-accent badge-outline rounded-full px-4 py-4 font-medium">
                Ready to fork
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-base-100/85 p-5 shadow-md shadow-primary/5 ring-1 ring-base-300/70">
                <p className="text-sm font-semibold text-base-content">Homepage shell</p>
                <p className="mt-2 text-sm leading-6 text-base-content/68">
                  Designed hero, feature grid, sticky navigation, and a footer
                  that holds up across future projects.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-base-100/85 p-5 shadow-md shadow-primary/5 ring-1 ring-base-300/70">
                <p className="text-sm font-semibold text-base-content">Auth surface</p>
                <p className="mt-2 text-sm leading-6 text-base-content/68">
                  Login and registration views are ready to point at Better Auth
                  with a MongoDB-backed route handler.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-neutral p-5 text-neutral-content shadow-xl shadow-neutral/15">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-content/55">
                Stack baked in
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {siteConfig.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-16 grid gap-5 lg:grid-cols-3">
        {featureCards.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="glass-panel rounded-[1.75rem] border border-base-300/70 p-6 shadow-lg shadow-primary/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-base-content">
              {title}
            </h2>
            <p className="mt-3 leading-7 text-base-content/70">{description}</p>
          </article>
        ))}
      </section>

      <section className="section-shell mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="glass-panel rounded-[2rem] border border-base-300/70 p-7 shadow-lg shadow-primary/5">
          <div className="badge badge-outline rounded-full border-secondary/30 bg-base-100/70 px-4 py-4 text-xs uppercase tracking-[0.22em] text-secondary">
            <Workflow className="mr-2 h-4 w-4" />
            How it is organized
          </div>
          <h2 className="mt-5 text-balance font-display text-4xl font-semibold tracking-tight text-base-content">
            The app structure should stay obvious when the codebase grows.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-base-content/72">
            The template separates view components, backend utilities, Mongoose
            schemas, and TanStack Query hooks so future features have a clear
            home instead of piling into pages.
          </p>

          <div className="mt-8 space-y-4">
            {workflowPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-[1.4rem] border border-base-300/70 bg-base-100/70 p-5"
              >
                <h3 className="text-lg font-semibold text-base-content">
                  {pillar.title}
                </h3>
                <p className="mt-2 leading-7 text-base-content/68">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] border border-base-300/70 p-7 shadow-lg shadow-primary/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
                Structure snapshot
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
                Template folders added now
              </h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Blocks className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-neutral p-5 text-sm text-neutral-content shadow-xl shadow-neutral/15">
            <div className="space-y-2 font-mono">
              {folderTree.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-secondary rounded-full px-6">
              Start with register
            </Link>
            <Link href="/dashboard" className="btn btn-accent rounded-full px-6">
              Open dashboard
            </Link>
            <Link href="/login" className="btn btn-outline rounded-full px-6">
              Review login flow
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
