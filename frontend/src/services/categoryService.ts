import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`, { cache: "no-store" });
  return await res.json();
}

export async function createCategory(data: { name: string; parentId?: number }) {
  const res = await apiFetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteCategory(id: number) {
  const res = await apiFetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
  return await res.json();
}

export async function updateCategory(id: number, data: { name?: string }) {
  const res = await apiFetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}
