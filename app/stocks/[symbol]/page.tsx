import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { StockDetailPanel } from "@/components/stocks/stock-detail-panel";
import {
  getStockDetail,
  StockNotFoundError,
  stockChartRanges,
  type StockChartRange,
} from "@/lib/backend/stocks/yahoo";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type StockDetailPageProps = {
  params: Promise<{ symbol: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

export async function generateMetadata({
  params,
}: StockDetailPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const normalizedSymbol = symbol.toUpperCase();

  return createPageMetadata({
    title: `${normalizedSymbol} Stock Overview`,
    description: `Price action, chart history, and recent Yahoo Finance news for ${normalizedSymbol}.`,
    path: `/stocks/${normalizedSymbol}`,
    keywords: [
      normalizedSymbol,
      "stock chart",
      "stock news",
      "Yahoo Finance data",
    ],
  });
}

export default async function StockDetailPage({
  params,
  searchParams,
}: StockDetailPageProps) {
  const { symbol } = await params;
  const query = (await searchParams) ?? {};
  const range = parseRange(getSearchParam(query, "range"));
  let stock;

  try {
    stock = await getStockDetail(symbol, range);
  } catch (error) {
    if (error instanceof StockNotFoundError) {
      notFound();
    }

    throw error;
  }

  return (
    <section className="section-shell py-8 lg:py-14" id='chart'>
      <StockDetailPanel
        stock={stock}
        rangeHrefBase={`/stocks/${stock.symbol}`}
        headerAction={
          <Link href="/dashboard" className="btn btn-ghost rounded-full px-5">
            <ArrowLeft className="h-4 w-4" />
            Back to wishlist
          </Link>
        }
      />
    </section>
  );
}
