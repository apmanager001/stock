"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import type { StockSearchResult } from "@/lib/backend/stocks/yahoo";

type StockSearchInputProps = {
  name: string;
  placeholder?: string;
};

type SearchResponse = {
  results: StockSearchResult[];
};

export function StockSearchInput({
  name,
  placeholder = "Search by ticker or company name",
}: StockSearchInputProps) {
  const [query, setQuery] = useState("");
  const [selectedResult, setSelectedResult] =
    useState<StockSearchResult | null>(null);
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const deferredQuery = useDeferredValue(query.trim());
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!deferredQuery || selectedResult) {
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;

    fetch(`/api/stocks/search?q=${encodeURIComponent(deferredQuery)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Search request failed.");
        }

        return (await response.json()) as SearchResponse;
      })
      .then((payload) => {
        if (isCurrent) {
          setResults(payload.results);
        }
      })
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (isCurrent) {
          setResults([]);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [deferredQuery, selectedResult]);

  function handleSelect(result: StockSearchResult) {
    setSelectedResult(result);
    setQuery(`${result.symbol} · ${result.name}`);
    setResults([]);
    setIsLoading(false);
    setIsOpen(false);
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  }

  function handleFocus() {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
    }

    setIsOpen(true);
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/42" />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            const hasValue = Boolean(nextQuery.trim());

            setQuery(nextQuery);
            setSelectedResult(null);
            setIsOpen(true);
            setIsLoading(hasValue);

            if (!hasValue) {
              setResults([]);
              setIsLoading(false);
            }
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="input input-bordered h-13 w-full rounded-2xl bg-base-100/80 pl-11 pr-11"
          autoComplete="off"
          spellCheck={false}
        />
        <input
          type="hidden"
          name={name}
          value={selectedResult?.symbol ?? query}
        />

        {isLoading ? (
          <LoaderCircle className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-base-content/42" />
        ) : null}
      </div>

      {isOpen && (isLoading || deferredQuery || results.length > 0) ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-3xl border border-base-300/70 bg-base-100/96 shadow-2xl shadow-primary/10 backdrop-blur">
          {results.length > 0 ? (
            <div className="divide-y divide-base-300/60">
              {results.map((result) => (
                <button
                  key={`${result.symbol}-${result.exchange ?? "exchange"}`}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(result);
                  }}
                  className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-base-200/65"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-base-content">
                      {result.symbol}
                    </p>
                    <p className="mt-1 truncate text-sm text-base-content/62">
                      {result.name}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs uppercase tracking-[0.2em] text-base-content/42">
                    <p>{result.type}</p>
                    <p className="mt-1 tracking-normal text-base-content/56">
                      {result.exchange ?? "Yahoo"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : deferredQuery && !isLoading ? (
            <div className="px-4 py-4 text-sm text-base-content/58">
              No matches found. You can still save a symbol directly.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
