"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { authClient, type AuthSession } from "@/lib/auth/client";

export const authSessionQueryKey = ["auth", "session"] as const;

async function fetchAuthSession(): Promise<AuthSession | null> {
  try {
    const result = await authClient.getSession();

    if (result.error) {
      if (
        result.error.status === 401 ||
        result.error.status === 404 ||
        result.error.status === 503
      ) {
        return null;
      }

      throw new Error(result.error.message || "Unable to fetch session.");
    }

    return result.data ?? null;
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }

    throw new Error("Unable to fetch session.");
  }
}

export const authSessionQueryOptions = queryOptions({
  queryKey: authSessionQueryKey,
  queryFn: fetchAuthSession,
  retry: false,
  staleTime: 60_000,
});

export function useAuthSessionQuery() {
  return useQuery(authSessionQueryOptions);
}