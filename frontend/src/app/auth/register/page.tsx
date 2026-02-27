

// "use client";

// import { useState, useEffect } from "react";
// import { registerUser } from "@/services/authService";
// import Link from "next/link";
// import { Turnstile } from '@marsidev/react-turnstile';

// export default function RegisterPage() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//   });

  
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false); // Estado para controlar la vista de éxito
//   const [captchaToken, setCaptchaToken] = useState("");

//     // 👇 1. AGREGA ESTE EFECTO: Limpia todo al "montar" la página (Entrar)
//   useEffect(() => {
//     setFormData({ name: "", email: "", password: "", phone: "" });
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };


  

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//      if (!captchaToken) {
//       setError("Por favor completa el captcha");
//       return;
//     }
//     setError("");
//     setLoading(true);

//     try {
//       const res = await registerUser({ ...formData, captchaToken} );
//       setLoading(false);

//       if (res.success) {
//         setSuccess(true); // Mostramos el mensaje de éxito
//          setFormData({ name: "", email: "", password: "", phone: "" });
//       } else {
//         setError(res.message || "Error al registrarse");
//       }
//     } catch (err) {
//       setLoading(false);
//       setError("Error de conexión con el servidor");
//     }
//   };

//   // --- VISTA 1: MENSAJE DE ÉXITO (Correo Enviado) ---
//   if (success) {
//     return (
//       <div className="flex min-h-[80vh] items-center justify-center px-4 bg-gray-50">
//         <div className="w-full max-w-md bg-green-50 p-8 rounded-xl shadow-lg border border-green-200 text-center">
//           <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
//             {/* Icono de Check */}
//             <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-green-800 mb-2">¡Cuenta Creada!</h2>
//           <p className="text-green-700 mb-6">
//             Hemos enviado un enlace de confirmación a <strong>{formData.email}</strong>.
//             <br />Por favor revísalo para activar tu cuenta.
//           </p>
//           <Link href="/auth/login" prefetch={false} className="text-green-800 font-bold hover:underline bg-green-200 px-4 py-2 rounded-lg transition hover:bg-green-300">
//             Ir al Login
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   // --- VISTA 2: FORMULARIO DE REGISTRO ---
//   return (
//     <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-4 py-10">
//       <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
//           <p className="text-gray-500 mt-2">Únete a LhamsDJ Store</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
//             <input
//               name="name"
//               type="text"
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
//               placeholder="Juan Pérez"
//               onChange={handleChange}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//             <input
//               name="email"
//               type="email"
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
//               placeholder="juan@ejemplo.com"
//               onChange={handleChange}
//               autoComplete="email"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
//             <input
//               name="password"
//               type="password"
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
//               placeholder="********"
//               onChange={handleChange}
//               autoComplete="new-password"
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               Mínimo 8 caracteres, mayúscula, número y símbolo.
//             </p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (Opcional)</label>
//             <input
//               name="phone"
//               type="tel"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
//               placeholder="+1 809..."
//               onChange={handleChange}
//             />
//           </div>

//            <div className="flex justify-center my-4">
//             <Turnstile 
//               siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string} 
//               onSuccess={(token) => setCaptchaToken(token)}
//             />
//       </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50"
//           >
//             {loading ? "Creando cuenta..." : "Registrarse"}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-600">
//           ¿Ya tienes cuenta?{" "}
//           <Link href="/auth/login" prefetch={false} className="text-blue-600 font-semibold hover:underline">
//             Inicia Sesión
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }






// "use client";

// import { useState, useEffect } from "react";
// import { registerUser } from "@/services/authService";
// import Link from "next/link";
// import { Check, X } from "lucide-react"; // Asegúrate de tener lucide-react instalado
// import { forbidden } from "next/navigation";
// import { Turnstile } from '@marsidev/react-turnstile';
// import PasswordInput from "@/components/ui/PasswordInput";

// export default function RegisterPage() {
//   // Estado inicial vacío para evitar datos pegados
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     phone: "",
//   });
  
//   // Limpiar formulario al entrar (solución al autocompletado persistente)
//   useEffect(() => {
//     setFormData({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
//   }, []);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [captchaToken, setCaptchaToken] = useState("");

