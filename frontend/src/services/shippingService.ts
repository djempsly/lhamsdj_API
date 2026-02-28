import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function estimateShipping(addressId: number) {
  try {
    const res = await apiFetch(`${API_URL}/shipping/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
    });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}

export async function estimateByCountry(countryCode: string, weightKg: number) {
  try {
    const res = await fetch(`${API_URL}/shipping/estimate-country`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode, weightKg }),
    });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}

export async function getPaymentMethods() {
  try {
    const res = await apiFetch(`${API_URL}/payments/methods`);
    return await res.json();
  } catch { return { success: false, data: { methods: [], country: "US", currency: "USD" } }; }
}

export async function validateCoupon(code: string, subtotal: number) {
  try {
    const res = await apiFetch(`${API_URL}/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal }),
    });
    return await res.json();
  } catch { return { success: false }; }
}
