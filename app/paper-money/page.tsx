import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownUp,
  Coins,
  LineChart,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import {
  resetPaperPortfolioAction,
} from "@/app/paper-money/actions";
import { PaperPortfolioChart } from "@/components/paper-money/paper-portfolio-chart";
import { PaperTradeTicket } from "@/components/paper-money/paper-trade-ticket";
import { requireServerSession } from "@/lib/backend/auth/session";
import { getUserPaperPortfolio } from "@/lib/backend/stocks/paper-portfolio";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  formatCurrency,
  formatDateTime,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/stocks/format";

export const metadata: Metadata = createPageMetadata({
  title: "Paper Money",
  description:
    "Practice with a $1,000 paper portfolio, place simulated trades, and track your equity curve over time.",
  path: "/paper-money",
  noIndex: true,
});

type PaperMoneyPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statusMessages: Record<string, (symbol?: string) => string> = {
  bought: (symbol) => `${symbol ?? "Stock"} was added to your paper portfolio.`,
  sold: (symbol) => `${symbol ?? "Stock"} was sold from your paper portfolio.`,
  reset: () => "Your paper portfolio was reset to $1,000 in cash.",
  "invalid-symbol": () => "Choose a stock before placing a trade.",
  "invalid-shares": () => "Enter a share amount greater than zero.",
  "stock-not-found": (symbol) =>
    `Could not resolve ${symbol ?? "that symbol"} against Yahoo Finance.`,
  "quote-unavailable": (symbol) =>
    `Live pricing for ${symbol ?? "that stock"} is unavailable right now.`,
  "insufficient-funds": (symbol) =>
    `You do not have enough cash to buy ${symbol ?? "that stock"}.`,
  "insufficient-shares": (symbol) =>
    `You do not own enough shares of ${symbol ?? "that stock"} to sell.`,
};

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];

  return typeof value === "string" ? value : undefined;
}

