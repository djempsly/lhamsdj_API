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

export async function registerVendor(data: { storeName: string; storeSlug: string; description?: string }) {
  const res = await fetch(`${API_URL}/vendors/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return await res.json();
}

export async function getMyVendorProfile() {
  try {
    const res = await fetch(`${API_URL}/vendors/me`, { credentials: "include", cache: "no-store" });
    return await res.json();
  } catch { return { success: false }; }
}

export async function updateVendorProfile(data: { storeName?: string; description?: string; logo?: string }) {
  const res = await fetch(`${API_URL}/vendors/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return await res.json();
}

export async function getVendorDashboard() {
  try {
    const res = await fetch(`${API_URL}/vendors/dashboard`, { credentials: "include", cache: "no-store" });
    return await res.json();
  } catch { return { success: false }; }
}

export async function getVendorShipments() {
  try {
    const res = await fetch(`${API_URL}/shipments/vendor/mine`, { credentials: "include", cache: "no-store" });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}

export async function updateShipmentTracking(id: number, data: { trackingNumber: string; carrier?: string }) {
  const res = await fetch(`${API_URL}/shipments/${id}/tracking`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return await res.json();
}

export async function createConnectAccount() {
  const res = await fetch(`${API_URL}/vendor-payouts/connect`, {
    method: "POST",
    credentials: "include",
  });
  return await res.json();
}

export async function getMyPayouts() {
  try {
    const res = await fetch(`${API_URL}/vendor-payouts/mine`, { credentials: "include", cache: "no-store" });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}
