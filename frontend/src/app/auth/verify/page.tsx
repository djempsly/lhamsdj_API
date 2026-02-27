// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { verifyUserEmail } from "@/services/authService";
// import Link from "next/link";

// export default function VerifyPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
  
//   const token = searchParams.get("token"); // Capturamos el código largo de la URL
  
//   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
//   const [message, setMessage] = useState("Verificando tu cuenta...");

//   useEffect(() => {
//     if (!token) {
//       setStatus("error");
//       setMessage("Token no proporcionado.");
//       return;
//     }

//     // Llamamos al backend automáticamente al cargar la página
//     verifyUserEmail(token)
//       .then((res) => {
//         if (res.success) {
//           setStatus("success");
//           setMessage("¡Correo verificado con éxito!");
//           // Opcional: Redirigir automáticamente después de 3 segundos
//           setTimeout(() => router.push("/auth/login"), 3000);
//         } else {
//           setStatus("error");
//           setMessage(res.message || "El enlace es inválido o ha expirado.");
//         }
//       })
//       .catch(() => {
//         setStatus("error");
//         setMessage("Error de conexión con el servidor.");
//       });
//   }, [token, router]);

//   return (
//     <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
//       <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border text-center">
        
//         {/* ESTADO: CARGANDO */}
//         {status === "loading" && (
//           <div className="flex flex-col items-center">
//             <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
//             <h2 className="text-xl font-bold text-gray-700">Verificando...</h2>
//             <p className="text-gray-500 mt-2">Por favor espera un momento.</p>
//           </div>
//         )}

//         {/* ESTADO: ÉXITO */}
//         {status === "success" && (
//           <div className="flex flex-col items-center">
//             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl">
//               ✅
//             </div>
//             <h2 className="text-2xl font-bold text-green-700">¡Cuenta Activada!</h2>
//             <p className="text-gray-600 mt-2 mb-6">{message}</p>
//             <Link 
//               href="/auth/login" 
//               className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
//             >
//               Iniciar Sesión
//             </Link>
//           </div>
//         )}

//         {/* ESTADO: ERROR */}
//         {status === "error" && (
//           <div className="flex flex-col items-center">
//             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-3xl">
//               ❌
//             </div>
//             <h2 className="text-2xl font-bold text-red-700">Error de Verificación</h2>
//             <p className="text-gray-600 mt-2 mb-6">{message}</p>
//             <Link 
//               href="/auth/register" 
//               className="text-blue-600 hover:underline"
//             >
//               Volver al registro
//             </Link>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }


// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { verifyUserEmail } from "@/services/authService";

// export default function VerifyPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const urlToken = searchParams.get("token");
  
//   // Si viene en URL lo usamos, si no, dejamos que el usuario escriba
//   const [code, setCode] = useState(urlToken || "");
//   const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
//   const [message, setMessage] = useState("");

//   // Auto-verificar si viene en el link
//   useEffect(() => {
//     if (urlToken) handleVerify(urlToken);
//   }, [urlToken]);

//   const handleVerify = async (tokenToVerify: string) => {
//     setStatus("loading");
//     const res = await verifyUserEmail(tokenToVerify);
//     if (res.success) {
//       setStatus("success");
//       setTimeout(() => router.push("/auth/login"), 2000);
//     } else {
//       setStatus("error");
//       setMessage(res.message);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     handleVerify(code);
//   };

//   return (
//     <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
//       <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border text-center">
//         <h2 className="text-2xl font-bold mb-4">Verificar Cuenta</h2>

//         {status === "success" ? (
//           <div className="text-green-600 font-bold text-xl">✅ ¡Código Correcto!</div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <p className="text-gray-500 text-sm">Ingresa el código de 6 dígitos enviado a tu correo.</p>
            
//             <input 
//               type="text" 
//               maxLength={6}
//               value={code}
//               onChange={(e) => setCode(e.target.value)}
//               className="w-full text-center text-3xl tracking-widest border-2 border-gray-300 rounded-lg p-2 focus:border-black outline-none"
//               placeholder="000000"
//             />

//             {status === "error" && <p className="text-red-500 text-sm">{message}</p>}

//             <button 
//               disabled={status === "loading" || code.length < 6}
//               className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
//             >
//               {status === "loading" ? "Verificando..." : "Verificar"}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }





"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyUserEmail } from "@/services/authService";

function VerifyContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlToken = searchParams.get("token");
  
  // Estado inicial: Si hay token en URL es "loading", si no es "idle" (esperando input)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    urlToken ? "loading" : "idle"
  );
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (urlToken) {
      handleVerify(urlToken);
    }
  }, [urlToken]);

  const handleVerify = async (tokenToVerify: string) => {
    setStatus("loading");
    const res = await verifyUserEmail(tokenToVerify);
    if (res.success) {
      setStatus("success");
      setTimeout(() => router.push("/auth/login"), 2000);
    } else {
      setStatus("error");
      setMessage(res.message || t("invalidCode"));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(code);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border text-center">
        <h2 className="text-2xl font-bold mb-4">{t("verifyAccount")}</h2>

        {status === "loading" && <p className="text-blue-500">{t("verifying")}</p>}

        {status === "success" && (
          <div className="text-green-600 font-bold text-xl py-4">
            ✅ {t("accountVerified")} <br/> <span className="text-sm text-gray-500">{t("redirecting")}</span>
          </div>
        )}

        {/* Muestra el formulario si está en espera (idle) o si hubo error */}
        {(status === "idle" || status === "error") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-500 text-sm">{t("enterDigitCode")}</p>
            
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full text-center text-3xl tracking-widest border-2 border-gray-300 rounded-lg p-2 focus:border-black outline-none"
              placeholder="000000"
            />

            {status === "error" && <p className="text-red-500 text-sm">{message}</p>}

            <button 
              disabled={code.length < 6}
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {t("verifyManually")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function VerifyFallback() {
  const t = useTranslations("auth");
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {t("verifying")}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyContent />
    </Suspense>
  );
}