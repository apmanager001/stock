import { InferSchemaType, Schema, model, models } from "mongoose";

const watchlistItemSchema = new Schema(
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
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const stockWatchlistSchema = new Schema(
  {
    authUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    items: {
      type: [watchlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export type StockWatchlist = InferSchemaType<typeof stockWatchlistSchema>;
export type StockWatchlistItem = InferSchemaType<typeof watchlistItemSchema>;

export const StockWatchlistModel =
  models.StockWatchlist || model("StockWatchlist", stockWatchlistSchema);
