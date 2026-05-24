import { MongoClient } from "mongodb";

type GlobalMongoCache = typeof globalThis & {
  __mongoClient?: MongoClient;
  __mongoClientPromise?: Promise<MongoClient>;
};

const globalMongo = globalThis as GlobalMongoCache;

export function getMongoUri() {
  return process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
}

export function getMongoDatabaseName() {
  return process.env.MONGODB_DB_NAME ?? "foundry_stack";
}

function createMongoClient() {
  return new MongoClient(getMongoUri());
}

export function getMongoClient() {
  if (!globalMongo.__mongoClient) {
    globalMongo.__mongoClient = createMongoClient();
  }

  return globalMongo.__mongoClient;
}

export function connectMongoClient() {
  if (!globalMongo.__mongoClientPromise) {
    globalMongo.__mongoClientPromise = getMongoClient().connect().catch((error) => {
      globalMongo.__mongoClientPromise = undefined;
      throw error;
    });
  }

  return globalMongo.__mongoClientPromise;
}

export function getMongoDatabase() {
  return getMongoClient().db(getMongoDatabaseName());
}