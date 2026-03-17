import { apiFetch } from "@/lib/apiFetch";
import { Product } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProductSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  order?: "asc" | "desc";
}

export async function getProducts(params: ProductSearchParams = {}): Promise<{
  data: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
}> {
  try {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.categoryId) searchParams.set("categoryId", String(params.categoryId));
    if (params.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
    if (params.inStock) searchParams.set("inStock", "true");
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.order) searchParams.set("order", params.order);

    const res = await fetch(`${API_URL}/products?${searchParams.toString()}`, { cache: "no-store" });
    if (!res.ok) return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };

    const json = await res.json();
    return { data: json.data || [], pagination: json.pagination };
  } catch {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
  }
}

export async function getBestSellers() {
  try {
    const res = await fetch(`${API_URL}/products/best-sellers`, { cache: "no-store" });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function getProductById(id: number) {
  try {
    const res = await fetch(`${API_URL}/products/id/${id}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json.success) return null;
    return json.data;
  } catch {
    return null;
  }
}

export async function createProduct(data: any) {
  try {
    const res = await apiFetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Connection error" };
  }
}

export async function updateProduct(id: number, data: any) {
  try {
    const res = await apiFetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Connection error" };
  }
}

export async function deleteProduct(id: number) {
  try {
    const res = await apiFetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch {
    return { success: false, message: "Connection error" };
  }
}

export async function duplicateProduct(id: number) {
  try {
    const res = await apiFetch(`${API_URL}/products/${id}/duplicate`, { method: "POST" });
    return await res.json();
  } catch {
    return { success: false, message: "Connection error" };
  }
}

export async function bulkProductAction(ids: number[], action: string, params: any = {}) {
  try {
    const res = await apiFetch(`${API_URL}/products/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action, params }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Connection error" };
  }
}

export async function getLowStockProducts(threshold: number = 5) {
  try {
    const res = await apiFetch(`${API_URL}/products/low-stock?threshold=${threshold}`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}

export async function getProductAnalytics(id: number) {
  try {
    const res = await apiFetch(`${API_URL}/products/${id}/analytics`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function getProductPriceHistory(id: number) {
  try {
    const res = await apiFetch(`${API_URL}/products/${id}/price-history`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}

export async function reorderProductImages(productId: number, imageIds: number[]) {
  try {
    const res = await apiFetch(`${API_URL}/products/${productId}/images/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageIds }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function setProductTags(productId: number, tagIds: number[]) {
  try {
    const res = await apiFetch(`${API_URL}/products/${productId}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function searchTags(query: string) {
  try {
    const res = await apiFetch(`${API_URL}/admin/tags?search=${encodeURIComponent(query)}`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}

export async function createTag(name: string) {
  try {
    const res = await apiFetch(`${API_URL}/admin/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function exportProductsCsv() {
  try {
    const res = await apiFetch(`${API_URL}/products/export`);
    if (!res.ok) throw new Error("Export error");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    throw new Error("Export error");
  }
}

export async function getReviewsAdmin(params?: { status?: string; page?: number; limit?: number }) {
  try {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    const res = await apiFetch(`${API_URL}/reviews/admin?${sp}`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [], pagination: { page: 1, total: 0, totalPages: 0 } };
  }
}

export async function moderateReview(id: number, status: 'APPROVED' | 'REJECTED') {
  try {
    const res = await apiFetch(`${API_URL}/reviews/admin/${id}/moderate`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}
