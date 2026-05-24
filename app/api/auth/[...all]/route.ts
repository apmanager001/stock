import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const handlers = toNextJsHandler(auth);

async function runAuthHandler(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  request: Request,
) {
  try {
    return await handlers[method](request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication request failed.";

    return Response.json({ error: message }, { status: 503 });
  }
}

export function GET(request: Request) {
  return runAuthHandler("GET", request);
}

export function POST(request: Request) {
  return runAuthHandler("POST", request);
}

export function PATCH(request: Request) {
  return runAuthHandler("PATCH", request);
}

export function PUT(request: Request) {
  return runAuthHandler("PUT", request);
}

export function DELETE(request: Request) {
  return runAuthHandler("DELETE", request);
}
