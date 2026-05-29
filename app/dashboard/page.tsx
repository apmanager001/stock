import type { Metadata } from "next";
import Link from "next/link";
import {
  BellRing,
  CirclePlus,
  ExternalLink,
  Radar,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StockDetailPanel } from "@/components/stocks/stock-detail-panel";
import { StockSearchInput } from "@/components/stocks/stock-search-input";
import { StockSparkline } from "@/components/stocks/stock-sparkline";
import {
  addToWatchlistAction,
  removeFromWatchlistAction,
} from "@/app/dashboard/actions";
import { requireServerSession } from "@/lib/backend/auth/session";
import { getUserWatchlist } from "@/lib/backend/stocks/watchlist";
import {
  getStockCardsWithDayCharts,
  getStockDetail,
  StockNotFoundError,
  stockChartRanges,
  type StockChartRange,
  type StockListCard,
  type StockQuoteCard,
} from "@/lib/backend/stocks/yahoo";
import {
  formatCurrency,
  formatDateTime,
  formatPercent,
} from "@/lib/stocks/format";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Wishlist",
  description:
    "Manage your personal stock wishlist, save tickers to MongoDB, and jump into detailed quote pages.",
  path: "/dashboard",
  noIndex: true,
});

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statusMessages: Record<string, (symbol?: string) => string> = {
  added: (symbol) => `${symbol ?? "Stock"} was added to your wishlist.`,
  exists: (symbol) => `${symbol ?? "This stock"} is already on your wishlist.`,
  removed: (symbol) => `${symbol ?? "Stock"} was removed from your wishlist.`,
  "missing-symbol": () => "Enter a stock symbol to add it to your wishlist.",
  "stock-not-found": (symbol) =>
    `Could not resolve ${symbol ?? "that symbol"} against Yahoo Finance.`,
};

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];

  return typeof value === "string" ? value : undefined;
}

function buildFallbackCard(symbol: string, name: string): StockQuoteCard {
  return {
    symbol,
    name,
    exchange: null,
    currency: "USD",
    price: null,
    change: null,
    changePercent: null,
    volume: null,
    marketCap: null,
    marketState: null,
    updatedAt: null,
  };
}

function buildFallbackListCard(symbol: string, name: string): StockListCard {
  return {
    ...buildFallbackCard(symbol, name),
    dayChart: [],
  };
}

