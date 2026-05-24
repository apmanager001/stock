"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Orbit, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/lib/config/site";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="section-shell pt-4">
        <div className="rounded-[2rem] border border-base-300/60 bg-base-100/80 shadow-[0_18px_80px_-36px_color-mix(in_oklab,var(--color-neutral)_40%,transparent)] backdrop-blur">
          <div className="navbar gap-3 px-4 sm:px-6">
            <div className="flex-1">
              <Link href="/" className="group flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/20">
                  <Orbit className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold tracking-tight text-base-content">
                    {siteConfig.name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.24em] text-base-content/45">
                    Next + Auth + Data
                  </p>
                </div>
              </Link>
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {siteConfig.nav.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-content"
                        : "text-base-content/68 hover:bg-base-200 hover:text-base-content",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <div className="hidden items-center gap-2 rounded-full border border-base-300/60 bg-base-100/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-base-content/50 xl:flex">
                <Sparkles className="h-4 w-4 text-accent-content" />
                Template ready
              </div>
              <Link href="/login" className="btn btn-ghost btn-sm rounded-full px-5">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm rounded-full px-5">
                Register
              </Link>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-circle md:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isMenuOpen ? (
            <div className="border-t border-base-300/60 px-4 pb-4 pt-3 md:hidden">
              <div className="flex flex-col gap-2">
                {siteConfig.nav.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={[
                        "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-content"
                          : "bg-base-100/80 text-base-content/72 hover:bg-base-200",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-base-300/60 pt-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link
                    href="/login"
                    className="btn btn-ghost rounded-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="btn btn-primary rounded-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}