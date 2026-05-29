import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Newspaper,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { MoverList } from "@/components/stocks/mover-list";
import { JsonLd } from "@/components/seo/json-ld";
import { getHomePageMarketData } from "@/lib/backend/stocks/yahoo";
import { siteConfig } from "@/lib/config/site";
import { formatDateTime } from "@/lib/stocks/format";
import { absoluteUrl, createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Market Dashboard",
  description:
    "Browse top gainers, top losers, and current stock news before saving names to your personal TapeDeck wishlist.",
  path: "/",
  keywords: [
    ...siteConfig.keywords,
    "top gainers",
    "top losers",
    "stock market news",
  ],
});

const productHighlights = [
  "Public homepage for daily movers and headlines",
  "Authenticated Mongo-backed stock wishlist",
  "Single-stock pages with price charts and recent news",
] as const;

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
    name: `${siteConfig.name} market dashboard`,
    description: siteConfig.description,
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
  },
];

export default async function Home() {
  const { gainers, losers, featuredNews } = await getHomePageMarketData();

  return (
    <div className="pb-24 pt-6 sm:pt-8 lg:pt-12">
      <JsonLd data={homeJsonLd} />

      <section className="section-shell grid gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
        <div className="space-y-8">
          <div className="badge badge-outline badge-lg gap-2 rounded-full border-primary/30 bg-base-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            <Sparkles className="h-4 w-4" />
            Market watchlist workspace
          </div>

          <div className="space-y-5">
            <h1 className="text-balance font-display text-5xl font-semibold tracking-tight text-base-content sm:text-6xl lg:text-7xl">
              Track the tape, then save what matters.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-base-content/72 sm:text-xl">
              Start with the day&apos;s biggest movers, open a stock page for
              the chart and the news, then move the names you care about into
              your personal wishlist.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="btn btn-primary btn-lg rounded-full px-7 shadow-lg shadow-primary/20"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="btn btn-ghost btn-lg rounded-full border border-base-300/70 bg-base-100/75 px-7"
            >
              Open wishlist
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel rounded-xl border border-base-300/70 p-4 shadow-lg shadow-primary/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
                Gainers loaded
              </p>
              <p className="mt-2 text-lg font-semibold text-base-content">
                {gainers.length}
              </p>
            </div>
            <div className="glass-panel rounded-xl border border-base-300/70 p-4 shadow-lg shadow-primary/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
                Losers loaded
              </p>
              <p className="mt-2 text-lg font-semibold text-base-content">
                {losers.length}
              </p>
            </div>
            <div className="glass-panel rounded-xl border border-base-300/70 p-4 shadow-lg shadow-primary/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
                News stories
              </p>
              <p className="mt-2 text-lg font-semibold text-base-content">
                {featuredNews.length}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-4xl bg-linear-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl" />
          <div className="glass-panel relative overflow-hidden rounded-4xl border border-base-300/70 p-6 shadow-[0_30px_120px_-44px_color-mix(in_oklab,var(--color-primary)_45%,transparent)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
                  Built for this stack
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-base-content">
                  Use the template, but ship the stock product.
                </h2>
              </div>
              <span className="badge badge-accent badge-outline rounded-full inline-flex items-center px-4 py-2 font-medium leading-none whitespace-nowrap">
                Auth + data ready
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {productHighlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-3xl border border-base-300/70 bg-base-100/80 p-5"
                >
                  <p className="text-sm leading-6 text-base-content/72">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-neutral p-5 text-neutral-content shadow-xl shadow-neutral/15">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-content/55">
                Stack from package.json
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

      {/* <section className="section-shell mt-16 grid gap-5 lg:grid-cols-3">
        <article className="glass-panel rounded-[1.75rem] border border-base-300/70 p-6 shadow-lg shadow-primary/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold text-base-content">
            Daily movers
          </h2>
          <p className="mt-3 leading-7 text-base-content/70">
            Open the session with a clean read on who is ripping higher and who
            is under pressure.
          </p>
        </article>
        <article className="glass-panel rounded-[1.75rem] border border-base-300/70 p-6 shadow-lg shadow-primary/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold text-base-content">
            Personal wishlist
          </h2>
          <p className="mt-3 leading-7 text-base-content/70">
            Sign in, save tickers to MongoDB, and come back to the same set of
            names across sessions.
          </p>
        </article>
        <article className="glass-panel rounded-[1.75rem] border border-base-300/70 p-6 shadow-lg shadow-primary/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/14 text-accent">
            <Newspaper className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold text-base-content">
            Context with news
          </h2>
          <p className="mt-3 leading-7 text-base-content/70">
            Each stock detail page pairs price action with the latest Yahoo
            Finance headlines.
          </p>
        </article>
      </section> */}

      <section
        id="movers"
        className="section-shell mt-16 grid gap-8 lg:grid-cols-2"
      >
        <MoverList
          eyebrow="Market board"
          title="Top gainers"
          icon={<TrendingUp className="h-5 w-5" />}
          iconClassName="bg-success/12 text-success"
          stocks={gainers}
          emptyMessage="Yahoo Finance did not return gainers right now."
        />

        <MoverList
          eyebrow="Market board"
          title="Top losers"
          icon={<TrendingDown className="h-5 w-5" />}
          iconClassName="bg-error/12 text-error"
          stocks={losers}
          emptyMessage="Yahoo Finance did not return losers right now."
        />
      </section>

      <section id="news" className="section-shell mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
              Market context
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-base-content">
              Top stock articles
            </h2>
          </div>
          <Link href="/register" className="btn btn-outline rounded-full px-6">
            Create account to save tickers
          </Link>
        </div>

        {featuredNews.length === 0 ? (
          <div className="mt-6 rounded-4xl border border-dashed border-base-300/80 bg-base-100/70 p-8 text-base-content/58">
            Yahoo Finance did not return market-wide stock news right now.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            {featuredNews.map((article) => {
              const primaryTicker = article.relatedTickers[0];
              const cardStyle = article.thumbnailUrl
                ? {
                    backgroundImage: [
                      "linear-gradient(180deg, rgba(15, 23, 42, 0.12) 0%, rgba(15, 23, 42, 0.72) 100%)",
                      `url(${article.thumbnailUrl})`,
                    ].join(", "),
                  }
                : {
                    backgroundImage:
                      "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 24%, transparent) 0%, color-mix(in oklab, var(--color-secondary) 24%, transparent) 100%)",
                  };
              return (
                <article
                  key={article.id}
                  className="group relative overflow-hidden rounded-4xl border border-base-300/70 bg-neutral text-neutral-content shadow-lg shadow-primary/5"
                  style={cardStyle}
                >
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 z-10"
                    aria-label={`Open article: ${article.title}`}
                  />

                  <div className="pointer-events-none relative z-20 flex min-h-88 flex-col justify-between bg-linear-to-t from-neutral/92 via-neutral/38 to-neutral/8 p-6">
                    <div className="flex items-start justify-between gap-3 text-xs uppercase tracking-[0.22em] text-neutral-content/72">
                      <span className="rounded-full bg-neutral/45 px-3 py-1.5 backdrop-blur-sm">
                        {article.publisher}
                      </span>
                      {primaryTicker ? (
                        <span className="rounded-full bg-neutral/45 px-3 py-1.5 backdrop-blur-sm">
                          {primaryTicker}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      {primaryTicker ? (
                        <div className="flex justify-end">
                          <Link
                            href={`/stocks/${primaryTicker}`}
                            className="pointer-events-auto btn btn-ghost btn-sm relative z-30 rounded-full border border-neutral-content/22 bg-neutral/38 px-5 text-neutral-content backdrop-blur-sm hover:border-neutral-content/36 hover:bg-neutral/50"
                          >
                            View {primaryTicker}
                          </Link>
                        </div>
                      ) : null}

                      <div className="max-w-xl rounded-3xl bg-neutral/68 p-5 backdrop-blur-sm">
                        <h3 className="text-2xl font-semibold leading-8 text-neutral-content">
                          {article.title}
                        </h3>

                        <p className="mt-3 text-sm text-neutral-content/72">
                          Published {formatDateTime(article.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
