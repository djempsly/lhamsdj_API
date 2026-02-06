"use client";

import { useState } from "react";
import { forgotPassword } from "@/services/authService";
import Link from "next/link";
import { useRouter } from "next/navigation"; 



export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const res = await forgotPassword(email);
    setLoading(false);

  

    if (res.success) {
      setMessage(res.message || "Si el correo existe, recibirás un código.");
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow border">
        <h2 className="text-2xl font-bold text-center mb-4">Recuperar Contraseña</h2>
        <p className="text-gray-500 text-center text-sm mb-6">Ingresa tu email para recibir un código.</p>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            className="w-full p-2 border rounded"
            placeholder="tu@email.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar Código"}
          </button>
        </form>
        
        <div className="mt-4 text-center">
            <Link href="/auth/reset-password" className="text-sm text-blue-600 hover:underline">
                ¿Ya tienes el código? Ingresalo aquí
            </Link>
        </div>
      </div>
    </div>
  );
}