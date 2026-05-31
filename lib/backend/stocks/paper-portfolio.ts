import "server-only";
import type { StockChartPoint } from "@/lib/stocks/models";
import {
  connectMongoClient,
  getMongoDatabase,
} from "@/lib/backend/mongodb/client";
import { connectMongoose } from "@/lib/backend/mongoose/connection";
import {
  PaperPortfolioModel,
  type PaperTrade,
} from "@/lib/backend/mongoose/schemas/paper-portfolio";
import { findTrackedStock, getStockCards } from "@/lib/backend/stocks/yahoo";

export const paperStartingCash = 1000;

export type PaperTradeSide = "BUY" | "SELL";

export type PaperTradeStatus =
  | "bought"
  | "sold"
  | "invalid-symbol"
  | "invalid-shares"
  | "stock-not-found"
  | "quote-unavailable"
  | "insufficient-funds"
  | "insufficient-shares";

export type PaperPortfolioTrade = {
  symbol: string;
  name: string;
  side: PaperTradeSide;
  shares: number;
  price: number;
  total: number;
  executedAt: string | null;
};

export type PaperPortfolioHolding = {
  symbol: string;
  name: string;
  shares: number;
  averageCost: number;
  currentPrice: number | null;
  marketValue: number;
  costBasis: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
};

export type PaperPortfolioSummary = {
  startingCash: number;
  cashBalance: number;
  investedValue: number;
  totalEquity: number;
  totalReturn: number;
  totalReturnPercent: number;
};

export type PaperPortfolioState = {
  summary: PaperPortfolioSummary;
  holdings: PaperPortfolioHolding[];
  transactions: PaperPortfolioTrade[];
  chartPoints: StockChartPoint[];
  createdAt: string;
  hasTransactions: boolean;
};

export type PaperPortfolioLeaderboardEntry = {
  authUserId: string;
  displayName: string;
  totalEquity: number;
  investedValue: number;
  cashBalance: number;
  totalReturn: number;
  totalReturnPercent: number;
  holdingsCount: number;
};

type ExecutePaperTradeInput = {
  symbol: string;
  side: PaperTradeSide;
  shares: number;
};

type ExecutePaperTradeResult = {
  status: PaperTradeStatus;
  symbol?: string;
};

type HoldingAccumulator = {
  symbol: string;
  name: string;
  shares: number;
  costBasis: number;
  lastPrice: number;
};

