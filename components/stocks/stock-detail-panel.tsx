import Link from "next/link";
import {
  CircleHelp,
  Moon,
  MoonStar,
  Newspaper,
  Sunrise,
  Sun,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PriceChart } from "@/components/stocks/price-chart";
import {
  stockChartRanges,
  type StockChartRange,
  type StockDetail,
} from "@/lib/stocks/models";
import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/stocks/format";

type StockDetailPanelProps = {
  stock: StockDetail;
  rangeHrefBase?: string;
  headerAction?: React.ReactNode;
  onRangeChange?: (range: StockChartRange) => void;
  isLoading?: boolean;
};

type Metric = {
  label: string;
  value: string;
};

type MarketStateBadgeConfig = {
  label: string;
  tooltip: string;
  icon: LucideIcon;
};

const marketStateBadgeConfigs: Record<string, MarketStateBadgeConfig> = {
  REGULAR: {
    label: "Regular",
    tooltip: "Market is open for regular trading hours.",
    icon: Sun,
  },
  OPEN: {
    label: "Regular",
    tooltip: "Market is open for regular trading hours.",
    icon: Sun,
  },
  PRE: {
    label: "Pre market",
    tooltip: "Market is in pre-market trading.",
    icon: Sunrise,
  },
  PREPRE: {
    label: "Pre market",
    tooltip: "Market is in pre-market trading.",
    icon: Sunrise,
  },
  POST: {
    label: "Post market",
    tooltip: "Market is in after-hours trading.",
    icon: MoonStar,
  },
  POSTPOST: {
    label: "Post market",
    tooltip: "Market is in after-hours trading.",
    icon: MoonStar,
  },
  CLOSED: {
    label: "Closed",
    tooltip: "Market is closed right now.",
    icon: Moon,
  },
  CLOSE: {
    label: "Closed",
    tooltip: "Market is closed right now.",
    icon: Moon,
  },
};

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

function getMarketStateBadgeConfig(
  marketState: string | null | undefined,
): MarketStateBadgeConfig {
  const normalizedState = marketState?.trim().toUpperCase();

  if (normalizedState && marketStateBadgeConfigs[normalizedState]) {
    return marketStateBadgeConfigs[normalizedState];
  }

  if (normalizedState) {
    const label = toTitleCase(
      normalizedState.toLowerCase().replace(/[_-]+/g, " "),
    );

    return {
      label,
      tooltip: `Market session is reported as ${label.toLowerCase()}.`,
      icon: CircleHelp,
    };
  }

  return {
    label: "Market data",
    tooltip: "Current market session is unavailable.",
    icon: CircleHelp,
  };
}

function buildRangeHref(base: string, range: string) {
  return `${base}${base.includes("?") ? "&" : "?"}range=${range}`;
}

