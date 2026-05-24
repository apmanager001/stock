import mongoose from "mongoose";
import { getMongoDatabaseName } from "@/lib/backend/mongodb/client";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

type GlobalMongooseCache = typeof globalThis & {
  __mongooseCache?: MongooseCache;
};

const globalMongoose = globalThis as GlobalMongooseCache;

const mongooseCache = globalMongoose.__mongooseCache ?? {
  conn: null,
  promise: null,
};

globalMongoose.__mongooseCache = mongooseCache;

export async function connectMongoose() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env before using Mongoose.",
    );
  }

  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  if (!mongooseCache.promise) {
    mongooseCache.promise = mongoose
      .connect(mongoUri, {
        dbName: getMongoDatabaseName(),
        autoIndex: process.env.NODE_ENV !== "production",
      })
      .then((instance) => instance);
  }

  mongooseCache.conn = await mongooseCache.promise;
  return mongooseCache.conn;
}
