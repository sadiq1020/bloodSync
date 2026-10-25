import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { ApiError } from "./error";
import type { CurrentUser } from "@/types";

interface ServerFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string> | Headers;
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

/**
 * Server-side fetch helper for App Router Server Components, Layouts, and Server Actions.
 * Automatically forwards the browser session cookie to the Express backend.
 */
export async function serverFetch<T>(
  path: string,
  options?: ServerFetchOptions
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${BACKEND_URL}${normalizedPath}`;

  const headers = new Headers(options?.headers);
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  let body = options?.body;
  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams)
  ) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: options?.cache ?? "no-store",
    body,
  });

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.message || response.statusText || "Server request failed";
    throw new ApiError(response.status, message, json?.errors);
  }

  if (json && typeof json === "object" && "success" in json) {
    if ("meta" in json) {
      return { data: json.data, meta: json.meta } as unknown as T;
    }
    if ("data" in json) {
      return json.data as T;
    }
  }

  return json as T;
}

/**
 * Retrieves the currently authenticated user with their donor status.
 * Wrapped in React cache() so it deduplicates within a single render pass.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    return await serverFetch<CurrentUser>("/api/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    // Return null for unauthenticated sessions
    return null;
  }
});
