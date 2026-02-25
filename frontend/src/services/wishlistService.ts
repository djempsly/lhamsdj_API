const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getWishlist() {
  try {
    const res = await fetch(`${API_URL}/wishlist`, { credentials: "include", cache: "no-store" });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}

export async function toggleWishlist(productId: number) {
  try {
    const res = await fetch(`${API_URL}/wishlist/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      credentials: "include",
    });
    return await res.json();
  } catch { return { success: false }; }
}

export async function checkWishlist(productId: number) {
  try {
    const res = await fetch(`${API_URL}/wishlist/check/${productId}`, { credentials: "include" });
    return await res.json();
  } catch { return { success: false, data: { inWishlist: false } }; }
}
