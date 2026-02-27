// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
//  import { checkSession, logoutUser } from "@/services/authService";

// interface UserData {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
// }









// export default function ProfilePage() {
//   const router = useRouter();
//   const [user, setUser] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkSession()
//       .then((res) => {
//         if (res && res.success && res.user) {
//           setUser(res.user);
//         } else {
//           router.push("/auth/login");
//         }
//       })
//       .catch(() => router.push("/auth/login"))
//       .finally(() => setLoading(false));
//   }, [router]);

//   const handleLogout = async () => {
//     await logoutUser();
//     window.location.href = "/"; 
//   };

//   if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;
//   //if (!user) return null;


// // Dentro de tu componente
// if (!user) {
//   return <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />; // Un "skeleton" de carga
// }







//   // useEffect(() => {
//   //   // 1. Verificar si hay sesión
//   //   const token = localStorage.getItem("token");
//   //   const userData = localStorage.getItem("user");

//   //   if (!token || !userData) {
//   //     router.push("/auth/login"); // Si no hay token, fuera
//   //     return;
//   //   }

//   //   setUser(JSON.parse(userData));
//   // }, [router]);





//   //    useEffect(() => {
//   //   checkSession()
//   //     .then((res) => {
//   //       if (res && res.success && res.user) {
//   //         setUser(res.user);
//   //       } else {
//   //         router.push("/auth/login");
//   //       }
//   //     })
//   //     .catch(() => router.push("/auth/login"))
//   //     .finally(() => setLoading(false));
//   // }, [router]);

//   // const handleLogout = () => {
//   //   // 2. Lógica de Cerrar Sesión
//   //   localStorage.removeItem("token");
//   //   localStorage.removeItem("user");
    
//   //   // Forzar recarga para limpiar estados del Navbar
//   //   window.location.href = "/"; 
//   // };

//   // if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

//   return (
//     <div className="container mx-auto px-4 py-10">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>

//         <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
//           {/* Cabecera del Perfil */}
//           <div className="bg-gray-50 p-6 border-b flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
//                 {user.name?.charAt(0).toUpperCase() || "JAD"}
//                 {/* {user.name?.charAt(0).toUpperCase() || "U"} */}
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold">{user.name}</h2>
//                 <p className="text-gray-500 text-sm">{user.email}</p>
//               </div>
//             </div>
//             <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
//               {user.role}
//             </span>
//           </div>

//           {/* Opciones del Perfil */}
//           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

//             {user.role === 'ADMIN' && (
//               <div className="p-4 border rounded-lg bg-black text-white hover:bg-gray-800 transition md:col-span-2">
//                 <h3 className="font-bold text-lg mb-2">Panel de Administrador</h3>
//                 <p className="text-gray-300 text-sm mb-4">Gestionar productos, categorías y órdenes.</p>
//                 <Link href="/admin/dashboard" className="inline-block bg-white text-black px-4 py-2 rounded font-bold">
//                   Ir al Dashboard 🚀
//                 </Link>
//               </div>
//             )}
            
//             {/* Tarjeta de Pedidos */}
//             <div className="p-4 border rounded-lg hover:shadow-md transition">
//               <h3 className="font-bold text-lg mb-2">Mis Pedidos</h3>
//               <p className="text-gray-500 text-sm mb-4">Revisa el estado de tus compras recientes.</p>
//               <Link href="/profile/orders" className="text-blue-600 font-medium hover:underline">
//                 Ver historial &rarr;
//               </Link>
//             </div>

//             {/* Tarjeta de Seguridad (Placeholder) */}
//             <div className="p-4 border rounded-lg hover:shadow-md transition">
//               <h3 className="font-bold text-lg mb-2">Seguridad</h3>
//               <p className="text-gray-500 text-sm mb-4">Cambiar contraseña y ajustes de cuenta.</p>
              
//               <Link href="/profile/security" className="text-blue-600 font-medium hover:underline block mt-4">
//                 Gestionar Seguridad &rarr;
//               </Link>
                            
      
//             </div>
//           </div>

