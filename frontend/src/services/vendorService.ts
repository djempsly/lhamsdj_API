const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getVendorProfile(slug: string) {
  try {
    const res = await fetch(`${API_URL}/vendors/profile/${slug}`, { cache: "no-store" });
    return await res.json();
  } catch { return { success: false }; }
}

export async function getVendorProducts(vendorId: number, page = 1) {
  try {
    const res = await fetch(`${API_URL}/vendors/${vendorId}/products?page=${page}&limit=20`, { cache: "no-store" });
    return await res.json();
  } catch { return { success: false, data: [], pagination: null }; }
}
