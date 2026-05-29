import { NextResponse } from "next/server";
import {
  getStockDetail,
  StockNotFoundError,
  stockChartRanges,
  type StockChartRange,
} from "@/lib/backend/stocks/yahoo";

type StockDetailRouteProps = {
  params: Promise<{ symbol: string }>;
};

function parseRange(rawRange: string | null): StockChartRange {
  if (rawRange && rawRange in stockChartRanges) {
    return rawRange as StockChartRange;
  }

  return "3mo";
}

export async function GET(request: Request, { params }: StockDetailRouteProps) {
  const { searchParams } = new URL(request.url);
  const { symbol } = await params;
  const range = parseRange(searchParams.get("range"));

  try {
    const stock = await getStockDetail(symbol, range);
    return NextResponse.json({ stock });
  } catch (error) {
    if (error instanceof StockNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Unable to load stock detail right now." },
      { status: 500 },
    );
  }
}
