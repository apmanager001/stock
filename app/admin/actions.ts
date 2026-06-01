"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireAdminSession } from "@/lib/backend/auth/admin";
import { saveHomePageTopCompanySymbols } from "@/lib/backend/stocks/top-companies";
import {
  clearHomePageMarketDataCache,
  findTrackedStock,
} from "@/lib/backend/stocks/yahoo";
import { parseTopCompanySymbolsInput } from "@/lib/stocks/top-companies";

function buildAdminUrl(
  status: string,
  options?: { message?: string; symbol?: string },
) {
  const params = new URLSearchParams({ status });

  if (options?.message) {
    params.set("message", options.message);
  }

  if (options?.symbol) {
    params.set("symbol", options.symbol);
  }

  return `/admin?${params.toString()}`;
}

export async function updateTopCompaniesAction(formData: FormData) {
  await requireAdminSession();

  const rawSymbols = String(formData.get("symbols") ?? "");

  let requestedSymbols: string[];

  try {
    requestedSymbols = parseTopCompanySymbolsInput(rawSymbols);
  } catch (error) {
    const message =
      error instanceof ZodError
        ? (error.issues[0]?.message ?? "Enter valid stock tickers.")
        : "Enter valid stock tickers.";

    redirect(buildAdminUrl("invalid-input", { message }));
  }

  if (requestedSymbols.length === 0) {
    await saveHomePageTopCompanySymbols([]);
    clearHomePageMarketDataCache();
    revalidatePath("/");
    revalidatePath("/admin");
    redirect(buildAdminUrl("cleared"));
  }

  const resolvedStocks = await Promise.all(
    requestedSymbols.map(async (symbol) => ({
      requestedSymbol: symbol,
      stock: await findTrackedStock(symbol),
    })),
  );

  const missingStock = resolvedStocks.find(({ stock }) => !stock);

  if (missingStock) {
    redirect(
      buildAdminUrl("stock-not-found", {
        symbol: missingStock.requestedSymbol,
      }),
    );
  }

  const resolvedSymbols = Array.from(
    new Set(resolvedStocks.map(({ stock }) => stock!.symbol)),
  );

  await saveHomePageTopCompanySymbols(resolvedSymbols);
  clearHomePageMarketDataCache();
  revalidatePath("/");
  revalidatePath("/admin");
  redirect(buildAdminUrl("saved"));
}
