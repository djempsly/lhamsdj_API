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

/**
 * Wrapper around fetch that auto-refreshes the access token on 401
 * and retries the original request once.
 */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const opts: RequestInit = { ...init, credentials: "include" };
  let res = await fetch(input, opts);

  if (res.status === 401) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      res = await fetch(input, opts);
    }
  }

  return res;
}
