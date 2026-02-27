const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getOrderShipments(orderId: number) {
  try {
    const res = await fetch(`${API_URL}/shipments/order/${orderId}`, {
      credentials: "include",
      cache: "no-store",
    });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}

export async function trackShipment(trackingNumber: string) {
  try {
    const res = await fetch(`${API_URL}/shipping/track/${trackingNumber}`, {
      credentials: "include",
      cache: "no-store",
    });
    return await res.json();
  } catch { return { success: false }; }
}
