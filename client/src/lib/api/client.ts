import { ApiError } from "./error";

interface ApiFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string> | Headers;
}

/**
 * Client-side fetch helper for browser interactions and TanStack React Query.
 * Calls same-origin /api/... route which Next.js proxies to the Express backend.
 */
export async function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const headers = new Headers(options?.headers);
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

  const response = await fetch(normalizedPath, {
    ...options,
    credentials: "include",
    headers,
    body,
  });

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message = json?.message || response.statusText || "Request failed";
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
