const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAddresses() {
  const res = await fetch(`${API_URL}/addresses`, {
    credentials: "include",
    cache: "no-store"
  });
  return await res.json();
}

export async function createAddress(data: any) {
  const res = await fetch(`${API_URL}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return await res.json();
}