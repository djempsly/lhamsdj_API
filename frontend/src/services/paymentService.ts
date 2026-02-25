const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createPaymentIntent(orderId: number) {
  const res = await fetch(`${API_URL}/payments/create-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
    credentials: "include",
  });
  return await res.json();
}
