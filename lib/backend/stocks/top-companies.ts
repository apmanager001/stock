import "server-only";
import { connectMongoose } from "@/lib/backend/mongoose/connection";
import { HomePageTopCompaniesModel } from "@/lib/backend/mongoose/schemas/home-page-top-companies";
import {
  defaultTopCompanySymbols,
  normalizeTopCompanySymbols,
} from "@/lib/stocks/top-companies";

async function getTopCompaniesDocument() {
  await connectMongoose();

  const existingDocument = await HomePageTopCompaniesModel.findOne().sort({
    createdAt: 1,
  });

  if (existingDocument) {
    return existingDocument;
  }

  return HomePageTopCompaniesModel.create({
    tickers: [...defaultTopCompanySymbols],
  });
}

export async function getHomePageTopCompanySymbols() {
  const document = await getTopCompaniesDocument();
  const currentTickers = Array.isArray(document.tickers)
    ? document.tickers
    : [];
  const normalizedTickers = normalizeTopCompanySymbols(currentTickers);

  if (currentTickers.join(",") !== normalizedTickers.join(",")) {
    document.tickers = normalizedTickers;
    await document.save();
  }

  return normalizedTickers;
}

export async function saveHomePageTopCompanySymbols(symbols: string[]) {
  await connectMongoose();

  const normalizedTickers = normalizeTopCompanySymbols(symbols);
  const existingDocument = await HomePageTopCompaniesModel.findOne().sort({
    createdAt: 1,
  });

  if (existingDocument) {
    existingDocument.tickers = normalizedTickers;
    await existingDocument.save();
    return normalizedTickers;
  }

  const createdDocument = await HomePageTopCompaniesModel.create({
    tickers: normalizedTickers,
  });

  return normalizeTopCompanySymbols(createdDocument.tickers ?? []);
}
