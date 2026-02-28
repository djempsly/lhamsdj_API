import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getNotifications(unreadOnly = false) {
  try {
    const url = unreadOnly ? `${API_URL}/notifications?unread=true` : `${API_URL}/notifications`;
    const res = await apiFetch(url, { cache: "no-store" });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}

export async function getUnreadCount() {
  try {
    const res = await apiFetch(`${API_URL}/notifications/unread-count`);
    return await res.json();
  } catch { return { success: false, data: { count: 0 } }; }
}

export async function markAsRead(id: number) {
  try {
    await apiFetch(`${API_URL}/notifications/${id}/read`, { method: "PATCH" });
  } catch {}
}

export async function markAllAsRead() {
  try {
    await apiFetch(`${API_URL}/notifications/read-all`, { method: "PATCH" });
  } catch {}
}
