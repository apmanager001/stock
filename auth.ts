import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import {
  connectMongoClient,
  getMongoClient,
  getMongoDatabase,
} from "./lib/backend/mongodb/client";

const fallbackAuthSecret =
  "foundry-stack-dev-secret-change-me-before-production-2026";

const mongoClient = getMongoClient();

void connectMongoClient();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? fallbackAuthSecret,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"],
  database: mongodbAdapter(getMongoDatabase(), {
    client: mongoClient,
    usePlural: true,
    transaction: false,
  }),
  user: {
    additionalFields: {
      admin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
