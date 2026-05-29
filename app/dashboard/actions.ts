"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireServerSession } from "@/lib/backend/auth/session";
import {
  addStockToWatchlist,
  removeStockFromWatchlist,
} from "@/lib/backend/stocks/watchlist";
import { findTrackedStock } from "@/lib/backend/stocks/yahoo";

function buildDashboardUrl(status: string, symbol?: string, stock?: string) {
  const params = new URLSearchParams({ status });

  if (symbol) {
    params.set("symbol", symbol);
  }

  if (stock) {
    params.set("stock", stock);
  }

  return `/dashboard?${params.toString()}`;
}

export async function addToWatchlistAction(formData: FormData) {
  const session = await requireServerSession();
  const requestedSymbol = String(formData.get("symbol") ?? "").trim();

  if (!requestedSymbol) {
    redirect(buildDashboardUrl("missing-symbol"));
  }

  const stock = await findTrackedStock(requestedSymbol);

  if (!stock) {
    redirect(
      buildDashboardUrl("stock-not-found", requestedSymbol.toUpperCase()),
    );
  }

  const result = await addStockToWatchlist(session.user.id, {
    symbol: stock.symbol,
    name: stock.name,
  });

  revalidatePath("/dashboard");
  redirect(buildDashboardUrl(result.status, stock.symbol, stock.symbol));
}

export async function removeFromWatchlistAction(formData: FormData) {
  const session = await requireServerSession();
  const symbol = String(formData.get("symbol") ?? "")
    .trim()
    .toUpperCase();

  if (!symbol) {
    redirect(buildDashboardUrl("missing-symbol"));
  }

  await removeStockFromWatchlist(session.user.id, symbol);
  revalidatePath("/dashboard");
  redirect(buildDashboardUrl("removed", symbol));
}
