import "server-only";
import YahooFinance from "yahoo-finance2";
import type { ChartResultArrayQuote } from "yahoo-finance2/modules/chart";
import type { Quote } from "yahoo-finance2/modules/quote";
import type { ScreenerQuote } from "yahoo-finance2/modules/screener";
import type { SearchNews, SearchResult } from "yahoo-finance2/modules/search";
import {
  clearCachedValues,
  getCachedValue,
} from "@/lib/backend/cache/memory";
import { getHomePageTopCompanySymbols } from "@/lib/backend/stocks/top-companies";
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
const marketTimeZone = "America/New_York";
const openMarketYahooCacheTtlMs = 60_000;
const closedMarketYahooCacheTtlMs = 6 * 60 * 60 * 1000;
const stockSearchCacheTtlMs = 30_000;
const marketClockFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: marketTimeZone,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
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

function getMarketClockSnapshot(value = new Date()) {
  const parts = marketClockFormatter.formatToParts(value);
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  return {
    weekday,
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

function isRegularMarketOpen(value = new Date()) {
  const { weekday, hour, minute } = getMarketClockSnapshot(value);

  if (!weekday || weekday === "Sat" || weekday === "Sun") {
    return false;
  }

  const minutesSinceMidnight = hour * 60 + minute;

  return minutesSinceMidnight >= 9 * 60 + 30 && minutesSinceMidnight < 16 * 60;
}

function getYahooCacheTtlMs() {
  return isRegularMarketOpen()
    ? openMarketYahooCacheTtlMs
    : closedMarketYahooCacheTtlMs;
}

function getYahooCacheKey(scope: string, key: string) {
  const marketPhase = isRegularMarketOpen() ? "open" : "closed";
  return `${scope}:${marketPhase}:${key}`;
}

async function getCachedYahooValue<T>(
  scope: string,
  key: string,
  loader: () => Promise<T>,
) {
  return getCachedValue({
    cacheName: "yahoo-finance",
    key: getYahooCacheKey(scope, key),
    ttlMs: getYahooCacheTtlMs(),
    loader,
  });
}

export function clearHomePageMarketDataCache() {
  clearCachedValues("yahoo-finance", (key) =>
    key.startsWith("home-page-market:"),
  );
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

function mapChartPoints(quotes: ChartResultArrayQuote[]) {
  return quotes
    .map(mapChartPoint)
    .filter((point): point is StockChartPoint => point !== null);
}

function getTradingDayKey(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString().slice(0, 10);
}

function getMostRecentTradingSessionPoints(points: StockChartPoint[]) {
  const groupedPoints = new Map<string, StockChartPoint[]>();

  for (const point of points) {
    const dayKey = getTradingDayKey(point.date);

    if (!dayKey) {
      continue;
    }

    const dayPoints = groupedPoints.get(dayKey) ?? [];
    dayPoints.push(point);
    groupedPoints.set(dayKey, dayPoints);
  }

  const sortedDays = Array.from(groupedPoints.keys()).sort();

  for (let index = sortedDays.length - 1; index >= 0; index -= 1) {
    const dayPoints = groupedPoints.get(sortedDays[index]) ?? [];

    if (dayPoints.length >= 2) {
      return dayPoints;
    }
  }

  return points;
}

async function getIntradaySessionChart(symbol: string) {
  return getCachedYahooValue("intraday-chart", symbol, async () => {
    const primaryChart = await yahooFinance.chart(symbol, {
      period1: subtractDays(1),
      interval: "5m",
      return: "array",
    });

    const primaryPoints = mapChartPoints(primaryChart.quotes);

    if (primaryPoints.length >= 2) {
      return primaryPoints;
    }

    const fallbackChart = await yahooFinance.chart(symbol, {
      period1: subtractDays(7),
      interval: "5m",
      return: "array",
    });

    return getMostRecentTradingSessionPoints(
      mapChartPoints(fallbackChart.quotes),
    );
  });
}

async function getChartPointsForRange(symbol: string, range: StockChartRange) {
  if (range === "1d") {
    return getIntradaySessionChart(symbol);
  }

  const selectedRange = stockChartRanges[range] ?? stockChartRanges["3mo"];

  return getCachedYahooValue("range-chart", `${symbol}:${range}`, async () => {
    const chart = await yahooFinance.chart(symbol, {
      period1: subtractDays(selectedRange.lookbackDays),
      interval: selectedRange.interval,
      return: "array",
    });

    return mapChartPoints(chart.quotes);
  });
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

async function getCachedQuote(symbol: string) {
  return getCachedYahooValue("quote", symbol, () =>
    yahooFinance.quote(symbol, {
      region: defaultRegion,
      lang: defaultLanguage,
    }),
  );
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
    return await getIntradaySessionChart(symbol);
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
  return getCachedYahooValue("home-page-market", "default", async () => {
    const [gainersResult, losersResult, topCompaniesResult, newsResult] =
      await Promise.allSettled([
        getScreenedStocks("day_gainers", 6).then(attachDayCharts),
        getScreenedStocks("day_losers", 6).then(attachDayCharts),
        getHomePageTopCompanySymbols().then(getStockCardsWithDayCharts),
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
      gainers:
        gainersResult.status === "fulfilled" ? gainersResult.value : [],
      losers: losersResult.status === "fulfilled" ? losersResult.value : [],
      topCompanies:
        topCompaniesResult.status === "fulfilled"
          ? topCompaniesResult.value
          : [],
      featuredNews:
        newsResult.status === "fulfilled"
          ? newsResult.value.news.map(mapArticle)
          : [],
    };
  });
}

export async function searchStocks(query: string, limit = 6) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const result = await getCachedValue({
    cacheName: "yahoo-search",
    key: `${normalizedQuery}:${limit}`,
    ttlMs: stockSearchCacheTtlMs,
    loader: () =>
      yahooFinance.search(normalizedQuery, {
        quotesCount: limit,
        newsCount: 0,
        enableCb: false,
        enableNavLinks: false,
        enableFuzzyQuery: true,
        region: defaultRegion,
        lang: defaultLanguage,
      }),
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
    normalizedSymbols.map((symbol) => getCachedQuote(symbol)),
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

  return getCachedYahooValue(
    "stock-detail",
    `${normalizedSymbol}:${range}`,
    async () => {
      try {
        const [quote, chartPoints, searchResult] = await Promise.all([
          getCachedQuote(normalizedSymbol),
          getChartPointsForRange(normalizedSymbol, range),
          yahooFinance.search(normalizedSymbol, {
            quotesCount: 4,
            newsCount: 8,
            enableCb: false,
            enableNavLinks: false,
            region: defaultRegion,
            lang: defaultLanguage,
          }),
        ]);

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
            "dividendYield" in quote &&
            typeof quote.dividendYield === "number"
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
    },
  );
}
