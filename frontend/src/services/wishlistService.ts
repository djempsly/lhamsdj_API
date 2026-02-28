import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getWishlist() {
  try {
    const res = await apiFetch(`${API_URL}/wishlist`, { cache: "no-store" });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}

export async function toggleWishlist(productId: number) {
  try {
    const res = await apiFetch(`${API_URL}/wishlist/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    return await res.json();
  } catch { return { success: false }; }
}

export async function checkWishlist(productId: number) {
  try {
    const res = await apiFetch(`${API_URL}/wishlist/check/${productId}`);
    return await res.json();
  } catch { return { success: false, data: { inWishlist: false } }; }
}
