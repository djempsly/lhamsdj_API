const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export async function getCurrencies(): Promise<{ success: boolean; data: Currency[] }> {
  try {
    const res = await fetch(`${API_URL}/currencies`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}

export async function detectCurrency(countryCode: string) {
  try {
    const res = await fetch(`${API_URL}/currencies/detect?country=${encodeURIComponent(countryCode)}`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: { country: "US", currency: "USD", rate: 1, symbol: "$" } };
  }
}

export async function convertCurrency(amount: number, from: string, to: string) {
  try {
    const res = await fetch(`${API_URL}/currencies/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, from, to }),
    });
    return await res.json();
  } catch {
    return { success: false, data: { amount, currency: from, rate: 1 } };
  }
}

export async function getCountries() {
  try {
    const res = await fetch(`${API_URL}/currencies/countries`, { cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, data: [] };
  }
}