//   // Validaciones en tiempo real
//   const validations = {
//     length: formData.password.length >= 8,
//     uppercase: /[A-Z]/.test(formData.password),
//     lowercase: /[a-z]/.test(formData.password),
//     number: /[0-9]/.test(formData.password),
//     symbol: /[\W_]/.test(formData.password),
//     match: formData.password === formData.confirmPassword
//   };

//   const isFormValid = Object.values(validations).every(Boolean) && formData.name && formData.email;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isFormValid) {
//       setError("Por favor cumple con todos los requisitos de seguridad.");
//       return;
//     }
    
//     setError("");
//     setLoading(true);

//     // Enviamos solo lo que el backend espera (sin confirmPassword)
//     const { confirmPassword, ...dataToSend } = formData;
    
//     try {
//       const res = await registerUser(dataToSend);
//       if (res.success) {
//         setSuccess(true);
//         setFormData({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
//       } else {
//         setError(res.message || "Error al registrarse");
//       }
//     } catch (err) {
//       setError("Error de conexión");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (success) {
//     return (
//       <div className="flex min-h-[80vh] items-center justify-center px-4 bg-gray-50">
//         <div className="w-full max-w-md bg-green-50 p-8 rounded-xl shadow-lg border border-green-200 text-center">
//           <h2 className="text-2xl font-bold text-green-800 mb-4">¡Cuenta Creada!</h2>
//           <p className="text-green-700 mb-6">
//             Hemos enviado un enlace a <strong>{formData.email}</strong>.
//             <br />Revísalo para activar tu cuenta.
//           </p>
//           <Link href="/auth/login" prefetch={false} className="text-green-800 font-bold hover:underline">Ir al Login</Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-4 py-10">
//       <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
//         <h2 className="text-3xl font-bold text-center mb-6">Crear Cuenta</h2>

//         {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
//           <input name="name" type="text" placeholder="Nombre Completo" required 
//             className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
//             value={formData.name} onChange={handleChange} />

            

//             <input
//               name="email"
//               type="email"
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
//               placeholder="lhamsdj@ejemplo.com"
//               onChange={handleChange}
//               autoComplete="email"
//             />
          
      
//  {/* 👇 USAMOS EL COMPONENTE NUEVO AQUÍ */}
//           <PasswordInput 
//             name="password" 
//             placeholder="Contraseña" 
//             required 
//             value={formData.password} 
//             onChange={handleChange} 
//              autoComplete="new-password"
//           />

//           {/* 👇 Y AQUÍ TAMBIÉN */}
//           <PasswordInput 
//             name="confirmPassword" 
//             placeholder="Confirmar Contraseña" 
//             required 
//             value={formData.confirmPassword} 
//             onChange={handleChange} 
//             className={validations.match ? 'border-green-500 focus:ring-green-500' : ''}
//              autoComplete="new-password"
//           />






//           {/* LISTA DE REQUISITOS VISUAL */}
//           <div className="text-xs space-y-1 bg-gray-50 p-3 rounded-md">
//             <p className="font-bold text-gray-500 mb-2">Requisitos de seguridad:</p>
//             <RequirementItem fulfilled={validations.length} text="Mínimo 8 caracteres" />
//             <RequirementItem fulfilled={validations.uppercase} text="Una letra mayúscula" />
//             <RequirementItem fulfilled={validations.lowercase} text="Una letra minúscula" />
//             <RequirementItem fulfilled={validations.number} text="Un número" />
//             <RequirementItem fulfilled={validations.symbol} text="Un símbolo (@$!%*?&)" />
//             <RequirementItem fulfilled={validations.match && formData.password.length > 0} text="Las contraseñas coinciden" />
//           </div>

//           <input name="phone" type="tel" placeholder="Teléfono (Opcional)" 
//             className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
//             value={formData.phone} onChange={handleChange} />





//              <div className="flex justify-center my-4">
//             <Turnstile 
//                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string} 
//                onSuccess={(token) => setCaptchaToken(token)}
//              />
//              </div>

//           <button type="submit" disabled={loading || !isFormValid}
//             className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition">
//             {loading ? "Registrando..." : "Registrarse"}
//           </button>
//         </form>
        
