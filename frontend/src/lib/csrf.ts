/**
 * CSRF token for same-origin/cookie-based API mutations.
 * Fetches token once from GET /auth/csrf (sets cookie server-side) and caches in memory.
 * Must be used for all POST/PUT/PATCH/DELETE to the app API when using credentials.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let cachedToken: string | null = null;

export function clearCsrfCache(): void {
  cachedToken = null;
}

/**
 * Returns current CSRF token; fetches from API if not cached.
 * Use before any mutation (POST/PUT/PATCH/DELETE) with credentials.
 */
export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await fetch(`${API_URL}/auth/csrf`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`CSRF fetch failed: ${res.status}`);
  }
  const data = await res.json();
  if (!data?.csrfToken) {
    throw new Error("Invalid CSRF response");
  }
  cachedToken = data.csrfToken;
  return cachedToken;
}

/**
 * Headers to attach to mutation requests for CSRF protection.
 */
export async function getCsrfHeaders(): Promise<Record<string, string>> {
  const token = await getCsrfToken();
  return { "X-Csrf-Token": token };
}
