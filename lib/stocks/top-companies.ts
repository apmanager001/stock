import { z } from "zod";

export const topCompanyTickerLimit = 6;

export const defaultTopCompanySymbols = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "META",
] as const;

const topCompanyTickerSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z][A-Z0-9.-]{0,9}$/, "Use valid stock tickers only.");

const topCompanySymbolsSchema = z
  .array(topCompanyTickerSchema)
  .max(topCompanyTickerLimit, `Add up to ${topCompanyTickerLimit} tickers.`);

export function normalizeTopCompanySymbols(symbols: string[]) {
  return Array.from(
    new Set(
      symbols
        .map((symbol) => symbol.trim().toUpperCase())
        .filter((symbol) => symbol.length > 0),
    ),
  );
}

export function parseTopCompanySymbolsInput(input: string) {
  const parsedSymbols = normalizeTopCompanySymbols(input.split(/[\s,]+/));
  return topCompanySymbolsSchema.parse(parsedSymbols);
}

export function formatTopCompanySymbolsInput(symbols: string[]) {
  return normalizeTopCompanySymbols(symbols).join("\n");
}
