"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Store, Menu, X } from "lucide-react";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import { checkSession, logoutUser } from "@/services/authService";
import { getCart } from "@/services/cartService";
import { countryCodeToFlag } from "@/data/countries";

export default function Navbar() {
  const router = useRouter();
  const t = useTranslations("navbar");
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string; country?: string; profileImage?: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkSession().then((res) => {
      if (res?.success && res.user) setUser(res.user);
      else setUser(null);
    });
  }, []);

  const fetchCartCount = () => {
    getCart().then((res) => {
      if (res?.success && res.data?.items) {
        const count = res.data.items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);
        setCartCount(count);
      } else setCartCount(0);
    });
  };

  useEffect(() => { fetchCartCount(); }, []);
  useEffect(() => {
    window.addEventListener("cart-change", fetchCartCount);
    return () => window.removeEventListener("cart-change", fetchCartCount);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const openCart = () => {
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent("cart-drawer-open", { detail: { mode: "full" } }));
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900 shrink-0">
            LhamsDJ
          </Link>

          {/* Desktop search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <SearchBar />
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1 md:gap-3">
            <Link href="/products" className="min-h-[44px] px-3 flex items-center text-sm text-gray-600 hover:text-gray-900 touch-manipulation">
              {t("products")}
            </Link>
            <Link href="/wishlist" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 relative touch-manipulation" title={t("wishlist")}>
              <Heart size={20} />
            </Link>
            <button onClick={openCart} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 relative touch-manipulation" title={t("cart")}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            <LanguageSwitcher />
            <NotificationBell />

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 min-h-[44px] px-2 rounded-lg hover:bg-gray-100 touch-manipulation" aria-expanded={userMenuOpen}>
                  {user.profileImage ? (
                    <Image src={user.profileImage} alt={user.name} width={28} height={28} className="rounded-full object-cover" />
                  ) : user.country ? (
                    <span className="text-xl leading-none" title={user.country}>{countryCodeToFlag(user.country)}</span>
                  ) : (
                    <User size={20} />
                  )}
                  <span className="hidden lg:inline text-sm truncate max-w-[100px]">{user.name}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border shadow-lg py-1 z-20">
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 min-h-[44px] text-sm hover:bg-gray-50 touch-manipulation">
                        <User size={16} /> {t("profile")}
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 min-h-[44px] text-sm hover:bg-gray-50 touch-manipulation">
                          <LayoutDashboard size={16} /> {t("admin")}
                        </Link>
                      )}
                      {(user.role === "VENDOR" || user.role === "ADMIN") && (
                        <Link href="/vendor/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 min-h-[44px] text-sm hover:bg-gray-50 touch-manipulation">
                          <Store size={16} /> {t("myStore")}
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 min-h-[44px] text-sm text-red-600 hover:bg-gray-50 touch-manipulation">
                        <LogOut size={16} /> {t("logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/auth/login" prefetch={false} className="min-h-[44px] px-3 flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 touch-manipulation">
                  {t("login")}
                </Link>
                <Link href="/auth/register" prefetch={false} className="min-h-[44px] px-3 flex items-center text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 touch-manipulation">
                  {t("register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: icons + hamburger */}
          <div className="flex sm:hidden items-center gap-0.5">
            <button onClick={openCart} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 relative touch-manipulation" title={t("cart")}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 touch-manipulation" aria-label="Menu">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-2 sm:pb-0 sm:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={() => setMobileMenuOpen(false)} />
          <nav className="absolute left-0 right-0 top-full bg-white border-b shadow-lg z-50 sm:hidden animate-fade-in">
            <div className="container mx-auto px-4 py-3 space-y-1">
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[48px] rounded-lg hover:bg-gray-50 text-gray-700 font-medium touch-manipulation">
                {t("products")}
              </Link>
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[48px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                <Heart size={18} /> {t("wishlist")}
              </Link>

              <div className="flex items-center gap-2 px-3 py-2">
                <LanguageSwitcher />
                <NotificationBell />
              </div>

              <div className="border-t pt-2 mt-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      {user.profileImage ? (
                        <Image src={user.profileImage} alt={user.name} width={32} height={32} className="rounded-full object-cover" />
                      ) : user.country ? (
                        <span className="text-2xl leading-none">{countryCodeToFlag(user.country)}</span>
                      ) : (
                        <User size={20} />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[48px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                      <User size={18} /> {t("profile")}
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[48px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                        <LayoutDashboard size={18} /> {t("admin")}
                      </Link>
                    )}
                    {(user.role === "VENDOR" || user.role === "ADMIN") && (
                      <Link href="/vendor/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[48px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                        <Store size={18} /> {t("myStore")}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 min-h-[48px] rounded-lg hover:bg-gray-50 text-red-600 touch-manipulation">
                      <LogOut size={18} /> {t("logout")}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} prefetch={false} className="w-full text-center min-h-[48px] flex items-center justify-center border border-gray-300 rounded-lg font-medium text-gray-700 touch-manipulation">
                      {t("login")}
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} prefetch={false} className="w-full text-center min-h-[48px] flex items-center justify-center bg-gray-900 text-white rounded-lg font-medium touch-manipulation">
                      {t("register")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
