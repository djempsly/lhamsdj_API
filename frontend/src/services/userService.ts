import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function updateMyProfile(data: any) {
  try {
    const res = await apiFetch(`${API_URL}/users/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Connection error" };
  }
}

export async function deleteMyAccount() {
  try {
    const res = await apiFetch(`${API_URL}/users/profile`, { method: "DELETE" });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Connection error" };
  }
}
