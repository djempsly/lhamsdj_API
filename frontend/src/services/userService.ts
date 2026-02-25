const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function updateMyProfile(data: any) {
  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

export async function deleteMyAccount() {
  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: "DELETE",
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}
