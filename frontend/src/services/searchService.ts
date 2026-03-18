import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function searchAutocomplete(query: string) {
  try {
    if (query.length < 2) return { success: true, data: { products: [], categories: [] } };
    const res = await fetch(`${API_URL}/search/autocomplete?q=${encodeURIComponent(query)}`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: { products: [], categories: [] } };
  }
}

export async function getRecommendations(productId: number) {
  try {
    const res = await fetch(`${API_URL}/search/recommendations/${productId}`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}

export async function trackProductView(productId: number) {
  try {
    await apiFetch(`${API_URL}/search/track-view/${productId}`, { method: "POST" });
  } catch {
    // Silent — analytics should never block UX
  }
}

export async function getRecentlyViewed() {
  try {
    const res = await apiFetch(`${API_URL}/search/recently-viewed`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}
