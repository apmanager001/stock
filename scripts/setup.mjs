import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const envExamplePath = path.join(projectRoot, ".env.example");
const envPath = path.join(projectRoot, ".env");

const placeholderSecret = "replace-with-a-32-character-secret";
const generatedSecret = randomBytes(32).toString("base64url");

if (!existsSync(envExamplePath)) {
  throw new Error(".env.example was not found in the project root.");
}

let envContent = existsSync(envPath)
  ? readFileSync(envPath, "utf8")
  : readFileSync(envExamplePath, "utf8");

if (!envContent.includes("BETTER_AUTH_SECRET=")) {
  envContent = `${envContent.trim()}\nBETTER_AUTH_SECRET=${generatedSecret}\n`;
}

envContent = envContent.replace(
  /^BETTER_AUTH_SECRET=.*$/m,
  (line) =>
    line.endsWith(placeholderSecret) || line === "BETTER_AUTH_SECRET="
      ? `BETTER_AUTH_SECRET=${generatedSecret}`
      : line,
);

writeFileSync(envPath, `${envContent.trim()}\n`, "utf8");

console.log("Created or updated .env for local development.");
console.log("Next steps:");
console.log("  1. npm run db:up");
console.log("  2. npm run dev");
console.log("  3. Replace NEXT_PUBLIC_GA_ID and GOOGLE_SITE_VERIFICATION when ready");