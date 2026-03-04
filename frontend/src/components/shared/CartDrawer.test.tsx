import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CartDrawer from "./CartDrawer";

vi.mock("@/services/cartService", () => ({
  getCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
}));

const cartService = await import("@/services/cartService");

describe("CartDrawer", () => {
  beforeEach(() => {
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: { items: [] },
    });
  });

  it("renders nothing when closed", () => {
    const { container } = render(<CartDrawer />);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it("opens and shows empty state when cart-drawer-open is dispatched", async () => {
    render(
      <>
        <div id="app-wrapper" />
        <CartDrawer />
      </>,
    );
    window.dispatchEvent(
      new CustomEvent("cart-drawer-open", { detail: { mode: "full" } }),
    );

    await screen.findByRole("dialog");
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("shows close button and closes when close is clicked", async () => {
    render(
      <>
        <div id="app-wrapper" />
        <CartDrawer />
      </>,
    );
    window.dispatchEvent(
      new CustomEvent("cart-drawer-open", { detail: { mode: "full" } }),
    );

    await screen.findByRole("dialog");
    const closeBtn = screen.getByRole("button", { name: "close" });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
