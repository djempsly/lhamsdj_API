//<Link href="/auth/forgot-password" className="...">Cambiar Contraseña</Link>


"use client";

import { useState } from "react";
import { changeUserPassword } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import PasswordInput from "@/components/ui/PasswordInput";

export default function SecurityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmNew) {
      setError("Las nuevas contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const res = await changeUserPassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
    setLoading(false);

    if (res.success) {
      setSuccess("Contraseña actualizada con éxito.");
      setFormData({ currentPassword: "", newPassword: "", confirmNew: "" });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="text-gray-500 hover:text-black">
          <ArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold">Seguridad</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Cambiar Contraseña</h2>
            <p className="text-gray-500 text-sm">Asegura tu cuenta con una contraseña fuerte.</p>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
            {/* <input
              type="password"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            /> */}
            <PasswordInput
              required
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            {/* <input
              type="password"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            /> */}

             <PasswordInput
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, mayúscula, número y símbolo.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
            {/* <input
              type="password"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.confirmNew}
              onChange={(e) => setFormData({...formData, confirmNew: e.target.value})}
            /> */}

             <PasswordInput
              required
              value={formData.confirmNew}
              onChange={(e) => setFormData({...formData, confirmNew: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}