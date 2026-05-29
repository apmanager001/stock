import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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
} from "@/lib/backend/stocks/yahoo";
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
      <DashboardShell
        firstName={firstName}
        watchlist={watchlist}
        watchlistCards={cards}
        initialSelectedStockSymbol={selectedStockSymbol}
        initialSelectedStockDetail={selectedStockDetail}
        initialSelectedRange={selectedRange}
        statusMessage={statusMessage}
        addToWatchlistAction={addToWatchlistAction}
        removeFromWatchlistAction={removeFromWatchlistAction}
      />
    </section>
  );
}
