import "server-only";
import YahooFinance from "yahoo-finance2";
import type { ChartResultArrayQuote } from "yahoo-finance2/modules/chart";
import type { Quote } from "yahoo-finance2/modules/quote";
import type { ScreenerQuote } from "yahoo-finance2/modules/screener";
import type { SearchNews, SearchResult } from "yahoo-finance2/modules/search";
import {
  stockChartRanges,
  type HomePageMarketData,
  type StockChartPoint,
  type StockChartRange,
  type StockDetail,
  type StockListCard,
  type StockMover,
  type StockNewsArticle,
  type StockQuoteCard,
  type StockSearchResult,
} from "@/lib/stocks/models";

const yahooFinance = new YahooFinance();

const defaultRegion = "US";
const defaultLanguage = "en-US";
export { stockChartRanges };
export type {
  HomePageMarketData,
  StockChartPoint,
  StockChartRange,
  StockDetail,
  StockListCard,
  StockMover,
  StockNewsArticle,
  StockQuoteCard,
  StockSearchResult,
} from "@/lib/stocks/models";

type SearchQuoteResult = SearchResult["quotes"][number];

type SupportedSearchQuote = Extract<
  SearchQuoteResult,
  { isYahooFinance: true; quoteType: "EQUITY" | "ETF" }
>;

export class StockNotFoundError extends Error {
  constructor(symbol: string) {
    super(`Unable to find stock data for ${symbol}.`);
    this.name = "StockNotFoundError";
  }
}

function normalizeStockSymbol(rawSymbol: string) {
  return rawSymbol.trim().toUpperCase();
}

function subtractDays(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function toIsoString(value: Date | number | null | undefined) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    return new Date(value * 1000).toISOString();
  }

  return null;
}

function getDisplayName(stock: Quote | ScreenerQuote) {
  return stock.shortName ?? stock.displayName ?? stock.longName ?? stock.symbol;
}

function mapQuoteCard(stock: Quote | ScreenerQuote): StockQuoteCard {
  return {
    symbol: stock.symbol,
    name: getDisplayName(stock),
    exchange: stock.fullExchangeName ?? stock.exchange ?? null,
    currency: stock.currency ?? null,
    price: stock.regularMarketPrice ?? null,
    change: stock.regularMarketChange ?? null,
    changePercent: stock.regularMarketChangePercent ?? null,
    volume: stock.regularMarketVolume ?? null,
    marketCap: stock.marketCap ?? null,
    marketState: stock.marketState ?? null,
    updatedAt: toIsoString(stock.regularMarketTime),
  };
}

function mapArticle(article: SearchNews): StockNewsArticle {
  const thumbnailUrl = article.thumbnail?.resolutions?.[0]?.url ?? null;

  return {
    id: article.uuid,
    title: article.title,
    publisher: article.publisher,
    link: article.link,
    publishedAt: toIsoString(article.providerPublishTime),
    thumbnailUrl,
    relatedTickers: article.relatedTickers ?? [],
  };
}

function mapChartPoint(point: ChartResultArrayQuote): StockChartPoint | null {
  if (point.close === null) {
    return null;
  }

  return {
    date: point.date.toISOString(),
    close: point.close,
    open: point.open,
    high: point.high,
    low: point.low,
    volume: point.volume,
  };
}

function isSupportedSearchQuote(
  value: SearchQuoteResult,
): value is SupportedSearchQuote {
  return (
    "isYahooFinance" in value &&
    value.isYahooFinance === true &&
    "quoteType" in value &&
    (value.quoteType === "EQUITY" || value.quoteType === "ETF")
  );
}

function mapSearchQuote(quote: SupportedSearchQuote): StockSearchResult {
  return {
    symbol: quote.symbol,
    name: quote.shortname ?? quote.longname ?? quote.symbol,
    exchange: quote.exchDisp ?? quote.exchange ?? null,
    type: quote.quoteType,
    sector: quote.sector ?? null,
    industry: quote.industry ?? null,
  };
}

async function getScreenedStocks(
  screenId: "day_gainers" | "day_losers",
  count: number,
) {
  const result = await yahooFinance.screener({
    scrIds: screenId,
    count,
    region: defaultRegion,
    lang: defaultLanguage,
  });

  return result.quotes.map(mapQuoteCard);
}

async function getIntradayChart(symbol: string) {
  try {
    const chart = await yahooFinance.chart(symbol, {
      period1: subtractDays(1),
      interval: "5m",
      return: "array",
    });

    return chart.quotes
      .map(mapChartPoint)
      .filter((point): point is StockChartPoint => point !== null);
  } catch {
    return [];
  }
}

async function attachDayCharts(
  stocks: StockQuoteCard[],
): Promise<StockMover[]> {
  const movers = await Promise.all(
    stocks.map(async (stock) => ({
      ...stock,
      dayChart: await getIntradayChart(stock.symbol),
    })),
  );

  return movers;
}

