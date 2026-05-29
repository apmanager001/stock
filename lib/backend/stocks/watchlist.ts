import "server-only";
import { connectMongoose } from "@/lib/backend/mongoose/connection";
import {
  StockWatchlistModel,
  type StockWatchlistItem,
} from "@/lib/backend/mongoose/schemas/stock-watchlist";

type PersistedWatchlistItem = {
  symbol: string;
  name: string;
  addedAt: string | null;
};

type UpsertWatchlistInput = {
  symbol: string;
  name: string;
};

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function mapWatchlistItem(item: StockWatchlistItem): PersistedWatchlistItem {
  return {
    symbol: item.symbol,
    name: item.name,
    addedAt: item.addedAt instanceof Date ? item.addedAt.toISOString() : null,
  };
}

export async function getUserWatchlist(authUserId: string) {
  await connectMongoose();

  const watchlist = await StockWatchlistModel.findOne(
    { authUserId },
    { items: 1 },
  ).lean();

  if (!watchlist) {
    return [];
  }

  return [...watchlist.items]
    .sort((left, right) => {
      const leftTime =
        left.addedAt instanceof Date ? left.addedAt.getTime() : 0;
      const rightTime =
        right.addedAt instanceof Date ? right.addedAt.getTime() : 0;

      return rightTime - leftTime;
    })
    .map(mapWatchlistItem);
}

export async function addStockToWatchlist(
  authUserId: string,
  stock: UpsertWatchlistInput,
) {
  await connectMongoose();

  const symbol = normalizeSymbol(stock.symbol);
  const existing = await StockWatchlistModel.findOne(
    { authUserId },
    { items: 1 },
  ).lean();

  if (
    existing?.items.some((item: { symbol: string }) => item.symbol === symbol)
  ) {
    return { status: "exists" as const };
  }

  await StockWatchlistModel.findOneAndUpdate(
    { authUserId },
    {
      $setOnInsert: { authUserId },
      $push: {
        items: {
          symbol,
          name: stock.name,
          addedAt: new Date(),
        },
      },
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return { status: "added" as const };
}

export async function removeStockFromWatchlist(
  authUserId: string,
  symbol: string,
) {
  await connectMongoose();

  await StockWatchlistModel.findOneAndUpdate(
    { authUserId },
    {
      $pull: {
        items: {
          symbol: normalizeSymbol(symbol),
        },
      },
    },
  );
}
