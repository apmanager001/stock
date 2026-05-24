import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-base-300/60 bg-base-100/70">
      <div className="section-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight text-base-content">
              {siteConfig.name}
            </p>
            <p className="mt-3 max-w-xl leading-7 text-base-content/68">
              A reusable starting point for polished authenticated apps with
              Next.js, Better Auth, TanStack Query, and MongoDB.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/45">
                Navigation
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-base-content/72">
                {siteConfig.footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/45">
                Included stack
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {siteConfig.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-base-300/70 bg-base-100/80 px-3 py-2 text-sm text-base-content/72"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-base-300/60 pt-6 text-sm text-base-content/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {year} {siteConfig.name}. Built to be forked and extended.
          </p>
          <p>
            Homepage, auth routes, Mongo utilities, and query hooks included.
          </p>
        </div>
      </div>
    </footer>
  );
}