//           {/* Botón de Cerrar Sesión */}
//           <div className="p-6 bg-gray-50 border-t">
//             <button
//               onClick={handleLogout}
//               className="text-red-600 font-medium hover:text-red-800 transition flex items-center gap-2"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
//               Cerrar Sesión
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }










// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { checkSession, logoutUser } from "@/services/authService"; // Usamos los servicios

// interface UserData {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
// }

// export default function ProfilePage() {
//   const router = useRouter();
//   const [user, setUser] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // PREGUNTAMOS AL SERVIDOR (COOKIES)
//     checkSession()
//       .then((res) => {
//         if (res.success) {
//           setUser(res.user);
//         } else {
//           router.push("/auth/login"); // Si falla la cookie, al login
//         }
//       })
//       .finally(() => setLoading(false));
//   }, [router]);

//   const handleLogout = async () => {
//     await logoutUser(); // Borra la cookie en el servidor
//     window.location.href = "/"; 
//   };

//   if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;
//   if (!user) return null;

//   return (
//     <div className="container mx-auto px-4 py-10">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>

//         <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
//           <div className="bg-gray-50 p-6 border-b flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
//                 {user.name.charAt(0).toUpperCase()}
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold">{user.name}</h2>
//                 <p className="text-gray-500 text-sm">{user.email}</p>
//               </div>
//             </div>
//             <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
//               {user.role}
//             </span>
//           </div>

//           <div className="p-6 bg-gray-50 border-t">
//             <button
//               onClick={handleLogout}
//               className="text-red-600 font-medium hover:text-red-800 transition flex items-center gap-2"
//             >
//               Cerrar Sesión
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }












// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { checkSession, logoutUser } from "@/services/authService";

// interface UserData {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
// }

// export default function ProfilePage() {
//   const router = useRouter();
//   const [user, setUser] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkSession()
//       .then((res) => {
//         if (res && res.success && res.user) {
//           setUser(res.user);
//         } else {
//           router.push("/auth/login");
//         }
//       })
//       .catch(() => router.push("/auth/login"))
//       .finally(() => setLoading(false));
//   }, [router]);

//   const handleLogout = async () => {
//     await logoutUser();
//     window.location.href = "/"; 
//   };

//   if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;
//   if (!user) return null;

//   return (
//     <div className="container mx-auto px-4 py-10">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>

//         <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
//           <div className="bg-gray-50 p-6 border-b flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               {/* AVATAR: Protección contra nombre vacío */}
//               <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
//                 {user.name?.charAt(0).toUpperCase() || "U"}
//               </div>

              
              
//               <div>
//                 {/* NOMBRE: Protección contra nombre vacío */}
//                 <h2 className="text-xl font-semibold">
//                     {user.name || "Usuario Sin Nombre"}
//                 </h2>
//                 <p className="text-gray-500 text-sm">{user.email}</p>
//               </div>
//             </div>
            
//             <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
//               {user.role}
//             </span>
//           </div>

//           <div className="p-6 bg-gray-50 border-t">
//             <button
//               onClick={handleLogout}
//               className="text-red-600 font-medium hover:text-red-800 transition flex items-center gap-2"
//             >
//               Cerrar Sesión
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


















