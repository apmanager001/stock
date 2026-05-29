import { MongoClient } from "mongodb";

type GlobalMongoCache = typeof globalThis & {
  __mongoClient?: MongoClient;
  __mongoClientPromise?: Promise<MongoClient>;
};

const globalMongo = globalThis as GlobalMongoCache;

function readMongoUriFromEnv() {
  return process.env.MONGODB_URI ?? process.env.mongodb_uri ?? null;
}

function readMongoDatabaseNameFromEnv() {
  return process.env.MONGODB_DB_NAME ?? process.env.mongodb_db_name ?? null;
}

function readMongoDatabaseNameFromUri() {
  try {
    const pathname = new URL(getMongoUri()).pathname.replace(/^\/+/, "");

    if (!pathname) {
      return null;
    }

    return decodeURIComponent(pathname.split("/")[0] ?? "") || null;
  } catch {
    throw new Error(
      "MongoDB connection string is invalid. Check MONGODB_URI or mongodb_uri.",
    );
  }
}

export function getMongoUri() {
  const mongoUri = readMongoUriFromEnv();

  if (!mongoUri) {
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI or mongodb_uri before using auth or database features.",
    );
  }

  return mongoUri;
}

export function getMongoDatabaseName() {
  const envDatabaseName = readMongoDatabaseNameFromEnv();

  if (envDatabaseName) {
    return envDatabaseName;
  }

  const databaseNameFromUri = readMongoDatabaseNameFromUri();

  if (databaseNameFromUri) {
    return databaseNameFromUri;
  }

  throw new Error(
    "MongoDB database name is not configured. Set MONGODB_DB_NAME or mongodb_db_name, or include a database name in MONGODB_URI.",
  );
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
    globalMongo.__mongoClientPromise = getMongoClient()
      .connect()
      .catch((error) => {
        globalMongo.__mongoClientPromise = undefined;
        throw error;
      });
  }

  return globalMongo.__mongoClientPromise;
}

export function getMongoDatabase() {
  return getMongoClient().db(getMongoDatabaseName());
}