function formatShares(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export default async function PaperMoneyPage({
  searchParams,
}: PaperMoneyPageProps) {
  const params = (await searchParams) ?? {};
  const session = await requireServerSession();
  const firstName = session.user.name?.split(" ")[0] ?? session.user.email;
  const portfolio = await getUserPaperPortfolio(session.user.id);
  const status = getSearchParam(params, "status");
  const symbol = getSearchParam(params, "symbol")?.toUpperCase();
  const statusMessage = status
    ? (statusMessages[status]?.(symbol) ?? null)
    : null;

  return (
    <section className="section-shell py-8 lg:py-14">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="badge badge-outline gap-2 rounded-full border-primary/30 bg-base-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              <Coins className="h-4 w-4" />
              Paper money portfolio
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
                Make trades without risking cash.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-base-content/68 sm:text-lg">
                {firstName}, you start with{" "}
                {formatCurrency(portfolio.summary.startingCash)} in buying
                power. Search any stock, buy or sell fractional shares, and
                watch your simulated equity curve evolve.
              </p>
            </div>
          </div>
        </div>

        {statusMessage ? (
          <div className="alert alert-info rounded-2xl text-sm">
            {statusMessage}
          </div>
        ) : null}

        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <article className="glass-panel rounded-3xl border border-base-300/70 p-5 shadow-lg shadow-primary/5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                  Buying power
                </p>
                <p className="mt-2 text-2xl font-semibold text-base-content">
                  {formatCurrency(portfolio.summary.cashBalance)}
                </p>
              </div>
            </div>
          </article>

          <article className="glass-panel rounded-3xl border border-base-300/70 p-5 shadow-lg shadow-primary/5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                  Total equity
                </p>
                <p className="mt-2 text-2xl font-semibold text-base-content">
                  {formatCurrency(portfolio.summary.totalEquity)}
                </p>
              </div>
            </div>
          </article>

          <article className="glass-panel rounded-3xl border border-base-300/70 p-5 shadow-lg shadow-primary/5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/14 text-accent">
                <ArrowDownUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                  Invested value
                </p>
                <p className="mt-2 text-2xl font-semibold text-base-content">
                  {formatCurrency(portfolio.summary.investedValue)}
                </p>
              </div>
            </div>
          </article>

          <article className="glass-panel rounded-3xl border border-base-300/70 p-5 shadow-lg shadow-primary/5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/12 text-success">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                  Total return
                </p>
                <p className="mt-2 text-2xl font-semibold text-base-content">
                  {formatSignedCurrency(portfolio.summary.totalReturn)}
                </p>
                <p className="mt-1 text-xs text-base-content/58">
                  {formatPercent(portfolio.summary.totalReturnPercent)}
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.95fr)] xl:items-start">
          <div className="space-y-6 min-w-0">
            <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                    Portfolio chart
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
                    Equity over time
                  </h2>
                </div>
                <div className="text-right text-sm text-base-content/58">
                  <p>Open positions {portfolio.holdings.length}</p>
                  <p className="mt-1">Trades {portfolio.transactions.length}</p>
                </div>
              </div>
              <form action={resetPaperPortfolioAction} className='flex justify-end'>
                <button
                  type="submit"
                  className="btn btn-outline btn-xs rounded-full w-32 text-error hover:border-error/40 hover:bg-error/10"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset portfolio
                </button>
              </form>
              <div className="mt-4">
                <PaperPortfolioChart
                  points={portfolio.chartPoints}
                  positive={portfolio.summary.totalReturn >= 0}
                />
              </div>
            </div>

            <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                    Open positions
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
                    Holdings
                  </h2>
                </div>
              </div>
              {portfolio.holdings.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-base-300/80 bg-base-100/70 p-8 text-sm leading-7 text-base-content/58">
                  No open positions yet. Use the trade ticket to buy your first
                  stock.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {portfolio.holdings.map((holding) => (
                    <article
                      key={holding.symbol}
                      className="rounded-[1.6rem] border border-base-300/70 bg-base-100/80 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-lg font-semibold text-base-content">
                            {holding.symbol}
                          </p>
                          <p className="mt-1 truncate text-sm text-base-content/58">
                            {holding.name}
                          </p>
                        </div>
                        <div
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                            holding.unrealizedGain >= 0
                              ? "bg-success/12 text-success"
                              : "bg-error/12 text-error",
                          ].join(" ")}
                        >
                          {holding.unrealizedGain >= 0 ? "Winning" : "Pullback"}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                            Shares
                          </p>
                          <p className="mt-2 font-semibold text-base-content">
                            {formatShares(holding.shares)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                            Avg. cost
                          </p>
                          <p className="mt-2 font-semibold text-base-content">
                            {formatCurrency(holding.averageCost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                            Last price
                          </p>
                          <p className="mt-2 font-semibold text-base-content">
                            {formatCurrency(holding.currentPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-base-content/42">
                            Market value
                          </p>
                          <p className="mt-2 font-semibold text-base-content">
                            {formatCurrency(holding.marketValue)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-base-300/60 pt-4 text-sm">
                        <span className="text-base-content/58">
                          Unrealized P/L
                        </span>
                        <span
                          className={
                            holding.unrealizedGain >= 0
                              ? "text-success"
                              : "text-error"
                          }
                        >
                          {formatSignedCurrency(holding.unrealizedGain)} ·{" "}
                          {formatPercent(holding.unrealizedGainPercent)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6 min-w-0">
            <PaperTradeTicket
              cashBalance={portfolio.summary.cashBalance}
              startingCash={portfolio.summary.startingCash}
            />

            <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                  Activity
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
                  Recent trades
                </h2>
              </div>

              {portfolio.transactions.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-base-300/80 bg-base-100/70 p-6 text-sm leading-7 text-base-content/58">
                  Your trade history will appear here once you start buying and
                  selling.
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {portfolio.transactions.slice(0, 8).map((trade) => (
                    <article
                      key={`${trade.symbol}-${trade.executedAt ?? "trade"}-${trade.side}`}
                      className="rounded-[1.4rem] border border-base-300/70 bg-base-100/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-base-content">
                            {trade.side === "BUY" ? "Bought" : "Sold"}{" "}
                            {trade.symbol}
                          </p>
                          <p className="mt-1 text-sm text-base-content/58">
                            {trade.name}
                          </p>
                        </div>
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                            trade.side === "BUY"
                              ? "bg-primary/12 text-primary"
                              : "bg-secondary/12 text-secondary",
                          ].join(" ")}
                        >
                          {trade.side}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span className="text-base-content/62">
                          {formatShares(trade.shares)} shares at{" "}
                          {formatCurrency(trade.price)}
                        </span>
                        <span className="font-semibold text-base-content">
                          {formatCurrency(trade.total)}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-base-content/48">
                        {formatDateTime(trade.executedAt)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
