import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCsrfToken, getCsrfHeaders, clearCsrfCache } from "./csrf";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

describe("csrf", () => {
  beforeEach(() => {
    clearCsrfCache();
  });

  it("getCsrfToken fetches and caches token", async () => {
    const token = "abc123csrf";
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, csrfToken: token }),
    });

    const result = await getCsrfToken();
    expect(result).toBe(token);
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/csrf`,
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );

    const cached = await getCsrfToken();
    expect(cached).toBe(token);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("getCsrfHeaders returns X-Csrf-Token header", async () => {
    const token = "xyz789";
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, csrfToken: token }),
    });

    const headers = await getCsrfHeaders();
    expect(headers).toEqual({ "X-Csrf-Token": token });
  });

  it("getCsrfToken throws when response not ok", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false });
    await expect(getCsrfToken()).rejects.toThrow("CSRF fetch failed");
  });

  it("clearCsrfCache invalidates cache", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true, csrfToken: "first" }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true, csrfToken: "second" }) });

    const a = await getCsrfToken();
    expect(a).toBe("first");
    clearCsrfCache();
    const b = await getCsrfToken();
    expect(b).toBe("second");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
