export const stockChartRanges = {
  "1d": {
    label: "1D",
    lookbackDays: 1,
    interval: "5m",
  },
  "5d": {
    label: "5D",
    lookbackDays: 5,
    interval: "1h",
  },
  "1mo": {
    label: "1M",
    lookbackDays: 30,
    interval: "1d",
  },
  "3mo": {
    label: "3M",
    lookbackDays: 90,
    interval: "1d",
  },
  "6mo": {
    label: "6M",
    lookbackDays: 180,
    interval: "1d",
  },
  "1y": {
    label: "1Y",
    lookbackDays: 365,
    interval: "1wk",
  },
} as const;

export type StockChartRange = keyof typeof stockChartRanges;

export type StockQuoteCard = {
  symbol: string;
  name: string;
  exchange: string | null;
  currency: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap: number | null;
  marketState: string | null;
  updatedAt: string | null;
};

export type StockMover = StockQuoteCard & {
  dayChart: StockChartPoint[];
};

export type StockListCard = StockQuoteCard & {
  dayChart: StockChartPoint[];
};

export type StockNewsArticle = {
  id: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: string | null;
  thumbnailUrl: string | null;
  relatedTickers: string[];
};

export type StockSearchResult = {
  symbol: string;
  name: string;
  exchange: string | null;
  type: string;
  sector: string | null;
  industry: string | null;
};

export type StockChartPoint = {
  date: string;
  close: number;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
};

export type StockDetail = {
  symbol: string;
  name: string;
  exchange: string | null;
  currency: string | null;
  marketState: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  previousClose: number | null;
  open: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  averageVolume: number | null;
  marketCap: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  dividendYield: number | null;
  updatedAt: string | null;
  chartRange: StockChartRange;
  chartInterval: (typeof stockChartRanges)[StockChartRange]["interval"];
  chartPoints: StockChartPoint[];
  news: StockNewsArticle[];
};

export type HomePageMarketData = {
  gainers: StockMover[];
  losers: StockMover[];
  topCompanies: StockMover[];
  featuredNews: StockNewsArticle[];
};
