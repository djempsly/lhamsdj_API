"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Store } from "lucide-react";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import { checkSession, logoutUser } from "@/services/authService";
import { getCart } from "@/services/cartService";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    checkSession().then((res) => {
      if (res?.success && res.user) setUser(res.user);
      else setUser(null);
    });
  }, []);

  useEffect(() => {
    getCart().then((res) => {
      if (res?.success && res.data?.items) {
        const count = res.data.items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);
        setCartCount(count);
      } else setCartCount(0);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-gray-900 shrink-0">
            LhamsDJ
          </Link>

          <div className="flex-1 max-w-xl hidden sm:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/products" className="p-2 text-gray-600 hover:text-gray-900" title="Productos">
              Productos
            </Link>
            <Link href="/wishlist" className="p-2 text-gray-600 hover:text-gray-900 relative" title="Lista de deseos">
              <Heart size={20} />
            </Link>
            <Link href="/cart" className="p-2 text-gray-600 hover:text-gray-900 relative" title="Carrito">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            <NotificationBell />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                  aria-expanded={userMenuOpen}
                >
                  <User size={20} />
                  <span className="hidden md:inline text-sm truncate max-w-[120px]">{user.name}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border shadow-lg py-1 z-20">
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                        <User size={16} /> Perfil
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <LayoutDashboard size={16} /> Admin
                        </Link>
                      )}
                      {(user.role === "VENDOR" || user.role === "ADMIN") && (
                        <Link href="/vendor/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <Store size={16} /> Mi tienda
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                        <LogOut size={16} /> Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900">
                  Entrar
                </Link>
                <Link href="/register" className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="sm:hidden mt-2">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
