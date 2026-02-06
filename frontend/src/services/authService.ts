const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
   captchaToken?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    console.error("Error en registro:", error);
    return { success: false, message: "Error de conexión con el servidor" };
  }
}

export async function loginUser(data: LoginData) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, message: "Error de conexión con el servidor" };
  }
}

// Solicitar correo de recuperación
export async function forgotPassword(email: string) {
  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

// Resetear contraseña con código
export async function resetPassword(data: any) {
  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}



// Verificar Email
export async function verifyUserEmail(token: string) {
  try {
    // Llamamos al endpoint GET /auth/verify/:token del backend
    const res = await fetch(`${API_URL}/auth/verify/${token}`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

// Nueva función para verificar sesión
export async function checkSession() {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      cache: "no-store",
      credentials: "include", // 👈 Envía la cookie automáticamente
    });
    return await res.json();
  } catch (error) {
    return { success: false };
  }
}

export async function logoutUser() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, { 
      method: "POST", 
      credentials: "include" 
    });

    if (!response.ok) {
      throw new Error("Error al cerrar sesión en el servidor");
    }

    // Opcional: Limpiar estado global (Redux, Zustand) o localStorage
    // window.location.href = "/login"; // Redirigir siempre tras éxito
  } catch (error) {
    console.error("Error en logout:", error);
    // Forzar limpieza local aunque el servidor falle (estrategia de seguridad)
    window.location.href = "/login";
  }
}



export async function changeUserPassword(data: any) {
  try {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include", // 🍪 Importante
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

