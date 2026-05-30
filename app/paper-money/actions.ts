"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireServerSession } from "@/lib/backend/auth/session";
import {
  executePaperTrade,
  resetPaperPortfolio,
  type PaperTradeSide,
} from "@/lib/backend/stocks/paper-portfolio";

function buildPaperMoneyUrl(status: string, symbol?: string) {
  const params = new URLSearchParams({ status });

  if (symbol) {
    params.set("symbol", symbol);
  }

  return `/paper-money?${params.toString()}`;
}

function parseTradeSide(value: FormDataEntryValue | null): PaperTradeSide {
  return String(value ?? "BUY").toUpperCase() === "SELL" ? "SELL" : "BUY";
}

export async function executePaperTradeAction(formData: FormData) {
  const session = await requireServerSession();
  const symbol = String(formData.get("symbol") ?? "").trim();
  const shares = Number.parseFloat(String(formData.get("shares") ?? ""));
  const side = parseTradeSide(formData.get("side"));

  const result = await executePaperTrade(session.user.id, {
    symbol,
    shares,
    side,
  });

  revalidatePath("/paper-money");
  redirect(buildPaperMoneyUrl(result.status, result.symbol ?? symbol.toUpperCase()));
}

export async function resetPaperPortfolioAction() {
  const session = await requireServerSession();

  await resetPaperPortfolio(session.user.id);
  revalidatePath("/paper-money");
  redirect(buildPaperMoneyUrl("reset"));
}