// "use client"; // 👈 Obligatorio porque usaremos interactividad (menú móvil)

// import Link from "next/link";
// import { ShoppingCart, Menu, User, Search } from "lucide-react";
// import { useState } from "react";

// export default function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
          
//           {/* LOGO */}
//           <Link href="/" className="text-2xl font-bold text-black">
//             LhamsDJ<span className="text-blue-600">Store</span>
//           </Link>

//           {/* MENÚ DE ESCRITORIO (Hidden en móvil) */}
//           <div className="hidden md:flex space-x-8">
//             <Link href="/" className="text-gray-600 hover:text-black">Inicio</Link>
//             <Link href="/products" className="text-gray-600 hover:text-black">Productos</Link>
//             <Link href="/categories" className="text-gray-600 hover:text-black">Categorías</Link>
//           </div>

//           {/* ICONOS (Carrito, User) */}
//           <div className="flex items-center space-x-4">
//             <button className="text-gray-600 hover:text-black">
//               <Search className="w-6 h-6" />
//             </button>
            
//             <Link href="/auth/login" className="text-gray-600 hover:text-black">
//               <User className="w-6 h-6" />
//             </Link>

//             <Link href="/cart" className="relative text-gray-600 hover:text-black">
//               <ShoppingCart className="w-6 h-6" />
//               {/* Badge de contador (quemado por ahora) */}
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                 0
//               </span>
//             </Link>

//             {/* Botón Menú Móvil */}
//             <button 
//               className="md:hidden text-gray-600"
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//             >
//               <Menu className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         {/* MENÚ MÓVIL DESPLEGABLE */}
//         {isMenuOpen && (
//           <div className="md:hidden py-4 border-t">
//             <div className="flex flex-col space-y-3">
//               <Link href="/" className="text-gray-600 hover:text-black">Inicio</Link>
//               <Link href="/products" className="text-gray-600 hover:text-black">Productos</Link>
//               <Link href="/categories" className="text-gray-600 hover:text-black">Categorías</Link>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }

"use client";

import Link from "next/link";
import { ShoppingCart, Menu, User, Search } from "lucide-react";
import { useState, useEffect } from "react"; // <--- Importamos useEffect
import { checkSession } from "@/services/authService";
import { getCartCount } from "@/services/cartService"; // <--- Importar nueva función

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);


  // Función para verificar sesión (la sacamos fuera del useEffect para reutilizarla)
  const verifySession = () => {
    checkSession().then((res) => {
      setIsLoggedIn(res && res.success);
    });
  };

  useEffect(() => {
    // 1. Verificar al cargar la página por primera vez
    verifySession();

    // 2. Escuchar el evento "auth-change" (cuando alguien hace login/logout)
    window.addEventListener("auth-change", verifySession);

    // 3. Limpieza (Importante para no duplicar listeners)
    return () => {
      window.removeEventListener("auth-change", verifySession);
    };
  }, []);

   // Función para actualizar datos
  const updateData = () => {
    // 1. Ver Session
    checkSession().then((res) => setIsLoggedIn(res && res.success));
    
    // 2. Ver Carrito
    getCartCount().then((count) => setCartCount(count));
  };

  useEffect(() => {
    updateData(); // Carga inicial

    // Escuchar eventos globales
    window.addEventListener("auth-change", updateData);
    window.addEventListener("cart-change", updateData); // <--- NUEVO EVENTO

    return () => {
      window.removeEventListener("auth-change", updateData);
      window.removeEventListener("cart-change", updateData);
    };
  }, []);



  // useEffect(() => {
  //   // Preguntamos al servidor si la cookie es válida
  //   checkSession().then((res) => {
  //     if (res.success) {
  //       setIsLoggedIn(true);
  //     } else {
  //       setIsLoggedIn(false);
  //     }
  //   });
  // }, []);


  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link href="/" className="text-2xl font-bold text-black">
            LhamsDJ<span className="text-blue-600">Store</span>
          </Link>

          {/* MENÚ ESCRITORIO */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-black">Inicio</Link>
            <Link href="/products" className="text-gray-600 hover:text-black">Productos</Link>
            <Link href="/categories" className="text-gray-600 hover:text-black">Categorías</Link>
          </div>

          {/* ICONOS */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-black">
              <Search className="w-6 h-6" />
            </button>
            
            {/* LÓGICA INTELIGENTE AQUÍ 👇 */}
            <Link 
              href={isLoggedIn ? "/profile" : "/auth/login"} 
              className="text-gray-600 hover:text-black"
            >
              <User className="w-6 h-6" />
            </Link>

            {/* <Link href="/cart" className="relative text-gray-600 hover:text-black">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link> */}

             <Link href="/cart" className="relative text-gray-600 hover:text-black">
              <ShoppingCart className="w-6 h-6" />
              
              {/* Solo mostramos la bolita roja si hay items */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>








            <button 
              className="md:hidden text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}