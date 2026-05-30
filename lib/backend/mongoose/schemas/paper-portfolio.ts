import { InferSchemaType, Schema, model, models } from "mongoose";

const paperTradeSchema = new Schema(
  {
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    side: {
      type: String,
      required: true,
      enum: ["BUY", "SELL"],
    },
    shares: {
      type: Number,
      required: true,
      min: 0.0001,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const paperPortfolioSchema = new Schema(
  {
    authUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    startingCash: {
      type: Number,
      default: 1000,
      min: 0,
    },
    cashBalance: {
      type: Number,
      default: 1000,
      min: 0,
    },
    transactions: {
      type: [paperTradeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export type PaperPortfolio = InferSchemaType<typeof paperPortfolioSchema>;
export type PaperTrade = InferSchemaType<typeof paperTradeSchema>;

export const PaperPortfolioModel =
  models.PaperPortfolio || model("PaperPortfolio", paperPortfolioSchema);
