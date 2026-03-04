import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCart, addToCart, updateCartItem, removeCartItem, getCartCount } from "./cartService";

vi.mock("@/lib/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

const { apiFetch } = await import("@/lib/apiFetch");

describe("cartService", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("getCart returns parsed data on success", async () => {
    const data = { items: [], total: 0 };
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await getCart();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
    expect(apiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/cart"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("getCart returns success false on failure", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 500 }),
    );

    const result = await getCart();
    expect(result.success).toBe(false);
  });

  it("addToCart sends POST with productId and quantity", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    await addToCart(10, 2, 5);
    expect(apiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/cart/items"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ productId: 10, quantity: 2, productVariantId: 5 }),
      }),
    );
  });

  it("updateCartItem sends PATCH with quantity", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    await updateCartItem(1, 3);
    expect(apiFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/cart\/items\/1$/),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ quantity: 3 }),
      }),
    );
  });

  it("removeCartItem sends DELETE", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    await removeCartItem(2);
    expect(apiFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/cart\/items\/2$/),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("getCartCount returns 0 when cart fails or has no items", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 401 }),
    );
    expect(await getCartCount()).toBe(0);
  });

  it("getCartCount returns sum of item quantities", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            items: [
              { id: 1, quantity: 2 },
              { id: 2, quantity: 1 },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    expect(await getCartCount()).toBe(3);
  });
});