"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { checkSession, logoutUser } from "@/services/authService";
//import { updateMyProfile, deleteMyAccount } from "@/services/userService";
import { uploadImages } from "@/services/uploadService"; // Reutilizamos tu servicio de subida
import Link from "next/link";
import Image from "next/image";
import { Camera, Loader2, Trash2, LogOut } from "lucide-react";
import { updateMyProfile, deleteMyAccount } from "@/services/userService";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 1. Cargar datos frescos del servidor (Cookies)
  useEffect(() => {
    checkSession()
      .then((res) => {
        if (res && res.success) {
          setUser(res.user);
        } else {
          router.push("/auth/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  // 2. Manejar Subida de Foto de Perfil
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // A) Subir a S3/CloudFront (Usando tu servicio existente)
      // Nota: uploadImages espera una lista, le pasamos un array de 1
      const uploadRes = await uploadImages([file]); 

      if (uploadRes.success) {
        const newImageUrl = uploadRes.data[0].url;

        // B) Actualizar el usuario en la BD con la nueva URL
        const updateRes = await updateMyProfile({ profileImage: newImageUrl });

        if (updateRes.success) {
          // Actualizamos la vista localmente
          setUser((prev) => prev ? { ...prev, profileImage: newImageUrl } : null);
          alert(t("photoUpdated"));
        }
      } else {
        alert("Error al subir la imagen");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setUploading(false);
    }
  };

  // 3. Cerrar Sesión
  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/"; 
  };

  // 4. Eliminar Cuenta
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      `${t("areYouSure")} \n\n${t("deleteWarning")}`
    );

    if (confirmDelete) {
      const res = await deleteMyAccount();
      if (res.success) {
        alert(t("accountDeleted"));
        window.location.href = "/";
      } else {
        alert("Error: " + res.message);
      }
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Tarjeta de Usuario */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            
            {/* Avatar con botón de cámara */}
            <div className="relative w-24 h-24 mb-4 group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                {user.profileImage ? (
                  <Image src={user.profileImage} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black text-white text-3xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              
              {/* Input invisible sobre la imagen */}
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition">
                {uploading ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>

            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500 text-sm mb-2">{user.email}</p>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
              {user.role}
            </span>

            <div className="w-full mt-6 space-y-2">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition">
                <LogOut size={18} /> {t("logout")}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Opciones */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Panel de Admin (Solo si es Admin) */}
          {user.role === 'ADMIN' && (
            <div className="bg-black text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold mb-2">{t("adminPanel")}</h3>
              <p className="text-gray-300 text-sm mb-4">{t("adminDesc")}</p>
              <Link href="/admin/dashboard" className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition inline-block">
                {t("goToDashboard")}
              </Link>
            </div>
          )}

          {/* Vendor Panel (para usuarios con rol VENDOR) */}
          {user.role === "VENDOR" && (
            <div className="bg-black text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold mb-2">{t("vendorPanel")}</h3>
              <p className="text-gray-300 text-sm mb-4">{t("vendorDesc")}</p>
              <Link href="/vendor/dashboard" className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition inline-block">
                {t("goToDashboard")}
              </Link>
            </div>
          )}

          {/* Become a Vendor (para usuarios que no son VENDOR) */}
          {user.role !== "VENDOR" && (
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-bold mb-2 text-gray-900">{t("becomeVendor")}</h3>
              <p className="text-gray-500 text-sm mb-4">{t("becomeVendorDesc")}</p>
              <Link href="/vendor/register" className="text-blue-600 font-medium hover:underline">
                {t("vendorRegisterLink")} &rarr;
              </Link>
            </div>
          )}

          {/* Opciones Generales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-bold text-lg">{t("accountSettings")}</h3>
            </div>
            
            <div className="divide-y">
              <Link href="/profile/orders" className="block p-4 hover:bg-gray-50 transition flex justify-between items-center">
                <div>
                  <p className="font-medium">{t("myOrders")}</p>
                  <p className="text-sm text-gray-500">{t("ordersDesc")}</p>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </Link>

              <Link href="/profile/security" className="block p-4 hover:bg-gray-50 transition flex justify-between items-center">
                <div>
                  <p className="font-medium">{t("security")}</p>
                  <p className="text-sm text-gray-500">{t("securityDesc")}</p>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Zona de Peligro */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-red-600 mb-2">{t("dangerZone")}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t("dangerDesc")}
              </p>
              <button 
                onClick={handleDeleteAccount}
                className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition flex items-center gap-2"
              >
                <Trash2 size={16} /> {t("deleteAccount")}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}