export function StockDetailPanel({
  stock,
  rangeHrefBase,
  headerAction,
  onRangeChange,
  isLoading = false,
}: StockDetailPanelProps) {
  const marketStateBadge = getMarketStateBadgeConfig(stock.marketState);
  const MarketStateIcon = marketStateBadge.icon;
  const metrics: Metric[] = [
    {
      label: "Previous close",
      value: formatCurrency(stock.previousClose, stock.currency ?? "USD"),
    },
    {
      label: "Open",
      value: formatCurrency(stock.open, stock.currency ?? "USD"),
    },
    {
      label: "Day range",
      value: `${formatCurrency(stock.dayLow, stock.currency ?? "USD")} - ${formatCurrency(stock.dayHigh, stock.currency ?? "USD")}`,
    },
    {
      label: "52 week range",
      value: `${formatCurrency(stock.fiftyTwoWeekLow, stock.currency ?? "USD")} - ${formatCurrency(stock.fiftyTwoWeekHigh, stock.currency ?? "USD")}`,
    },
    {
      label: "Volume",
      value: formatCompactNumber(stock.volume),
    },
    {
      label: "Avg. volume",
      value: formatCompactNumber(stock.averageVolume),
    },
    {
      label: "Market cap",
      value: formatCompactNumber(stock.marketCap),
    },
    {
      label: "Trailing P/E",
      value:
        typeof stock.trailingPE === "number"
          ? stock.trailingPE.toFixed(2)
          : "--",
    },
    {
      label: "Forward P/E",
      value:
        typeof stock.forwardPE === "number" ? stock.forwardPE.toFixed(2) : "--",
    },
  ];

  const stockDivHighLow = [
    {
      id: "dividend-yield",
      label: "Dividend yield",
      value:
        typeof stock.dividendYield === "number" && stock.dividendYield > 0
          ? `${stock.dividendYield.toFixed(2)}%`
          : "N/A",
    },
    {
      id: "week-low",
      label: "52 week low",
      value: formatCurrency(stock.fiftyTwoWeekLow, stock.currency ?? "USD"),
    },
    {
      id: "week-high",
      label: "52 week high",
      value: formatCurrency(stock.fiftyTwoWeekHigh, stock.currency ?? "USD"),
    },
  ];

  return (
    <div className="min-w-0 space-y-8">
      <div className="glass-panel min-w-0 rounded-4xl border border-base-300/70 p-8 shadow-lg shadow-primary/5 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
              {stock.symbol}
            </p>
            <h1 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-base-content sm:text-5xl lg:text-6xl">
              {stock.name}
            </h1>
            <p className="mt-3 text-base-content/62">{stock.exchange}</p>

            <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-3 lg:hidden">
              <div>
                <p className="text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
                  {formatCurrency(stock.price, stock.currency ?? "USD")}
                </p>
                <p
                  className={`mt-3 text-sm font-medium ${
                    (stock.changePercent ?? 0) >= 0
                      ? "text-success"
                      : "text-error"
                  }`}
                >
                  {formatSignedCurrency(stock.change, stock.currency ?? "USD")}{" "}
                  · {formatPercent(stock.changePercent)}
                </p>
              </div>

              <div className="rounded-full border border-base-300/70 bg-base-100/80 px-4 py-3 text-sm text-base-content/62">
                Updated {formatDateTime(stock.updatedAt)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-md lg:grid-cols-1 lg:justify-self-end">
            <div className="hidden rounded-3xl border border-base-300/70 bg-base-100/80 p-5 lg:block">
              <div className="flex justify-between items-center gap-2">
                <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                  Current price
                </p>
                <div
                  className="tooltip tooltip-left tooltip-secondary inline-flex cursor-help"
                  data-tip={marketStateBadge.tooltip}
                  tabIndex={0}
                  aria-label={marketStateBadge.tooltip}
                >
                  <div className="gap-2 rounded-full text-xs uppercase tracking-[0.24em] text-secondary">
                    <MarketStateIcon className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
                {formatCurrency(stock.price, stock.currency ?? "USD")}
              </p>
              <p
                className={`mt-3 text-sm font-medium ${
                  (stock.changePercent ?? 0) >= 0
                    ? "text-success"
                    : "text-error"
                }`}
              >
                {formatSignedCurrency(stock.change, stock.currency ?? "USD")} ·{" "}
                {formatPercent(stock.changePercent)}
              </p>
              <p className="mt-4 text-sm text-base-content/62">
                Updated {formatDateTime(stock.updatedAt)}
              </p>
            </div>
            <div className="sm:mt-2 flex flex-col justify-center gap-6">
              {headerAction}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center md:justify-end gap-2 md:gap-4 w-full mt-2">
          {stockDivHighLow.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-base-300/70 bg-base-100/80 max-w-28 md:max-w-none p-2 md:p-5"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                {item.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-base-content">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-6">
          <div className="glass-panel min-w-0 rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                  Price chart
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
                  Trend view
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(stockChartRanges).map(([key, config]) => {
                  const range = key as StockChartRange;
                  const className = [
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    key === stock.chartRange
                      ? "bg-primary text-primary-content"
                      : "border border-base-300/70 bg-base-100/80 text-base-content/68 hover:border-primary/35 hover:text-base-content",
                  ].join(" ");

                  if (onRangeChange) {
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onRangeChange(range)}
                        className={`${className} cursor-pointer`}
                        disabled={isLoading && key !== stock.chartRange}
                      >
                        {config.label}
                      </button>
                    );
                  }

                  if (!rangeHrefBase) {
                    return null;
                  }

                  return (
                    <Link
                      key={key}
                      href={buildRangeHref(rangeHrefBase, key)}
                      className={className}
                    >
                      {config.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <PriceChart
                symbol={stock.symbol}
                currency={stock.currency ?? "USD"}
                points={stock.chartPoints}
                positive={(stock.changePercent ?? 0) >= 0}
              />
            </div>
          </div>

          <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-3xl font-semibold text-base-content">
                Key metrics
              </h2>
            </div>

            <div className="mt-6 grid gap-4 grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-[1.4rem] border border-base-300/70 bg-base-100/80 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-xl font-semibold text-base-content">
                    {metric.value}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-secondary" />
              <h2 className="font-display text-3xl font-semibold text-base-content">
                Recent news
              </h2>
            </div>

            {stock.news.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-base-300/80 bg-base-100/70 p-6 text-sm leading-7 text-base-content/58">
                Yahoo Finance did not return recent articles for this symbol.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {stock.news.slice(0, 6).map((article) => {
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

                      <div className="pointer-events-none relative z-20 flex min-h-24 flex-col justify-between bg-linear-to-t from-neutral/92 via-neutral/38 to-neutral/8 p-4 gap-4 sm:p-5">
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

                        <div className="max-w-xl rounded-3xl bg-neutral/68 p-3.5 backdrop-blur-sm sm:p-4">
                          <h3 className="text-base font-semibold leading-6 text-neutral-content sm:text-lg sm:leading-7">
                            {article.title}
                          </h3>

                          <p className="mt-2 text-xs text-neutral-content/72 sm:text-sm">
                            Published {formatDateTime(article.publishedAt)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
