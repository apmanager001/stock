"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CirclePlus, ExternalLink, Sparkles, Trash2, X } from "lucide-react";
import { WishlistDeleteModal } from "@/components/dashboard/wishlist-delete-modal";
import { StockDetailPanel } from "@/components/stocks/stock-detail-panel";
import { StockSearchInput } from "@/components/stocks/stock-search-input";
import { StockSparkline } from "@/components/stocks/stock-sparkline";
import type {
  StockChartRange,
  StockDetail,
  StockListCard,
} from "@/lib/stocks/models";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
} from "@/lib/stocks/format";

type DashboardWatchlistItem = {
  symbol: string;
  name: string;
  addedAt: string | null;
};

type DashboardFormAction = (formData: FormData) => void | Promise<void>;

type DashboardShellProps = {
  watchlist: DashboardWatchlistItem[];
  watchlistCards: StockListCard[];
  initialSelectedStockSymbol?: string;
  initialSelectedStockDetail: StockDetail | null;
  initialSelectedRange: StockChartRange;
  statusMessage: string | null;
  addToWatchlistAction: DashboardFormAction;
  removeFromWatchlistAction: DashboardFormAction;
};

type StockDetailResponse = {
  stock: StockDetail;
};

export function DashboardShell({
  watchlist,
  watchlistCards,
  initialSelectedStockSymbol,
  initialSelectedStockDetail,
  initialSelectedRange,
  statusMessage,
  addToWatchlistAction,
  removeFromWatchlistAction,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(
    initialSelectedStockSymbol ?? watchlist[0]?.symbol ?? null,
  );
  const [selectedRange, setSelectedRange] = useState<StockChartRange>(
    initialSelectedStockDetail?.chartRange ?? initialSelectedRange,
  );
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [stockPendingRemoval, setStockPendingRemoval] = useState<{
    symbol: string;
    name: string;
  } | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailCache, setDetailCache] = useState<Record<string, StockDetail>>(
    () =>
      initialSelectedStockDetail
        ? {
            [`${initialSelectedStockDetail.symbol}:${initialSelectedStockDetail.chartRange}`]:
              initialSelectedStockDetail,
          }
        : {},
  );

  const cardLookup = useMemo(
    () => new Map(watchlistCards.map((card) => [card.symbol, card])),
    [watchlistCards],
  );

  const topMover = useMemo(
    () =>
      [...watchlistCards].sort(
        (left, right) =>
          (right.changePercent ?? -Infinity) -
          (left.changePercent ?? -Infinity),
      )[0],
    [watchlistCards],
  );

  const selectedDetailCacheKey = selectedStockSymbol
    ? `${selectedStockSymbol}:${selectedRange}`
    : null;
  const selectedStockDetail = selectedDetailCacheKey
    ? (detailCache[selectedDetailCacheKey] ?? null)
    : null;

  useEffect(() => {
    if (!selectedStockSymbol) {
      return;
    }

    const cacheKey = `${selectedStockSymbol}:${selectedRange}`;
    const cachedDetail = detailCache[cacheKey];

    if (cachedDetail) {
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;

    fetch(`/api/stocks/${selectedStockSymbol}?range=${selectedRange}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | StockDetailResponse
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            payload && "error" in payload && payload.error
              ? payload.error
              : "Unable to load stock detail right now.",
          );
        }

        return payload as StockDetailResponse;
      })
      .then((payload) => {
        if (!isCurrent) {
          return;
        }

        setDetailCache((currentCache) => ({
          ...currentCache,
          [cacheKey]: payload.stock,
        }));
        setDetailError(null);
      })
      .catch((error) => {
        if (!isCurrent) {
          return;
        }

        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setDetailError(
          error instanceof Error
            ? error.message
            : "Unable to load stock detail right now.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingDetail(false);
        }
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [detailCache, selectedRange, selectedStockSymbol]);

  function updateDashboardUrl(
    nextSymbol: string | null,
    nextRange: StockChartRange,
  ) {
    const searchParams = new URLSearchParams(window.location.search);

    searchParams.delete("status");
    searchParams.delete("symbol");

    if (nextSymbol) {
      searchParams.set("stock", nextSymbol);
      searchParams.set("range", nextRange);
    } else {
      searchParams.delete("stock");
      searchParams.delete("range");
    }

    const query = searchParams.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname,
    );
  }

  function handleSelectStock(symbol: string) {
    const cacheKey = `${symbol}:${selectedRange}`;

    setSelectedStockSymbol(symbol);
    setIsWishlistDrawerOpen(false);
    setDetailError(null);
    setIsLoadingDetail(!Boolean(detailCache[cacheKey]));
    updateDashboardUrl(symbol, selectedRange);
  }

  function handleRangeChange(range: StockChartRange) {
    setSelectedRange(range);

    if (!selectedStockSymbol) {
      return;
    }

    const cacheKey = `${selectedStockSymbol}:${range}`;
    setDetailError(null);
    setIsLoadingDetail(!Boolean(detailCache[cacheKey]));
    updateDashboardUrl(selectedStockSymbol, range);
  }

  function handleRequestRemoveStock(stock: { symbol: string; name: string }) {
    setStockPendingRemoval(stock);
  }

  function handleCloseRemoveModal() {
    setStockPendingRemoval(null);
  }

  function renderWishlistPanel(searchInputId: string) {
    return (
      <div className="glass-panel min-w-0 rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="space-y-6">
          <div className="border-base-300/60 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <CirclePlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                    Save to Wishlist
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-semibold text-base-content">
                    Your Wishlist
                  </h2>
                </div>
              </div>
              <div className="max-w-12 text-xs">
                <div className="badge badge-primary min-w-18">
                  {watchlistCards.length} / 25
                </div>
              </div>
            </div>

            <form action={addToWatchlistAction} className="mt-6 flex md:gap-2">
              <div className="flex-1">
                <StockSearchInput name="symbol" inputId={searchInputId} />
              </div>
              <button
                type="submit"
                className="btn btn-primary h-13 rounded-l-none md:rounded-full text-base"
              >
                Save
              </button>
            </form>
            {statusMessage ? (
              <div className="alert alert-info mt-4 rounded-2xl text-sm">
                {statusMessage}
              </div>
            ) : null}
            <p className="mt-3 text-xs text-base-content/56">
              Search by ticker or company name and add stock to your wishlist.
            </p>
          </div>
        </div>
        <div className="min-w-0 border border-base-300/60 bg-base-100/70 mt-2 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/42">
            Top mover today
          </p>
          <p className="mt-2 truncate text-lg font-semibold text-primary">
            {topMover ? topMover.symbol : "--"}
          </p>
          <p className="mt-1 text-xs text-success font-semibold">
            {topMover
              ? formatPercent(topMover.changePercent)
              : "Add a stock to begin tracking."}
          </p>
        </div>
        <p className="mt-4 text-xs text-base-content/62">
          Updated:
          {watchlistCards[0]
            ? formatDateTime(watchlistCards[0].updatedAt)
            : "--"}
        </p>
        {watchlistCards.length === 0 ? (
          <div className="mt-1 rounded-4xl border border-dashed border-base-300/80 bg-base-100/70 p-10 text-center">
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
          <div className="mt-1 space-y-3 mb-24 lg:mb-0">
            {watchlist.map((item) => {
              const stock = cardLookup.get(item.symbol) ?? {
                symbol: item.symbol,
                name: item.name,
                exchange: null,
                currency: "USD",
                price: null,
                change: null,
                changePercent: null,
                volume: null,
                marketCap: null,
                marketState: null,
                updatedAt: null,
                dayChart: [],
              };
              const isSelected = stock.symbol === selectedStockSymbol;
              const isPositive = (stock.changePercent ?? 0) >= 0;

              return (
                <article
                  key={item.symbol}
                  className={[
                    "rounded-3xl border bg-base-100/80 p-2 md:p-4 shadow-lg shadow-primary/5 transition-colors",
                    isSelected
                      ? "border-primary/35 bg-primary/6"
                      : "border-base-300/70 hover:border-primary/20",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectStock(stock.symbol)}
                    className={`block w-full text-left ${isSelected ? "cursor-default" : "cursor-pointer"}`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <p className="mt-1 truncate text-sm text-base-content/58">
                        {stock.name}
                      </p>
                      {isSelected ? (
                        <span className="rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                          Selected
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-3 flex-row items-start justify-between sm:gap-4">
                      <div className="min-w-0 flex-1 self-center">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-base-content sm:text-lg">
                            {stock.symbol}
                          </p>
                        </div>
                      </div>
                      <div
                        className={[
                          "group flex min-w-0 items-center rounded-2xl text-left transition-colors",
                        ].join(" ")}
                      >
                        <div className="min-w-0 flex-1">
                          <StockSparkline
                            symbol={stock.symbol}
                            points={stock.dayChart}
                            positive={isPositive}
                            className="h-11 w-full"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 sm:shrink-0 sm:text-right">
                        <p className="text-sm font-semibold text-base-content sm:text-base">
                          {formatCurrency(stock.price, stock.currency ?? "USD")}
                        </p>
                        <p
                          className={`mt-1 text-xs font-semibold sm:text-sm ${
                            isPositive ? "text-success" : "text-error"
                          }`}
                        >
                          {formatPercent(stock.changePercent)}
                        </p>
                      </div>
                    </div>
                  </button>
                  <div className="min-w-0 mt-3 flex justify-between items-center">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/48">
                      <span className="truncate">
                        Added {formatDate(item.addedAt)}
                      </span>
                      <span
                        className={isPositive ? "text-success" : "text-error"}
                      >
                        {isPositive ? "Up today" : "Down today"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleRequestRemoveStock({
                          symbol: item.symbol,
                          name: stock.name,
                        })
                      }
                      className="btn btn-ghost h-full max-w-12 w-full justify-center rounded-2xl text-error hover:bg-error/10"
                      aria-label={`Remove ${item.symbol} from wishlist`}
                      title={`Remove ${item.symbol}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="xl:hidden">
        <button
          type="button"
          onClick={() => setIsWishlistDrawerOpen(true)}
          className="btn h-12 w-full justify-start rounded-2xl border border-primary/25 bg-base-100/85 px-4 text-sm font-semibold text-base-content shadow-lg shadow-primary/5"
          aria-expanded={isWishlistDrawerOpen}
          aria-controls="mobile-wishlist-drawer"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Wishlist
        </button>
      </div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] xl:items-start">
        <div className="hidden xl:block">
          {renderWishlistPanel("wishlist-search-desktop")}
        </div>

        <div className="min-w-0 space-y-6">
          {selectedStockDetail ? (
            <StockDetailPanel
              stock={selectedStockDetail}
              onRangeChange={handleRangeChange}
              isLoading={isLoadingDetail}
              headerAction={
                <div className="flex flex-wrap items-center gap-3">
                  <div className="badge badge-outline rounded-full border-primary/30 bg-base-100/80 px-4 py-4 text-xs uppercase tracking-[0.24em] text-primary">
                    {isLoadingDetail ? "Updating detail" : "Detail panel"}
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
                {isLoadingDetail && selectedStockSymbol
                  ? `Loading ${selectedStockSymbol}...`
                  : "Select a saved stock to inspect it."}
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-7 text-base-content/62">
                {detailError ??
                  "The right column will show price action, a chart, key metrics, and recent headlines for whichever wishlist name you choose."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className={[
          "fixed inset-0 z-50 xl:hidden",
          isWishlistDrawerOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!isWishlistDrawerOpen}
      >
        <button
          type="button"
          className={[
            "absolute inset-0 bg-neutral/42 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
            isWishlistDrawerOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setIsWishlistDrawerOpen(false)}
          aria-label="Close wishlist drawer"
          tabIndex={isWishlistDrawerOpen ? 0 : -1}
        />

        <div
          className={[
            "absolute inset-y-0 left-0 w-[min(88vw,26rem)] overflow-y-auto bg-base-300/60 p-3 backdrop-blur-sm transition-transform duration-300 ease-out will-change-transform sm:p-4",
            isWishlistDrawerOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div
            id="mobile-wishlist-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Wishlist"
            className="min-h-full"
          >
            <div className="mb-3 flex items-center justify-between rounded-3xl border border-base-300/70 bg-base-100/92 px-4 py-3 shadow-lg shadow-primary/5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/42">
                    Quick access
                  </p>
                  <p className="text-lg font-semibold text-base-content">
                    Wishlist
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setIsWishlistDrawerOpen(false)}
                aria-label="Close wishlist drawer"
                tabIndex={isWishlistDrawerOpen ? 0 : -1}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {renderWishlistPanel("wishlist-search-mobile")}
          </div>
        </div>
      </div>

      <WishlistDeleteModal
        stock={stockPendingRemoval}
        onClose={handleCloseRemoveModal}
        removeFromWatchlistAction={removeFromWatchlistAction}
      />
    </div>
  );
}
