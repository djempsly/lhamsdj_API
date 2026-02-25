const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMyOrders() {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    return await res.json();
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createOrder(addressId: number) {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}
