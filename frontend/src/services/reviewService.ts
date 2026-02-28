import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProductReviews(productId: number) {
  try {
    const res = await fetch(`${API_URL}/reviews/product/${productId}`, { cache: "no-store" });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}

export async function createReview(data: { productId: number; rating: number; comment?: string }) {
  const res = await apiFetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteReview(id: number) {
  const res = await apiFetch(`${API_URL}/reviews/${id}`, { method: "DELETE" });
  return await res.json();
}
