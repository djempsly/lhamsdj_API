import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getSalesAnalytics(period?: string) {
  try {
    const sp = period ? `?period=${period}` : "";
    const res = await apiFetch(`${API_URL}/analytics/sales${sp}`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function getProductAnalytics() {
  try {
    const res = await apiFetch(`${API_URL}/analytics/products`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}

export async function getUserAnalytics() {
  try {
    const res = await apiFetch(`${API_URL}/analytics/users`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function exportAnalyticsReport(format: string = "json") {
  try {
    const res = await apiFetch(`${API_URL}/analytics/export?format=${format}`, { cache: "no-store" });
    if (format === "csv") {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    }
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function getTaxRules() {
  try {
    const res = await apiFetch(`${API_URL}/analytics/tax/rules`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}

export async function createTaxRule(data: { country: string; state?: string; taxRate: number; name: string }) {
  try {
    const res = await apiFetch(`${API_URL}/analytics/tax/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function updateTaxRule(id: number, data: { taxRate?: number; name?: string; isActive?: boolean }) {
  try {
    const res = await apiFetch(`${API_URL}/analytics/tax/rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function deleteTaxRule(id: number) {
  try {
    const res = await apiFetch(`${API_URL}/analytics/tax/rules/${id}`, { method: "DELETE" });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function calculateTax(country: string, state: string, subtotal: number) {
  try {
    const res = await fetch(`${API_URL}/analytics/tax/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, state, subtotal }),
    });
    return await res.json();
  } catch {
    return { success: false, data: { taxRate: 0, taxAmount: 0, taxName: "No tax" } };
  }
}

export async function recordCookieConsent(consent: { analytics: boolean; marketing: boolean; functional: boolean }) {
  try {
    await fetch(`${API_URL}/analytics/cookie-consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
      credentials: "include",
    });
  } catch {
    // Silent — consent recording should not block UX
  }
}

export async function validateGiftCard(code: string) {
  try {
    const res = await apiFetch(`${API_URL}/marketplace/gift-cards/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Connection error" };
  }
}

export async function getLoyaltyProfile() {
  try {
    const res = await apiFetch(`${API_URL}/marketplace/loyalty/profile`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function getLoyaltyHistory() {
  try {
    const res = await apiFetch(`${API_URL}/marketplace/loyalty/history`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}

export async function redeemLoyaltyPoints(points: number) {
  try {
    const res = await apiFetch(`${API_URL}/marketplace/loyalty/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function generateReferralCode() {
  try {
    const res = await apiFetch(`${API_URL}/marketplace/loyalty/referral-code`, { method: "POST" });
    return await res.json();
  } catch {
    return { success: false };
  }
}