function parseRange(rawRange: string | undefined): StockChartRange {
  if (rawRange && rawRange in stockChartRanges) {
    return rawRange as StockChartRange;
  }

  return "3mo";
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const session = await requireServerSession();
  const watchlist = await getUserWatchlist(session.user.id);
  const cards = await getStockCardsWithDayCharts(
    watchlist.map((item) => item.symbol),
  );
  const cardLookup = new Map(cards.map((card) => [card.symbol, card]));
  const watchlistCards = watchlist.map(
    (item) =>
      cardLookup.get(item.symbol) ??
      buildFallbackListCard(item.symbol, item.name),
  );

  const topMover = [...watchlistCards].sort(
    (left, right) =>
      (right.changePercent ?? -Infinity) - (left.changePercent ?? -Infinity),
  )[0];
  const firstName = session.user.name?.split(" ")[0] ?? session.user.email;
  const status = getSearchParam(params, "status");
  const symbol = getSearchParam(params, "symbol");
  const selectedStockParam = getSearchParam(params, "stock")?.toUpperCase();
  const selectedRange = parseRange(getSearchParam(params, "range"));
  const statusMessage = status
    ? (statusMessages[status]?.(symbol) ?? null)
    : null;
  const selectedStockSymbol = watchlist.some(
    (item) => item.symbol === selectedStockParam,
  )
    ? selectedStockParam
    : watchlist[0]?.symbol;

  let selectedStockDetail = null;

  if (selectedStockSymbol) {
    try {
      selectedStockDetail = await getStockDetail(
        selectedStockSymbol,
        selectedRange,
      );
    } catch (error) {
      if (!(error instanceof StockNotFoundError)) {
        throw error;
      }
    }
  }

  return (
    <section className="section-shell py-8 lg:py-14">
      <div className="space-y-8">
        <div className="glass-panel rounded-4xl border border-base-300/70 p-8 shadow-lg shadow-primary/5 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="badge badge-outline rounded-full border-secondary/30 bg-base-100/80 px-4 py-4 text-xs uppercase tracking-[0.24em] text-secondary">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Wishlist synced to MongoDB
              </div>
              <h1 className="mt-5 text-balance font-display text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
                {firstName}, your market shortlist lives here.
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-base-content/70">
                Save stock symbols, keep an eye on their latest move, and drill
                into charts plus news without leaving the app shell.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col w-full">
              <SignOutButton />
              <Link href="/" className="btn btn-outline rounded-full px-6">
                Back to market home
              </Link>
            </div>
          </div>

          {statusMessage ? (
            <div className="alert alert-info mt-6 rounded-2xl text-sm">
              {statusMessage}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-base-300/70 bg-base-100/80 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <BellRing className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-base-content/42">
                Tracked names
              </p>
              <p className="mt-2 text-3xl font-semibold text-base-content">
                {watchlistCards.length}
              </p>
            </article>

            <article className="rounded-3xl border border-base-300/70 bg-base-100/80 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-base-content/42">
                Top mover today
              </p>
              <p className="mt-2 text-xl font-semibold text-base-content">
                {topMover ? topMover.symbol : "--"}
              </p>
              <p className="mt-1 text-sm text-base-content/62">
                {topMover
                  ? formatPercent(topMover.changePercent)
                  : "Add a stock to begin tracking."}
              </p>
            </article>

            <article className="rounded-3xl border border-base-300/70 bg-base-100/80 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/14 text-accent">
                <Radar className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-base-content/42">
                Last quote sync
              </p>
              <p className="mt-2 text-lg font-semibold text-base-content">
                {watchlistCards[0]
                  ? formatDateTime(watchlistCards[0].updatedAt)
                  : "--"}
              </p>
            </article>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
          <div className="glass-panel rounded-4xl border border-base-300/70 p-8 shadow-lg shadow-primary/5 sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <CirclePlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                  Saved wishlist
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-base-content">
                  Search and save
                </h2>
              </div>
            </div>

            <form
              action={addToWatchlistAction}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <div className="flex-1">
                <StockSearchInput name="symbol" />
              </div>
              <button
                type="submit"
                className="btn btn-primary h-13 rounded-full px-6 text-base sm:self-start"
              >
                Save
              </button>
            </form>

            <p className="mt-3 text-sm text-base-content/56">
              Start typing a ticker or company name, choose a suggestion, then
              save it to your wishlist.
            </p>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                  Stocks you are following
                </p>
                <p className="mt-2 text-sm text-base-content/58">
                  Click any row to open that stock in the detail panel.
                </p>
              </div>
              {selectedStockSymbol ? (
                <Link
                  href={`/stocks/${selectedStockSymbol}`}
                  className="btn btn-ghost btn-sm rounded-full px-4"
                >
                  Open full page
                  <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            {watchlistCards.length === 0 ? (
              <div className="mt-6 rounded-4xl border border-dashed border-base-300/80 bg-base-100/70 p-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-base-content/42">
                  No symbols saved yet
                </p>
                <h3 className="mt-4 font-display text-3xl font-semibold text-base-content">
                  Start with a ticker you already know.
                </h3>
                <p className="mx-auto mt-4 max-w-xl leading-7 text-base-content/64">
                  Try adding AAPL, MSFT, NVDA, or TSLA. Once a stock is on your
                  list, it opens on the right with charts, metrics, and news.
                </p>
              </div>
            ) : (
              <div className="mt-6 glass-panel overflow-hidden rounded-4xl border border-base-300/70 shadow-lg shadow-primary/5">
                <div className="grid grid-cols-[minmax(0,1fr)_5rem_5.5rem_auto] gap-4 border-b border-base-300/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42 sm:grid-cols-[minmax(0,1fr)_7rem_6rem_auto] sm:px-5">
                  <span>Name</span>
                  <span className="text-center">Day</span>
                  <span className="text-right">Move</span>
                  <span className="text-right">Manage</span>
                </div>

                <div className="divide-y divide-base-300/60 bg-base-100/70">
                  {watchlist.map((item) => {
                    const stock =
                      cardLookup.get(item.symbol) ??
                      buildFallbackListCard(item.symbol, item.name);
                    const isSelected = stock.symbol === selectedStockSymbol;
                    const isPositive = (stock.changePercent ?? 0) >= 0;

                    return (
                      <div
                        key={item.symbol}
                        className={[
                          "flex items-center gap-3 px-4 py-4 sm:px-5",
                          isSelected ? "bg-primary/8" : "hover:bg-base-100/85",
                        ].join(" ")}
                      >
                        <Link
                          href={`/dashboard?stock=${stock.symbol}`}
                          className="flex min-w-0 flex-1 items-center gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-base font-semibold text-base-content sm:text-lg">
                                {stock.symbol}
                              </p>
                              {isSelected ? (
                                <span className="rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                                  Selected
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 truncate text-sm text-base-content/58">
                              {stock.name}
                            </p>
                            <p className="mt-1 text-xs text-base-content/44">
                              Added {formatDateTime(item.addedAt)}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <StockSparkline
                              symbol={stock.symbol}
                              points={stock.dayChart}
                              positive={isPositive}
                            />
                          </div>

                          <div className="w-24 shrink-0 text-right">
                            <p className="text-sm font-semibold text-base-content sm:text-base">
                              {formatCurrency(
                                stock.price,
                                stock.currency ?? "USD",
                              )}
                            </p>
                            <p
                              className={`mt-1 text-xs font-semibold sm:text-sm ${
                                isPositive ? "text-success" : "text-error"
                              }`}
                            >
                              {formatPercent(stock.changePercent)}
                            </p>
                          </div>
                        </Link>

                        <form
                          action={removeFromWatchlistAction}
                          className="shrink-0"
                        >
                          <input
                            type="hidden"
                            name="symbol"
                            value={item.symbol}
                          />
                          <button
                            type="submit"
                            className="btn btn-ghost btn-sm rounded-full px-4"
                          >
                            Remove
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {selectedStockDetail ? (
              <StockDetailPanel
                stock={selectedStockDetail}
                rangeHrefBase={`/dashboard?stock=${selectedStockDetail.symbol}`}
                headerAction={
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="badge badge-outline rounded-full border-primary/30 bg-base-100/80 px-4 py-4 text-xs uppercase tracking-[0.24em] text-primary">
                      Detail panel
                    </div>
                    <Link
                      href={`/stocks/${selectedStockDetail.symbol}`}
                      className="btn btn-outline btn-sm rounded-full px-4"
                    >
                      Open full page
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                }
              />
            ) : (
              <div className="glass-panel rounded-4xl border border-dashed border-base-300/80 p-10 text-center shadow-lg shadow-primary/5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-base-content/42">
                  Stock detail panel
                </p>
                <h2 className="mt-4 font-display text-3xl font-semibold text-base-content">
                  Select a saved stock to inspect it.
                </h2>
                <p className="mx-auto mt-4 max-w-xl leading-7 text-base-content/62">
                  The right column will show price action, a chart, key metrics,
                  and recent headlines for whichever wishlist name you choose.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
