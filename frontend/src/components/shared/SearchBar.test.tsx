import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders search input with placeholder from translations", () => {
    render(<SearchBar />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "placeholder");
  });

  it("clears query when clear button is clicked", () => {
    render(<SearchBar />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test" } });
    expect(input).toHaveValue("test");
    const clearBtn = screen.getAllByRole("button").find((b) => (b as HTMLButtonElement).type === "button");
    if (clearBtn) fireEvent.click(clearBtn);
    expect(input).toHaveValue("");
  });

  it("fetches autocomplete when query length >= 2 after debounce", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { products: [{ id: 1, name: "Product A", price: "10", slug: "product-a", images: [{ url: "/a.jpg" }] }], categories: [] },
        }),
        { headers: { "Content-Type": "application/json" } },
      ) as Response,
    );

    render(<SearchBar />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "ab" } });

    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("search/autocomplete?q=ab"),
          expect.any(Object),
        );
      },
      { timeout: 800 },
    );
  });
});