export async function getStockCardsWithDayCharts(symbols: string[]) {
  const stocks = await getStockCards(symbols);
  return attachDayCharts(stocks) as Promise<StockListCard[]>;
}

export async function getHomePageMarketData(): Promise<HomePageMarketData> {
  const [gainersResult, losersResult, newsResult] = await Promise.allSettled([
    getScreenedStocks("day_gainers", 6).then(attachDayCharts),
    getScreenedStocks("day_losers", 6).then(attachDayCharts),
    yahooFinance.search("stock market", {
      quotesCount: 0,
      newsCount: 6,
      enableCb: false,
      enableNavLinks: false,
      region: defaultRegion,
      lang: defaultLanguage,
    }),
  ]);

  return {
    gainers: gainersResult.status === "fulfilled" ? gainersResult.value : [],
    losers: losersResult.status === "fulfilled" ? losersResult.value : [],
    featuredNews:
      newsResult.status === "fulfilled"
        ? newsResult.value.news.map(mapArticle)
        : [],
  };
}

export async function searchStocks(query: string, limit = 6) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const result = await yahooFinance.search(normalizedQuery, {
    quotesCount: limit,
    newsCount: 0,
    enableCb: false,
    enableNavLinks: false,
    enableFuzzyQuery: true,
    region: defaultRegion,
    lang: defaultLanguage,
  });

  return result.quotes
    .filter(isSupportedSearchQuote)
    .map(mapSearchQuote)
    .slice(0, limit);
}

export async function findTrackedStock(query: string) {
  const normalizedSymbol = normalizeStockSymbol(query);
  const results = await searchStocks(normalizedSymbol, 8);

  return (
    results.find((result) => result.symbol === normalizedSymbol) ??
    results[0] ??
    null
  );
}

export async function getStockCards(symbols: string[]) {
  const normalizedSymbols = Array.from(
    new Set(
      symbols.map(normalizeStockSymbol).filter((symbol) => symbol.length > 0),
    ),
  );

  if (normalizedSymbols.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    normalizedSymbols.map((symbol) =>
      yahooFinance.quote(symbol, {
        region: defaultRegion,
        lang: defaultLanguage,
      }),
    ),
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<Quote> =>
        result.status === "fulfilled",
    )
    .map((result) => mapQuoteCard(result.value));
}

export async function getStockDetail(
  symbol: string,
  range: StockChartRange = "3mo",
): Promise<StockDetail> {
  const normalizedSymbol = normalizeStockSymbol(symbol);
  const selectedRange = stockChartRanges[range] ?? stockChartRanges["3mo"];

  try {
    const [quote, chart, searchResult] = await Promise.all([
      yahooFinance.quote(normalizedSymbol, {
        region: defaultRegion,
        lang: defaultLanguage,
      }),
      yahooFinance.chart(normalizedSymbol, {
        period1: subtractDays(selectedRange.lookbackDays),
        interval: selectedRange.interval,
        return: "array",
      }),
      yahooFinance.search(normalizedSymbol, {
        quotesCount: 4,
        newsCount: 8,
        enableCb: false,
        enableNavLinks: false,
        region: defaultRegion,
        lang: defaultLanguage,
      }),
    ]);

    const chartPoints = chart.quotes
      .map(mapChartPoint)
      .filter((point): point is StockChartPoint => point !== null);

    if (!quote.regularMarketPrice && chartPoints.length === 0) {
      throw new StockNotFoundError(normalizedSymbol);
    }

    return {
      symbol: quote.symbol,
      name: getDisplayName(quote),
      exchange: quote.fullExchangeName ?? quote.exchange ?? null,
      currency: quote.currency ?? null,
      marketState: quote.marketState ?? null,
      price: quote.regularMarketPrice ?? null,
      change: quote.regularMarketChange ?? null,
      changePercent: quote.regularMarketChangePercent ?? null,
      previousClose: quote.regularMarketPreviousClose ?? null,
      open: quote.regularMarketOpen ?? null,
      dayHigh: quote.regularMarketDayHigh ?? quote.dayHigh ?? null,
      dayLow: quote.regularMarketDayLow ?? quote.dayLow ?? null,
      volume: quote.regularMarketVolume ?? quote.volume ?? null,
      averageVolume: quote.averageDailyVolume3Month ?? null,
      marketCap: quote.marketCap ?? null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? null,
      trailingPE: quote.trailingPE ?? null,
      forwardPE: quote.forwardPE ?? null,
      dividendYield:
        "dividendYield" in quote && typeof quote.dividendYield === "number"
          ? quote.dividendYield
          : null,
      updatedAt: toIsoString(quote.regularMarketTime),
      chartRange: range,
      chartInterval: selectedRange.interval,
      chartPoints,
      news: searchResult.news.map(mapArticle),
    };
  } catch (error) {
    if (error instanceof StockNotFoundError) {
      throw error;
    }

    if (
      error instanceof Error &&
      /no data|not found|symbol/i.test(error.message)
    ) {
      throw new StockNotFoundError(normalizedSymbol);
    }

    throw error;
  }
}
