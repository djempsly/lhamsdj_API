// "use client";

// import { useState } from "react";
// import { resetPassword } from "@/services/authService";
// import { useRouter } from "next/navigation";

// export default function ResetPasswordPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({ email: "", code: "", newPassword: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const res = await resetPassword(formData);
//     setLoading(false);

//     if (res.success) {
//       alert("Contraseña restablecida. Ahora puedes iniciar sesión.");
//       router.push("/auth/login");
//     } else {
//       setError(res.message);
//     }
//   };

//   return (
//     <div className="flex min-h-[60vh] items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white p-8 rounded-lg shadow border">
//         <h2 className="text-2xl font-bold text-center mb-6">Crear Nueva Contraseña</h2>

//         {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* <input
//             type="email"
//             placeholder="Email"
//             required
//             className="w-full p-2 border rounded"
//             onChange={(e) => setFormData({...formData, email: e.target.value})}
//           /> */}
//           <input
//             type="text"
//             placeholder="Código de 6 dígitos"
//             required
//             className="w-full p-2 border rounded"
//             onChange={(e) => setFormData({...formData, code: e.target.value})}
//           />
//           <input
//             type="password"
//             placeholder="Nueva Contraseña"
//             required
//             className="w-full p-2 border rounded"
//             onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
//             autoComplete="new-password"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
//           >
//             {loading ? "Cambiando..." : "Cambiar Contraseña"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


"use client";

import { Suspense, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { resetPassword } from "@/services/authService";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [formData, setFormData] = useState({ email: emailFromUrl, code: "", newPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Actualizar si el email llega tarde
  useEffect(() => {
    if(emailFromUrl) setFormData(prev => ({ ...prev, email: emailFromUrl }));
  }, [emailFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await resetPassword(formData);
    setLoading(false);

    if (res.success) {
      alert(t("passwordReset"));
      router.push("/auth/login");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow border">
        <h2 className="text-2xl font-bold text-center mb-6">{t("createNewPassword")}</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* El email se envía pero está oculto visualmente si ya vino por URL */}
          {!emailFromUrl && (
             <input
               type="email"
               placeholder="Email"
               required
               className="w-full p-2 border rounded"
               onChange={(e) => setFormData({...formData, email: e.target.value})}
             />
          )}

          <label className="block text-sm font-medium text-gray-700">{t("verificationCode")}</label>
          <input
            type="text"
            placeholder="Ej: 123456"
            required
            maxLength={6}
            className="w-full p-2 border rounded text-center tracking-widest text-xl"
            onChange={(e) => setFormData({...formData, code: e.target.value})}
          />

          <label className="block text-sm font-medium text-gray-700">{t("newPassword")}</label>
          <input
            type="password"
            placeholder="********"
            required
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? t("changing") : t("changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  const t = useTranslations("auth");
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {t("loading")}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}