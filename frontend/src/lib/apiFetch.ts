const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
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

/**
 * Wrapper around fetch that auto-refreshes the access token on 401
 * and retries the original request once.
 * Returns a synthetic error response on network failure instead of throwing.
 */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const opts: RequestInit = { ...init, credentials: "include" };

  let res: Response;
  try {
    res = await fetch(input, opts);
  } catch {
    return EMPTY_RESPONSE();
  }

  if (res.status === 401) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      try {
        res = await fetch(input, opts);
      } catch {
        return EMPTY_RESPONSE();
      }
    }
  }

  return res;
}
