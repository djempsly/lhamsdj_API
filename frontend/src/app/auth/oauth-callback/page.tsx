"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkSession } from "@/services/authService";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const run = async () => {
      const res = await checkSession();
      if (res.success && res.user) {
        setStatus("ok");
        const role = (res.user as { role?: string })?.role;
        setTimeout(() => {
          router.replace(role === "ADMIN" ? "/admin/dashboard" : "/");
        }, 1200);
      } else {
        setStatus("error");
        setTimeout(() => router.replace("/auth/login"), 2000);
      }
    };
    run();
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700">Iniciando sesión...</h2>
          </>
        )}
        {status === "ok" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            </div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Sesión iniciada</h2>
            <p className="text-gray-600">Redirigiendo...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><circle cx="12" cy="12" r="10"/><path d="m12 8 0 4"/><path d="m12 16 0.01 0"/></svg>
            </div>
            <h2 className="text-xl font-bold text-amber-700 mb-2">No se pudo completar el acceso</h2>
            <p className="text-gray-600">Redirigiendo al inicio de sesión...</p>
          </>
        )}
      </div>
    </div>
  );
}
