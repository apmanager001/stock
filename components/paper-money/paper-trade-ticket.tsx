"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { executePaperTradeAction } from "@/app/paper-money/actions";
import { StockSearchInput } from "@/components/stocks/stock-search-input";
import { formatCurrency } from "@/lib/stocks/format";
import type { StockSearchResult } from "@/lib/stocks/models";

type PaperTradeTicketProps = {
  cashBalance: number;
  startingCash: number;
};

type StockDetailResponse = {
  stock: {
    symbol: string;
    name: string;
    currency: string | null;
    price: number | null;
  };
};

export function PaperTradeTicket({
  cashBalance,
  startingCash,
}: PaperTradeTicketProps) {
  const [selectedResult, setSelectedResult] =
    useState<StockSearchResult | null>(null);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [sharesInput, setSharesInput] = useState("1");
  const [quote, setQuote] = useState<StockDetailResponse["stock"] | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const deferredSymbol = useDeferredValue(selectedResult?.symbol ?? null);

  useEffect(() => {
    if (!deferredSymbol) {
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;

    fetch(`/api/stocks/${deferredSymbol}?range=3mo`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | StockDetailResponse
          | { error?: string }
          | null;

        if (!response.ok || !payload || !("stock" in payload)) {
          throw new Error(
            payload && "error" in payload && payload.error
              ? payload.error
              : "Unable to load stock price.",
          );
        }

        return payload.stock;
      })
      .then((stock) => {
        if (!isCurrent) {
          return;
        }

        setQuote(stock);
      })
      .catch((error) => {
        if (!isCurrent) {
          return;
        }

        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setQuote(null);
        setQuoteError(
          error instanceof Error ? error.message : "Unable to load stock price.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setIsQuoteLoading(false);
        }
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [deferredSymbol]);

  const parsedShares = Number.parseFloat(sharesInput);
  const hasValidShares = Number.isFinite(parsedShares) && parsedShares > 0;
  const currentPrice = quote?.price ?? null;
  const currentCurrency = quote?.currency ?? "USD";
  const transactionTotal =
    typeof currentPrice === "number" && hasValidShares
      ? currentPrice * parsedShares
      : null;
  const projectedCashBalance =
    typeof transactionTotal === "number"
      ? side === "BUY"
        ? cashBalance - transactionTotal
        : cashBalance + transactionTotal
      : cashBalance;
  const isOverBudget = side === "BUY" && projectedCashBalance < 0;

  const executeButtonLabel = useMemo(() => {
    if (isQuoteLoading) {
      return "Loading price";
    }

    if (isOverBudget) {
      return "Insufficient cash";
    }

    return "Execute trade";
  }, [isOverBudget, isQuoteLoading]);

  const isTradeDisabled =
    isQuoteLoading ||
    !deferredSymbol ||
    !hasValidShares ||
    typeof currentPrice !== "number" ||
    isOverBudget;

  return (
    <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
          Trade ticket
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
          Place a paper trade
        </h2>
        <p className="mt-3 text-sm leading-7 text-base-content/62">
          Search any supported stock, pick buy or sell, and choose any
          fractional share amount.
        </p>
      </div>

      <form action={executePaperTradeAction} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="paper-money-symbol"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/42"
          >
            Stock
          </label>
          <div className="mt-2">
            <StockSearchInput
              name="symbol"
              inputId="paper-money-symbol"
              placeholder="Search ticker or company"
              inputClassName="rounded-2xl md:rounded-2xl"
              onValueChange={(_, result) => {
                setSelectedResult(result);
                setQuote(null);
                setQuoteError(null);
                setIsQuoteLoading(Boolean(result?.symbol));
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/42">
              Action
            </span>
            <select
              name="side"
              value={side}
              onChange={(event) => setSide(event.target.value as "BUY" | "SELL")}
              className="select select-bordered h-13 w-full rounded-2xl bg-base-100/80"
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/42">
              Shares
            </span>
            <input
              type="number"
              name="shares"
              min="0.0001"
              step="0.0001"
              value={sharesInput}
              onChange={(event) => setSharesInput(event.target.value)}
              className="input input-bordered h-13 w-full rounded-2xl bg-base-100/80"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-base-300/70 bg-base-100/75 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
              Current price
            </p>
            <p className="mt-2 text-lg font-semibold text-base-content">
              {isQuoteLoading ? "Loading..." : formatCurrency(currentPrice, currentCurrency)}
            </p>
            <p className="mt-2 text-xs text-base-content/56">
              {quote?.symbol ?? deferredSymbol ?? "Select a stock"}
            </p>
          </div>

          <div className="rounded-3xl border border-base-300/70 bg-base-100/75 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
              Trade total
            </p>
            <p className="mt-2 text-lg font-semibold text-base-content">
              {formatCurrency(transactionTotal, currentCurrency)}
            </p>
            <p className="mt-2 text-xs text-base-content/56">
              {side === "BUY" ? "Cash required now" : "Cash released now"}
            </p>
          </div>

          <div className="rounded-3xl border border-base-300/70 bg-base-100/75 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
              Balance after trade
            </p>
            <p
              className={[
                "mt-2 text-lg font-semibold",
                isOverBudget ? "text-error" : "text-base-content",
              ].join(" ")}
            >
              {formatCurrency(projectedCashBalance)}
            </p>
            <p className="mt-2 text-xs text-base-content/56">
              Current cash {formatCurrency(cashBalance)}
            </p>
          </div>
        </div>

        {quoteError ? (
          <div className="alert alert-warning rounded-2xl text-sm">
            <AlertCircle className="h-4 w-4" />
            {quoteError}
          </div>
        ) : null}

        {isOverBudget ? (
          <div className="alert alert-error rounded-2xl text-sm">
            <AlertCircle className="h-4 w-4" />
            This trade would push your paper portfolio below zero cash.
          </div>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary h-13 w-full rounded-full text-base"
          disabled={isTradeDisabled}
        >
          {isQuoteLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : null}
          {executeButtonLabel}
        </button>
      </form>

      <div className="mt-6 rounded-3xl border border-base-300/70 bg-base-100/70 p-4 text-sm text-base-content/62">
        Trades execute against the latest Yahoo Finance quote. Portfolio reset
        clears all positions and returns cash to {formatCurrency(startingCash)}.
      </div>
    </div>
  );
}