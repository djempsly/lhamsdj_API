const API_URL = process.env.NEXT_PUBLIC_API_URL;

import { getCsrfHeaders, clearCsrfCache } from "./csrf";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const csrfHeaders = await getCsrfHeaders();
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { ...csrfHeaders },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function refreshOnce(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = doRefresh().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });
  return refreshPromise;
}

const EMPTY_RESPONSE = () =>
  new Response(JSON.stringify({ success: false, message: "Connection error" }), {
    status: 0,
    headers: { "Content-Type": "application/json" },
  });

const MUTATION_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

/**
 * Wrapper around fetch that:
 * - Adds X-Csrf-Token for mutation methods (POST/PUT/PATCH/DELETE) when calling our API.
 * - Auto-refreshes the access token on 401 and retries the original request once.
 * - Returns a synthetic error response on network failure instead of throwing.
 */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const opts: RequestInit = { ...init, credentials: "include" };

  if (MUTATION_METHODS.includes(method)) {
    try {
      const csrfHeaders = await getCsrfHeaders();
      opts.headers = { ...csrfHeaders, ...(opts.headers as Record<string, string>) };
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: "CSRF token unavailable" }),
        { status: 0, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  let res: Response;
  try {
    res = await fetch(input, opts);
  } catch {
    return EMPTY_RESPONSE();
  }

  if (res.status === 403 && res.headers.get("content-type")?.includes("json")) {
    try {
      const body = await res.clone().json();
      if (body?.message?.toLowerCase().includes("csrf")) {
        clearCsrfCache();
      }
    } catch {
      // ignore
    }
  }

  if (res.status === 401) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      if (MUTATION_METHODS.includes(method)) {
        try {
          const csrfHeaders = await getCsrfHeaders();
          opts.headers = { ...csrfHeaders, ...(opts.headers as Record<string, string>) };
        } catch {
          return res;
        }
      }
      try {
        res = await fetch(input, opts);
      } catch {
        return EMPTY_RESPONSE();
      }
    }
  }

  return res;
}
