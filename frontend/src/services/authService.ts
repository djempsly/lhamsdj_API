const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { getCsrfHeaders } from "@/lib/csrf";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  captchaToken?: string;
}

interface LoginData {
  email: string;
  password: string;
}

async function mutationHeaders(): Promise<Record<string, string>> {
  const csrf = await getCsrfHeaders();
  return { "Content-Type": "application/json", ...csrf };
}

export async function registerUser(data: RegisterData) {
  try {
    const headers = await mutationHeaders();
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers,
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
    const headers = await mutationHeaders();
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, message: "Error de conexión con el servidor" };
  }
}

export async function verify2FALogin(userId: number, token: string) {
  try {
    const headers = await mutationHeaders();
    const res = await fetch(`${API_URL}/auth/login/2fa`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId, token }),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Connection error" };
  }
}

export async function forgotPassword(email: string) {
  try {
    const headers = await mutationHeaders();
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

export async function resetPassword(data: { email: string; code: string; newPassword: string }) {
  try {
    const headers = await mutationHeaders();
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

export async function verifyUserEmail(token: string) {
  try {
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

export async function verifyByCode(email: string, code: string) {
  try {
    const headers = await mutationHeaders();
    const res = await fetch(`${API_URL}/auth/verify-code`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, code }),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}

export async function requestMagicLink(email: string) {
  try {
    const headers = await mutationHeaders();
    const res = await fetch(`${API_URL}/auth/magic-link`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    console.error("Magic link request error:", error);
    return { success: false, message: "Error de conexión" };
  }
}

export async function verifyMagicLink(token: string) {
  try {
    const res = await fetch(`${API_URL}/auth/magic-link/verify?token=${encodeURIComponent(token)}`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    console.error("Magic link verify error:", error);
    return { success: false, message: "Error de conexión" };
  }
}

export async function checkSession() {
  try {
    const { apiFetch } = await import("@/lib/apiFetch");
    const res = await apiFetch(`${API_URL}/auth/me`, {
      method: "GET",
      cache: "no-store",
    });
    return await res.json();
  } catch (error) {
    return { success: false };
  }
}

export async function refreshSession() {
  try {
    const headers = await getCsrfHeaders();
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers,
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false };
  }
}

export async function logoutUser() {
  try {
    const headers = await getCsrfHeaders();
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers,
      credentials: "include",
    });
  } catch (error) {
    console.error("Error en logout:", error);
  } finally {
    window.location.href = "/auth/login";
  }
}

export async function logoutAllDevices() {
  try {
    const headers = await getCsrfHeaders();
    await fetch(`${API_URL}/auth/logout-all`, {
      method: "POST",
      headers,
      credentials: "include",
    });
  } catch (error) {
    console.error("Error en logout-all:", error);
  } finally {
    window.location.href = "/auth/login";
  }
}

export async function changeUserPassword(data: { currentPassword: string; newPassword: string }) {
  try {
    const headers = await mutationHeaders();
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Error de conexión" };
  }
}
