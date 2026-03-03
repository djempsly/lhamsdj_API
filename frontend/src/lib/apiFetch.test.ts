import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "./apiFetch";

vi.mock("./csrf", () => ({
  getCsrfHeaders: vi.fn().mockResolvedValue({ "X-Csrf-Token": "mock-csrf" }),
  clearCsrfCache: vi.fn(),
}));

describe("apiFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds credentials include to requests", async () => {
    const mockRes = new Response(JSON.stringify({ ok: true }), { status: 200 });
    global.fetch = vi.fn().mockResolvedValue(mockRes);

    await apiFetch("http://localhost:4000/api/v1/auth/me", { method: "GET" });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/auth/me",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("adds X-Csrf-Token for POST requests", async () => {
    const mockRes = new Response(JSON.stringify({}), { status: 200 });
    global.fetch = vi.fn().mockResolvedValue(mockRes);

    await apiFetch("http://localhost:4000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/auth/login",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-Csrf-Token": "mock-csrf" }),
        credentials: "include",
      }),
    );
  });

  it("returns synthetic response on network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const res = await apiFetch("http://localhost:4000/api/v1/categories");
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/connection/i);
  });
});
