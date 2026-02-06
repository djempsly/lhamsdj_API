const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Actualizar datos del usuario (Nombre, Teléfono, Foto)
export async function updateMyProfile(data: any) {
  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include", // 🍪 Vital para cookies
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

// Eliminar mi propia cuenta (Soft Delete)
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