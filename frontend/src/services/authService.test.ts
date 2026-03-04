import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser, forgotPassword } from "@/services/authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

vi.mock("@/lib/csrf", () => ({
  getCsrfHeaders: vi.fn().mockResolvedValue({ "X-Csrf-Token": "mock-csrf" }),
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("loginUser sends POST with email and password", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true, user: { role: "USER" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await loginUser({ email: "u@test.com", password: "secret" });
    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "u@test.com", password: "secret" }),
      }),
    );
  });

  it("loginUser returns error message on failed response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await loginUser({ email: "u@test.com", password: "wrong" });
    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid credentials");
  });

  it("forgotPassword sends POST with email", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    await forgotPassword("recover@test.com");
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/forgot-password`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "recover@test.com" }),
      }),
    );
  });

  it("loginUser returns connection error on fetch throw", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
    const result = await loginUser({ email: "u@test.com", password: "x" });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/conexión|servidor|connection/i);
  });
});
