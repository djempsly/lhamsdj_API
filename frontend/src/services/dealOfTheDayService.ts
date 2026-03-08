const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type DealProduct = {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  description?: string | null;
  image: string | null;
};

export async function getDealOfTheDay(): Promise<DealProduct[]> {
  try {
    const res = await fetch(`${API_URL}/marketplace/deal-of-the-day`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}
