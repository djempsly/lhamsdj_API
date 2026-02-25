const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getNotifications(unreadOnly = false) {
  try {
    const url = unreadOnly ? `${API_URL}/notifications?unread=true` : `${API_URL}/notifications`;
    const res = await fetch(url, { credentials: "include", cache: "no-store" });
    return await res.json();
  } catch { return { success: false, data: [] }; }
}

export async function getUnreadCount() {
  try {
    const res = await fetch(`${API_URL}/notifications/unread-count`, { credentials: "include" });
    return await res.json();
  } catch { return { success: false, data: { count: 0 } }; }
}

export async function markAsRead(id: number) {
  try {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
  } catch {}
}

export async function markAllAsRead() {
  try {
    await fetch(`${API_URL}/notifications/read-all`, { method: "PATCH", credentials: "include" });
  } catch {}
}