type LeaderboardUserDocument = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type LeaderboardPortfolioDocument = {
  authUserId: string;
  startingCash?: number | null;
  cashBalance?: number | null;
  transactions?: PaperTrade[];
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundShares(value: number) {
  return Math.round(value * 10000) / 10000;
}

function toIsoString(value: Date | null | undefined) {
  return value instanceof Date ? value.toISOString() : null;
}

function toChartPoint(date: Date, value: number): StockChartPoint {
  return {
    date: date.toISOString(),
    close: roundMoney(value),
    open: null,
    high: null,
    low: null,
    volume: null,
  };
}

function calculateCurrentMarketValue(
  holdings: Iterable<HoldingAccumulator>,
  currentPriceLookup: Map<string, number>,
) {
  return roundMoney(
    Array.from(holdings).reduce((totalValue, holding) => {
      const effectivePrice =
        currentPriceLookup.get(holding.symbol) ?? holding.lastPrice;

      return totalValue + holding.shares * effectivePrice;
    }, 0),
  );
}

function buildPaperPortfolioSummary(
  startingCash: number,
  cashBalance: number,
  holdings: Iterable<HoldingAccumulator>,
  currentPriceLookup: Map<string, number>,
): PaperPortfolioSummary {
  const investedValue = calculateCurrentMarketValue(
    holdings,
    currentPriceLookup,
  );
  const totalEquity = roundMoney(cashBalance + investedValue);
  const totalReturn = roundMoney(totalEquity - startingCash);
  const totalReturnPercent =
    startingCash > 0
      ? Number(((totalReturn / startingCash) * 100).toFixed(2))
      : 0;

  return {
    startingCash,
    cashBalance,
    investedValue,
    totalEquity,
    totalReturn,
    totalReturnPercent,
  };
}

function formatPublicLeaderboardName(
  name: string | null | undefined,
  email: string | null | undefined,
  authUserId: string,
) {
  const fallbackName = `Trader ${authUserId.slice(0, 6).toUpperCase()}`;
  const rawName = name?.trim() || email?.split("@")[0]?.trim() || fallbackName;

  if (rawName === fallbackName) {
    return fallbackName;
  }

  const segments = rawName
    .replace(/[._-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1));

  if (segments.length >= 2) {
    return `${segments[0]} ${segments.at(-1)?.charAt(0) ?? ""}.`;
  }

  return segments[0] ?? fallbackName;
}

function sortTradesAscending(trades: PaperTrade[]) {
  return [...trades].sort((left, right) => {
    const leftTime =
      left.executedAt instanceof Date ? left.executedAt.getTime() : 0;
    const rightTime =
      right.executedAt instanceof Date ? right.executedAt.getTime() : 0;

    return leftTime - rightTime;
  });
}

function buildHoldingsMap(trades: PaperTrade[]) {
  const holdings = new Map<string, HoldingAccumulator>();

  for (const trade of trades) {
    const shares = roundShares(trade.shares);
    const price = roundMoney(trade.price);
    const currentHolding = holdings.get(trade.symbol) ?? {
      symbol: trade.symbol,
      name: trade.name,
      shares: 0,
      costBasis: 0,
      lastPrice: price,
    };

    if (trade.side === "BUY") {
      currentHolding.shares = roundShares(currentHolding.shares + shares);
      currentHolding.costBasis = roundMoney(
        currentHolding.costBasis + shares * price,
      );
      currentHolding.lastPrice = price;
      holdings.set(trade.symbol, currentHolding);
      continue;
    }

    const averageCost =
      currentHolding.shares > 0
        ? currentHolding.costBasis / currentHolding.shares
        : 0;

    currentHolding.shares = roundShares(currentHolding.shares - shares);
    currentHolding.costBasis = roundMoney(
      Math.max(0, currentHolding.costBasis - averageCost * shares),
    );
    currentHolding.lastPrice = price;

    if (currentHolding.shares <= 0.00005) {
      holdings.delete(trade.symbol);
      continue;
    }

    holdings.set(trade.symbol, currentHolding);
  }

  return holdings;
}

function buildChartPoints(
  startingCash: number,
  cashBalance: number,
  createdAt: Date,
  trades: PaperTrade[],
  holdings: Map<string, HoldingAccumulator>,
  currentPriceLookup: Map<string, number>,
) {
  const points = [toChartPoint(createdAt, startingCash)];

  if (trades.length === 0) {
    points.push(toChartPoint(new Date(), startingCash));
    return points;
  }

  const runningHoldings = new Map<
    string,
    { shares: number; lastPrice: number }
  >();
  let runningCash = startingCash;

  for (const trade of trades) {
    const shares = roundShares(trade.shares);
    const price = roundMoney(trade.price);
    const total = roundMoney(shares * price);
    const position = runningHoldings.get(trade.symbol) ?? {
      shares: 0,
      lastPrice: price,
    };

    if (trade.side === "BUY") {
      runningCash = roundMoney(runningCash - total);
      position.shares = roundShares(position.shares + shares);
    } else {
      runningCash = roundMoney(runningCash + total);
      position.shares = roundShares(position.shares - shares);
    }

    position.lastPrice = price;

    if (position.shares <= 0.00005) {
      runningHoldings.delete(trade.symbol);
    } else {
      runningHoldings.set(trade.symbol, position);
    }

    const bookValue = Array.from(runningHoldings.values()).reduce(
      (totalValue, holding) => totalValue + holding.shares * holding.lastPrice,
      0,
    );

    points.push(
      toChartPoint(
        trade.executedAt instanceof Date ? trade.executedAt : new Date(),
        runningCash + bookValue,
      ),
    );
  }

  const currentMarketValue = calculateCurrentMarketValue(
    holdings.values(),
    currentPriceLookup,
  );
  const currentEquity = roundMoney(cashBalance + currentMarketValue);
  const now = new Date();
  const lastPoint = points.at(-1);

  if (!lastPoint || lastPoint.close !== currentEquity) {
    points.push(toChartPoint(now, currentEquity));
  } else if (lastPoint.date !== now.toISOString()) {
    points.push(toChartPoint(now, currentEquity));
  }

  return points;
}

export async function getUserPaperPortfolio(
  authUserId: string,
): Promise<PaperPortfolioState> {
  await connectMongoose();

  const portfolio = await PaperPortfolioModel.findOne({ authUserId });
  const startingCash = roundMoney(portfolio?.startingCash ?? paperStartingCash);
  const cashBalance = roundMoney(portfolio?.cashBalance ?? startingCash);
  const createdAt =
    portfolio?.createdAt instanceof Date ? portfolio.createdAt : new Date();
  const sortedTrades = sortTradesAscending(portfolio?.transactions ?? []);
  const holdingsMap = buildHoldingsMap(sortedTrades);
  const activeSymbols = Array.from(holdingsMap.keys());
  const quotes =
    activeSymbols.length > 0 ? await getStockCards(activeSymbols) : [];
  const quoteLookup = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const currentPriceLookup = new Map(
    quotes
      .filter((quote) => typeof quote.price === "number")
      .map((quote) => [quote.symbol, roundMoney(quote.price ?? 0)]),
  );

  const holdings = Array.from(holdingsMap.values())
    .map((holding) => {
      const quote = quoteLookup.get(holding.symbol);
      const currentPrice =
        typeof quote?.price === "number" ? roundMoney(quote.price) : null;
      const effectivePrice = currentPrice ?? holding.lastPrice;
      const marketValue = roundMoney(holding.shares * effectivePrice);
      const averageCost =
        holding.shares > 0 ? roundMoney(holding.costBasis / holding.shares) : 0;
      const unrealizedGain = roundMoney(marketValue - holding.costBasis);
      const unrealizedGainPercent =
        holding.costBasis > 0
          ? Number(((unrealizedGain / holding.costBasis) * 100).toFixed(2))
          : 0;

      return {
        symbol: holding.symbol,
        name: holding.name,
        shares: holding.shares,
        averageCost,
        currentPrice,
        marketValue,
        costBasis: roundMoney(holding.costBasis),
        unrealizedGain,
        unrealizedGainPercent,
      } satisfies PaperPortfolioHolding;
    })
    .sort((left, right) => right.marketValue - left.marketValue);
  const summary = buildPaperPortfolioSummary(
    startingCash,
    cashBalance,
    holdingsMap.values(),
    currentPriceLookup,
  );
  const transactions = [...sortedTrades].reverse().map(
    (trade) =>
      ({
        symbol: trade.symbol,
        name: trade.name,
        side: trade.side,
        shares: trade.shares,
        price: roundMoney(trade.price),
        total: roundMoney(trade.shares * trade.price),
        executedAt: toIsoString(trade.executedAt),
      }) satisfies PaperPortfolioTrade,
  );

  return {
    summary,
    holdings,
    transactions,
    chartPoints: buildChartPoints(
      startingCash,
      cashBalance,
      createdAt,
      sortedTrades,
      holdingsMap,
      currentPriceLookup,
    ),
    createdAt: createdAt.toISOString(),
    hasTransactions: transactions.length > 0,
  };
}

export async function getPaperPortfolioLeaderboard(
  limit = 10,
): Promise<PaperPortfolioLeaderboardEntry[]> {
  await connectMongoose();

  const normalizedLimit = Math.min(Math.max(Math.floor(limit), 1), 25);
  const portfolios = (await PaperPortfolioModel.find(
    {},
    {
      _id: 0,
      authUserId: 1,
      startingCash: 1,
      cashBalance: 1,
      transactions: 1,
    },
  ).lean()) as LeaderboardPortfolioDocument[];

  if (portfolios.length === 0) {
    return [];
  }

  const portfolioSnapshots = portfolios.map((portfolio) => {
    const startingCash = roundMoney(
      portfolio.startingCash ?? paperStartingCash,
    );
    const cashBalance = roundMoney(portfolio.cashBalance ?? startingCash);
    const sortedTrades = sortTradesAscending(portfolio.transactions ?? []);
    const holdingsMap = buildHoldingsMap(sortedTrades);

    return {
      authUserId: portfolio.authUserId,
      startingCash,
      cashBalance,
      holdingsMap,
    };
  });

  const activeSymbols = Array.from(
    new Set(
      portfolioSnapshots.flatMap((portfolio) =>
        Array.from(portfolio.holdingsMap.keys()),
      ),
    ),
  );
  const quotes =
    activeSymbols.length > 0 ? await getStockCards(activeSymbols) : [];
  const currentPriceLookup = new Map(
    quotes
      .filter((quote) => typeof quote.price === "number")
      .map((quote) => [quote.symbol, roundMoney(quote.price ?? 0)]),
  );

  await connectMongoClient();

  const userIds = portfolioSnapshots.map((portfolio) => portfolio.authUserId);
  const users = await getMongoDatabase()
    .collection<LeaderboardUserDocument>("users")
    .find(
      { id: { $in: userIds } },
      {
        projection: {
          _id: 0,
          id: 1,
          name: 1,
          email: 1,
        },
      },
    )
    .toArray();
  const userLookup = new Map(users.map((user) => [user.id, user]));

  return portfolioSnapshots
    .map((portfolio) => {
      const summary = buildPaperPortfolioSummary(
        portfolio.startingCash,
        portfolio.cashBalance,
        portfolio.holdingsMap.values(),
        currentPriceLookup,
      );
      const user = userLookup.get(portfolio.authUserId);

      return {
        authUserId: portfolio.authUserId,
        displayName: formatPublicLeaderboardName(
          user?.name,
          user?.email,
          portfolio.authUserId,
        ),
        totalEquity: summary.totalEquity,
        investedValue: summary.investedValue,
        cashBalance: summary.cashBalance,
        totalReturn: summary.totalReturn,
        totalReturnPercent: summary.totalReturnPercent,
        holdingsCount: portfolio.holdingsMap.size,
      } satisfies PaperPortfolioLeaderboardEntry;
    })
    .sort((left, right) => {
      if (right.totalEquity !== left.totalEquity) {
        return right.totalEquity - left.totalEquity;
      }

      return right.totalReturnPercent - left.totalReturnPercent;
    })
    .slice(0, normalizedLimit);
}

export async function executePaperTrade(
  authUserId: string,
  input: ExecutePaperTradeInput,
): Promise<ExecutePaperTradeResult> {
  const requestedSymbol = input.symbol.trim();
  const normalizedShares = roundShares(input.shares);

  if (!requestedSymbol) {
    return { status: "invalid-symbol" };
  }

  if (!Number.isFinite(normalizedShares) || normalizedShares <= 0) {
    return { status: "invalid-shares" };
  }

  const stock = await findTrackedStock(requestedSymbol);

  if (!stock) {
    return { status: "stock-not-found" };
  }

  const [quote] = await getStockCards([stock.symbol]);
  const currentPrice = quote?.price;

  if (typeof currentPrice !== "number" || currentPrice <= 0) {
    return { status: "quote-unavailable", symbol: stock.symbol };
  }

  await connectMongoose();

  const portfolio = await PaperPortfolioModel.findOne({ authUserId });
  const startingCash = roundMoney(portfolio?.startingCash ?? paperStartingCash);
  const cashBalance = roundMoney(portfolio?.cashBalance ?? startingCash);
  const sortedTrades = sortTradesAscending(portfolio?.transactions ?? []);
  const holdingsMap = buildHoldingsMap(sortedTrades);
  const currentHolding = holdingsMap.get(stock.symbol);
  const price = roundMoney(currentPrice);
  const total = roundMoney(normalizedShares * price);

  if (input.side === "BUY" && total > cashBalance + 0.0001) {
    return { status: "insufficient-funds", symbol: stock.symbol };
  }

  if (
    input.side === "SELL" &&
    normalizedShares > (currentHolding?.shares ?? 0) + 0.0001
  ) {
    return { status: "insufficient-shares", symbol: stock.symbol };
  }

  const nextCashBalance = roundMoney(
    input.side === "BUY" ? cashBalance - total : cashBalance + total,
  );

  await PaperPortfolioModel.findOneAndUpdate(
    { authUserId },
    {
      $setOnInsert: {
        authUserId,
        startingCash,
      },
      $set: {
        cashBalance: nextCashBalance,
      },
      $push: {
        transactions: {
          symbol: stock.symbol,
          name: stock.name,
          side: input.side,
          shares: normalizedShares,
          price,
          executedAt: new Date(),
        },
      },
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return {
    status: input.side === "BUY" ? "bought" : "sold",
    symbol: stock.symbol,
  };
}

export async function resetPaperPortfolio(authUserId: string) {
  await connectMongoose();
  await PaperPortfolioModel.findOneAndDelete({ authUserId });
}
