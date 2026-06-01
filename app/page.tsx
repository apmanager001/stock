import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Trophy,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { MoverList } from "@/components/stocks/mover-list";
import { NewsArticleCard } from "@/components/stocks/news-article-card";
import { MoverSlider } from "@/components/stocks/mover-slider";
import { JsonLd } from "@/components/seo/json-ld";
import { getPaperPortfolioLeaderboard } from "@/lib/backend/stocks/paper-portfolio";
import { getHomePageMarketData } from "@/lib/backend/stocks/yahoo";
import { siteConfig } from "@/lib/config/site";
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/stocks/format";
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
  const [{ gainers, losers, topCompanies, featuredNews }, leaderboard] =
    await Promise.all([
      getHomePageMarketData(),
      getPaperPortfolioLeaderboard(),
    ]);
  const moverSections = [
    {
      id: "gainers",
      label: "Top gainers",
      eyebrow: "Market board",
      title: "Top gainers",
      icon: <TrendingUp className="h-5 w-5" />,
      iconClassName: "bg-success/12 text-success",
      stocks: gainers,
      emptyMessage: "Yahoo Finance did not return gainers right now.",
    },
    {
      id: "losers",
      label: "Top losers",
      eyebrow: "Market board",
      title: "Top losers",
      icon: <TrendingDown className="h-5 w-5" />,
      iconClassName: "bg-error/12 text-error",
      stocks: losers,
      emptyMessage: "Yahoo Finance did not return losers right now.",
    },
    {
      id: "top-companies",
      label: "Top companies",
      eyebrow: "Admin picks",
      title: "Top companies",
      icon: <Building2 className="h-5 w-5" />,
      iconClassName: "bg-secondary/12 text-secondary",
      itemLabel: "Track",
      stocks: topCompanies,
      emptyMessage: "No homepage companies are configured right now.",
    },
  ];

  return (
    <div className="pb-24 pt-6 sm:pt-8 lg:pt-12">
      <JsonLd data={homeJsonLd} />
      <section id="movers" className="section-shell mb-4">
        <MoverSlider
          tabs={moverSections.map((section) => ({
            id: section.id,
            label: section.label,
          }))}
        >
          {moverSections.map((section) => (
            <MoverList
              key={section.id}
              eyebrow={section.eyebrow}
              title={section.title}
              icon={section.icon}
              iconClassName={section.iconClassName}
              itemLabel={section.itemLabel}
              stocks={section.stocks}
              emptyMessage={section.emptyMessage}
            />
          ))}
        </MoverSlider>
      </section>
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
        </div>

        <div className="relative">
          <section className="section-shell mt-16 grid gap-5 lg:grid-cols-1">
            <article className="glass-panel rounded-[1.75rem] border border-base-300/70 p-6 shadow-lg shadow-primary/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold text-base-content">
                Daily movers
              </h2>
              <p className="mt-3 leading-7 text-base-content/70">
                Open the session with a clean read on who is ripping higher and
                who is under pressure.
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
                Sign in, save tickers to MongoDB, and come back to the same set
                of names across sessions.
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
          </section>
        </div>
      </section>

      <section id="paper-money-leaderboard" className="section-shell mt-16">
        <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
          <div className="border-b border-base-300/60 pb-8">
            <div className="badge badge-outline gap-2 rounded-full border-primary/30 bg-base-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              <Trophy className="h-4 w-4" />
              Paper money leaderboard
            </div>

            <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                    Live standings
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-semibold text-base-content">
                    Top paper portfolios right now
                  </h2>
                </div>

                <p className="max-w-3xl text-base leading-8 text-base-content/68 sm:text-lg">
                  Ranked by current portfolio equity, combining live pricing on
                  open positions with each trader&apos;s remaining cash balance.
                </p>
              </div>

              <div className="grid gap-3">
                <Link
                  href="/paper-money"
                  className="btn btn-primary rounded-full px-6 shadow-lg shadow-primary/20"
                >
                  Start your portfolio
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="btn btn-ghost rounded-full border border-base-300/70 bg-base-100/75 px-6"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {leaderboard.length === 0 ? (
              <div className="rounded-[1.6rem] border border-dashed border-base-300/80 bg-base-100/72 p-8 text-sm leading-7 text-base-content/58">
                No paper portfolios have been funded yet. Open the simulator to
                set the first benchmark.
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const rankClassName =
                    rank === 1
                      ? "border-warning/35 bg-warning/12 text-warning"
                      : rank === 2
                        ? "border-secondary/35 bg-secondary/12 text-secondary"
                        : rank === 3
                          ? "border-accent/35 bg-accent/14 text-accent"
                          : "border-base-300/70 bg-base-100/82 text-base-content/72";

                  return (
                    <article
                      key={entry.authUserId}
                      className="rounded-[1.6rem] border border-base-300/70 bg-base-100/78 p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={[
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold",
                              rankClassName,
                            ].join(" ")}
                          >
                            #{rank}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-base-content">
                              {entry.displayName}
                            </p>
                            <p className="mt-1 text-sm text-base-content/58">
                              {entry.holdingsCount === 0
                                ? "All cash"
                                : `${entry.holdingsCount} ${
                                    entry.holdingsCount === 1
                                      ? "position"
                                      : "positions"
                                  }`}{" "}
                              · {formatCurrency(entry.cashBalance)} cash
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                            Portfolio value
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-base-content">
                            {formatCurrency(entry.totalEquity)}
                          </p>
                          <p
                            className={[
                              "mt-1 text-sm",
                              entry.totalReturn >= 0
                                ? "text-success"
                                : "text-error",
                            ].join(" ")}
                          >
                            {formatSignedCurrency(entry.totalReturn)} ·{" "}
                            {formatPercent(entry.totalReturnPercent)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
            {featuredNews.map((article) => (
              <NewsArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
