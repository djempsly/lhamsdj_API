const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllUsers() {
  const res = await fetch(`${API_URL}/users`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return await res.json();
}

export async function toggleUserStatus(id: number, isActive: boolean) {
  const res = await fetch(`${API_URL}/users/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
    credentials: "include",
  });
  return await res.json();
}

export async function getAllOrders() {
  const res = await fetch(`${API_URL}/orders/admin/all`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return await res.json();
}

export async function updateOrderStatus(id: number, status: string) {
  const res = await fetch(`${API_URL}/orders/admin/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  return await res.json();
}

export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/stats/dashboard`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return await res.json();
}

export async function getVendors(params?: { page?: number; limit?: number; status?: string }) {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.status) sp.set("status", params.status);
  const res = await fetch(`${API_URL}/vendors/admin/all?${sp}`, { credentials: "include", cache: "no-store" });
  return await res.json();
}

export async function updateVendorStatus(id: number, data: { status?: string; commissionRate?: number }) {
  const res = await fetch(`${API_URL}/vendors/admin/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return await res.json();
}

export async function getCoupons() {
  const res = await fetch(`${API_URL}/coupons`, { credentials: "include", cache: "no-store" });
  return await res.json();
}

export async function createCoupon(body: { code: string; type: string; value: number; minPurchase?: number; maxUses?: number; expiresAt?: string }) {
  const res = await fetch(`${API_URL}/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return await res.json();
}

export async function toggleCoupon(id: number) {
  const res = await fetch(`${API_URL}/coupons/${id}/toggle`, { method: "PATCH", credentials: "include" });
  return await res.json();
}

export async function deleteCoupon(id: number) {
  const res = await fetch(`${API_URL}/coupons/${id}`, { method: "DELETE", credentials: "include" });
  return await res.json();
}

export async function getSuppliers() {
  const res = await fetch(`${API_URL}/suppliers`, { credentials: "include", cache: "no-store" });
  return await res.json();
}

export async function getSupplier(id: number) {
  const res = await fetch(`${API_URL}/suppliers/${id}`, { credentials: "include", cache: "no-store" });
  return await res.json();
}

export async function createSupplier(body: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return await res.json();
}

export async function updateSupplier(id: number, body: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/suppliers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return await res.json();
}

export async function getAdapterTypes() {
  const res = await fetch(`${API_URL}/suppliers/adapter-types`, { credentials: "include", cache: "no-store" });
  return await res.json();
}

export async function testSupplierConnection(id: number) {
  const res = await fetch(`${API_URL}/suppliers/${id}/test`, { method: "POST", credentials: "include" });
  return await res.json();
}

export async function getAuditLogs(params?: { page?: number; limit?: number; action?: string; entity?: string }) {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.action) sp.set("action", params.action);
  if (params?.entity) sp.set("entity", params.entity);
  const res = await fetch(`${API_URL}/audit?${sp}`, { credentials: "include", cache: "no-store" });
  return await res.json();
}

export async function downloadOrdersCsv() {
  const res = await fetch(`${API_URL}/orders/admin/export?format=csv`, { credentials: "include" });
  if (!res.ok) throw new Error("Error al exportar");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function linkProductToSupplier(supplierId: number, body: { productId: number; externalSku: string; externalPrice: number }) {
  const res = await fetch(`${API_URL}/suppliers/${supplierId}/link-product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: body.productId,
      supplierSku: body.externalSku,
      supplierPrice: body.externalPrice,
    }),
    credentials: "include",
  });
  return await res.json();
}

export async function unlinkProductFromSupplier(supplierId: number, productId: number) {
  const res = await fetch(`${API_URL}/suppliers/${supplierId}/unlink-product/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return await res.json();
}

export async function importSupplierProducts(supplierId: number) {
  const res = await fetch(`${API_URL}/suppliers/${supplierId}/import`, {
    method: "POST",
    credentials: "include",
  });
  return await res.json();
}

export async function getSupplierOrders(supplierId: number) {
  const res = await fetch(`${API_URL}/suppliers/${supplierId}/orders`, {
    credentials: "include",
    cache: "no-store",
  });
  return await res.json();
}

export async function fulfillOrder(orderId: number) {
  const res = await fetch(`${API_URL}/suppliers/fulfill/${orderId}`, {
    method: "POST",
    credentials: "include",
  });
  return await res.json();
}

export async function getShipments() {
  const res = await fetch(`${API_URL}/shipments/admin/all`, {
    credentials: "include",
    cache: "no-store",
  });
  return await res.json();
}

export async function updateShipmentStatus(id: number, status: string) {
  const res = await fetch(`${API_URL}/shipments/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  return await res.json();
}

export async function syncCurrencyRates() {
  const res = await fetch(`${API_URL}/currencies/sync`, {
    method: "POST",
    credentials: "include",
  });
  return await res.json();
}

export async function seedCountries() {
  const res = await fetch(`${API_URL}/currencies/seed-countries`, {
    method: "POST",
    credentials: "include",
  });
  return await res.json();
}

export async function processVendorPayouts() {
  const res = await fetch(`${API_URL}/vendor-payouts/process`, {
    method: "POST",
    credentials: "include",
  });
  return await res.json();
}
