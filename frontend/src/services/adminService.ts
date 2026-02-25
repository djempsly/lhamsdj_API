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
