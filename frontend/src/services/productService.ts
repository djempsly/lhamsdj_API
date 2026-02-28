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
