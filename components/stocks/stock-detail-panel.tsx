import Link from "next/link";
import { ExternalLink, Newspaper, TrendingUp } from "lucide-react";
import { PriceChart } from "@/components/stocks/price-chart";
import { stockChartRanges, type StockDetail } from "@/lib/backend/stocks/yahoo";
import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/stocks/format";

type StockDetailPanelProps = {
  stock: StockDetail;
  rangeHrefBase: string;
  headerAction?: React.ReactNode;
};

type Metric = {
  label: string;
  value: string;
};

function buildRangeHref(base: string, range: string) {
  return `${base}${base.includes("?") ? "&" : "?"}range=${range}`;
}

export function StockDetailPanel({
  stock,
  rangeHrefBase,
  headerAction,
}: StockDetailPanelProps) {
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

  return (
    <div className="space-y-8">
      <div className="glass-panel rounded-4xl border border-base-300/70 p-8 shadow-lg shadow-primary/5 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>{headerAction}</div>
          <div className="badge badge-outline rounded-full border-secondary/30 bg-base-100/80 px-4 py-4 text-xs uppercase tracking-[0.24em] text-secondary">
            {stock.marketState ?? "Market data"}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
              {stock.symbol}
            </p>
            <h1 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-base-content sm:text-5xl lg:text-6xl">
              {stock.name}
            </h1>
            <p className="mt-3 text-base-content/62">{stock.exchange}</p>

            <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-3">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-base-300/70 bg-base-100/80 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                Dividend yield
              </p>
              <p className="mt-3 text-2xl font-semibold text-base-content">
                {typeof stock.dividendYield === "number"
                  ? `${(stock.dividendYield * 100).toFixed(2)}%`
                  : "--"}
              </p>
            </div>
            <div className="rounded-3xl border border-base-300/70 bg-base-100/80 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                52 week high
              </p>
              <p className="mt-3 text-2xl font-semibold text-base-content">
                {formatCurrency(
                  stock.fiftyTwoWeekHigh,
                  stock.currency ?? "USD",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                  Price chart
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
                  Trend view
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(stockChartRanges).map(([key, config]) => (
                  <Link
                    key={key}
                    href={buildRangeHref(rangeHrefBase, key)}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      key === stock.chartRange
                        ? "bg-primary text-primary-content"
                        : "border border-base-300/70 bg-base-100/80 text-base-content/68 hover:border-primary/35 hover:text-base-content",
                    ].join(" ")}
                  >
                    {config.label}
                  </Link>
                ))}
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                {stock.news.map((article) => (
                  <article
                    key={article.id}
                    className="rounded-3xl border border-base-300/70 bg-base-100/80 p-5"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                      {article.publisher}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-base-content">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm text-base-content/56">
                      Published {formatDateTime(article.publishedAt)}
                    </p>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      Open article
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </article>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
