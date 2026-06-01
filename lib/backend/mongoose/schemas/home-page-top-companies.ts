import { InferSchemaType, Schema, model, models } from "mongoose";
import {
  defaultTopCompanySymbols,
  topCompanyTickerLimit,
} from "@/lib/stocks/top-companies";

const homePageTopCompaniesSchema = new Schema(
  {
    tickers: {
      type: [String],
      default: () => [...defaultTopCompanySymbols],
      validate: {
        validator(value: string[]) {
          return Array.isArray(value) && value.length <= topCompanyTickerLimit;
        },
        message: `Store up to ${topCompanyTickerLimit} top company tickers.`,
      },
    },
  },
  {
    timestamps: true,
  },
);

export type HomePageTopCompanies = InferSchemaType<
  typeof homePageTopCompaniesSchema
>;

export const HomePageTopCompaniesModel =
  models.HomePageTopCompanies ||
  model("HomePageTopCompanies", homePageTopCompaniesSchema);