//         <p className="mt-4 text-center text-sm">
//           ¿Ya tienes cuenta? <Link href="/auth/login" prefetch={false} className="text-blue-600 font-bold">Inicia Sesión</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// // Componente pequeño para la lista
// function RequirementItem({ fulfilled, text }: { fulfilled: boolean; text: string }) {
//   return (
//     <div className={`flex items-center gap-2 ${fulfilled ? "text-green-600" : "text-gray-400"}`}>
//       {fulfilled ? <Check size={14} /> : <X size={14} />}
//       <span>{text}</span>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { registerUser } from "@/services/authService";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile';
import PasswordInput from "@/components/ui/PasswordInput";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  
  // Estado para el token del Captcha
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
  }, []);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validations = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[\W_]/.test(formData.password),
    match: formData.password === formData.confirmPassword
  };

  // CORRECCIÓN 1: Validar que el captchaToken exista para habilitar el botón
  const isFormValid = Object.values(validations).every(Boolean) && 
                      formData.name && 
                      formData.email && 
                      captchaToken; 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError("Por favor completa todos los campos y el captcha.");
      return;
    }
    
    setError("");
    setLoading(true);

    const { confirmPassword, ...dataFields } = formData;
    
    try {
      // CORRECCIÓN 2: Enviar el captchaToken junto con los datos
      const res = await registerUser({
        ...dataFields,
        captchaToken // <--- ¡ESTO ES VITAL!
      });

      if (res.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
        setCaptchaToken(""); // Limpiamos el token usado
      } else {
        setError(res.message || "Error al registrarse");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md bg-green-50 p-8 rounded-xl shadow-lg border border-green-200 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">¡Cuenta Creada!</h2>
          <p className="text-green-700 mb-6">
            Hemos enviado un enlace a <strong>{formData.email}</strong>.
            <br />Revísalo para activar tu cuenta.
          </p>
          <Link href="/auth/login" prefetch={false} className="text-green-800 font-bold hover:underline">Ir al Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-6">Crear Cuenta</h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <input name="name" type="text" placeholder="Nombre Completo" required 
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
            value={formData.name} onChange={handleChange} />

          <input name="email" type="email" placeholder="lhamsdj@ejemplo.com" required
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
            value={formData.email} onChange={handleChange} autoComplete="new-password" />
          
          <PasswordInput 
            name="password" 
            placeholder="Contraseña" 
            required 
            value={formData.password} 
            onChange={handleChange} 
            autoComplete="new-password"
          />

          <PasswordInput 
            name="confirmPassword" 
            placeholder="Confirmar Contraseña" 
            required 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            className={validations.match && formData.password ? 'border-green-500 focus:ring-green-500' : ''}
            autoComplete="new-password"
          />

          <div className="text-xs space-y-1 bg-gray-50 p-3 rounded-md">
            <p className="font-bold text-gray-500 mb-2">Requisitos de seguridad:</p>
            <RequirementItem fulfilled={validations.length} text="Mínimo 8 caracteres" />
            <RequirementItem fulfilled={validations.uppercase} text="Una letra mayúscula" />
            <RequirementItem fulfilled={validations.lowercase} text="Una letra minúscula" />
            <RequirementItem fulfilled={validations.number} text="Un número" />
            <RequirementItem fulfilled={validations.symbol} text="Un símbolo (@$!%*?&)" />
            <RequirementItem fulfilled={validations.match && formData.password.length > 0} text="Las contraseñas coinciden" />
          </div>

          <input name="phone" type="tel" placeholder="Teléfono (Opcional)" 
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
            value={formData.phone} onChange={handleChange} />

          {/* CAPTCHA */}
          <div className="flex justify-center my-4">
            <Turnstile 
               siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} 
               onSuccess={(token) => setCaptchaToken(token)}
               // Si el token expira, lo borramos para bloquear el botón
               onExpire={() => setCaptchaToken("")} 
             />
          </div>

          <button type="submit" disabled={loading || !isFormValid}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition">
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <Link href="/auth/login" prefetch={false} className="text-blue-600 font-bold">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}

function RequirementItem({ fulfilled, text }: { fulfilled: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 ${fulfilled ? "text-green-600" : "text-gray-400"}`}>
      {fulfilled ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );
}
