import { NextResponse } from "next/server";
import { searchStocks } from "@/lib/backend/stocks/yahoo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchStocks(query, 6);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { results: [], error: "Search unavailable" },
      { status: 500 },
    );
  }
}
