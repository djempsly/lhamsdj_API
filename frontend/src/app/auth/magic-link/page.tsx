"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { requestMagicLink, verifyMagicLink } from "@/services/authService";
import Link from "next/link";

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"form" | "sent" | "verifying" | "success" | "error">(token ? "verifying" : "form");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setStatus("verifying");
    verifyMagicLink(token)
      .then((res) => {
        if (res.success) {
          if (res.requires2FA) {
            setMessage("Se requiere verificación en dos pasos.");
            setStatus("error");
            return;
          }
          setStatus("success");
          const role = (res.user as { role?: string })?.role;
          setTimeout(() => {
            window.location.href = role === "ADMIN" ? "/admin/dashboard" : "/";
          }, 1500);
        } else {
          setStatus("error");
          setMessage(res.message || "Enlace inválido o expirado.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexión.");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage("");
    const res = await requestMagicLink(email.trim().toLowerCase());
    setLoading(false);
    if (res.success) {
      setStatus("sent");
    } else {
      setMessage(res.message || "No se pudo enviar el enlace.");
    }
  };

  if (status === "verifying") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Iniciando sesión...</h2>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          </div>
          <h2 className="text-xl font-bold text-green-700 mb-2">Sesión iniciada</h2>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Revisa tu correo</h2>
          <p className="text-gray-600 mb-6">Te hemos enviado un enlace para iniciar sesión. Válido 15 minutos.</p>
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Volver al inicio de sesión</Link>
        </div>
      </div>
    );
  }

  if (status === "error" && token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Enlace inválido</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href="/auth/login" className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition">Ir a iniciar sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Entrar con enlace mágico</h2>
          <p className="text-gray-500 mt-2 text-sm">Introduce tu email y te enviaremos un enlace para iniciar sesión sin contraseña.</p>
        </div>
        {message && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">{message}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white min-h-[48px] rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}
