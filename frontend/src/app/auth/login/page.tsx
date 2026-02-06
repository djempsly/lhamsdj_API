"use client";

import { useState } from "react";
import { loginUser } from "@/services/authService";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await loginUser(formData);
    setLoading(false);

    if (res.success) {

      window.location.href = "/"; 
    //    // 1. Disparamos un evento personalizado para avisar a toda la app
    // window.dispatchEvent(new Event("auth-change"));
    
    // // 2. Redirigimos (router.push es suave, no recarga la página)
    // router.push("/"); 
      if (res.user.role === 'ADMIN') {
        router.push("/admin/dashboard"); // Aún no existe, dará 404, luego la creamos
      } else {
        router.push("/");
      }
    } else {
      setError(res.message || "Credenciales inválidas");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Bienvenido</h2>
          <p className="text-gray-500 mt-2">Ingresa a tu cuenta para continuar</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
               name="email" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="mitienda@lhamsdj.com"
              value={formData.email} // Controlado por React
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              autoComplete="email" // 2. Truco: 'new-password' a veces evita el autofill agresivo
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="********"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              autoComplete="new-password" // 3. Esto evita que Chrome lo llene automáticamente al cargar
            />

             <div className="flex justify-end mt-1">
              <Link 
                href="/auth/forgot-password" 
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>



            
          </div>





          

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}