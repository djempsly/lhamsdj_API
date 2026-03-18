import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AddressInput {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export async function getAddresses() {
  const res = await apiFetch(`${API_URL}/addresses`, { cache: "no-store" });
  return await res.json();
}

export async function createAddress(data: AddressInput) {
  const res = await apiFetch(`${API_URL}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteAddress(id: number) {
  try {
    const res = await apiFetch(`${API_URL}/addresses/${id}`, { method: "DELETE" });
    return await res.json();
  } catch {
    return { success: false };
  }
}
