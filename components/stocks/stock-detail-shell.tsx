"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { StockDetailPanel } from "@/components/stocks/stock-detail-panel";
import type { StockChartRange, StockDetail } from "@/lib/stocks/models";

type StockDetailResponse = {
  stock: StockDetail;
};

type StockDetailShellProps = {
  initialStock: StockDetail;
  headerAction?: React.ReactNode;
};

export function StockDetailShell({
  initialStock,
  headerAction,
}: StockDetailShellProps) {
  const pathname = usePathname();
  const [stock, setStock] = useState(initialStock);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, StockDetail>>({
    [initialStock.chartRange]: initialStock,
  });

  function updateUrl(range: StockChartRange) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("range", range);

    window.history.replaceState(
      null,
      "",
      `${pathname}?${searchParams.toString()}`,
    );
  }

  async function handleRangeChange(nextRange: StockChartRange) {
    if (nextRange === stock.chartRange || isLoading) {
      return;
    }

    updateUrl(nextRange);
    setErrorMessage(null);

    const cachedDetail = detailCache[nextRange];

    if (cachedDetail) {
      setStock(cachedDetail);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/stocks/${stock.symbol}?range=${nextRange}`,
        {
          cache: "no-store",
        },
      );
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

      if (!payload || !("stock" in payload)) {
        throw new Error("Unable to load stock detail right now.");
      }

      setDetailCache((currentCache) => ({
        ...currentCache,
        [nextRange]: payload.stock,
      }));
      setStock(payload.stock);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load stock detail right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <div className="alert alert-error rounded-2xl text-sm">
          {errorMessage}
        </div>
      ) : null}

      <StockDetailPanel
        stock={stock}
        headerAction={headerAction}
        onRangeChange={handleRangeChange}
        isLoading={isLoading}
      />
    </div>
  );
}
