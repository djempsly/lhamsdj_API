import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMyOrders() {
  try {
    const res = await apiFetch(`${API_URL}/orders`, { method: "GET", cache: "no-store" });
    return await res.json();
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createOrder(addressId: number) {
  try {
    const res = await apiFetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Connection error" };
  }
}

export async function getOrderById(id: number) {
  try {
    const res = await apiFetch(`${API_URL}/orders/${id}`, { cache: "no-store" });
    return await res.json();
  } catch (error) {
    return { success: false };
  }
}
