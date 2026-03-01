"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ShoppingCart, Heart, User, LogOut, LayoutDashboard, Store,
  Menu, X, ChevronDown, Zap, Package, MapPin,
  Truck, Bell, Search, Flame, Tag, Gift, Star,
} from "lucide-react";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import { checkSession, logoutUser } from "@/services/authService";
import { getCart } from "@/services/cartService";
import { getCategories } from "@/services/categoryService";
import { countryCodeToFlag } from "@/data/countries";

interface Category {
  id: number;
  name: string;
  slug?: string;
  _count?: { products: number };
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  technology: <Zap size={16} />,
  electronics: <Zap size={16} />,
  fashion: <Tag size={16} />,
  beauty: <Star size={16} />,
  personal: <Gift size={16} />,
  home: <Package size={16} />,
};

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <Tag size={16} />;
}

export default function Navbar() {
  const router = useRouter();
  const t = useTranslations("navbar");
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string; country?: string; profileImage?: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkSession().then((res) => {
      if (res?.success && res.user) setUser(res.user);
      else setUser(null);
    });
    getCategories().then((res: any) => {
      if (res?.success || Array.isArray(res?.data)) setCategories(res.data || []);
      else if (Array.isArray(res)) setCategories(res);
    }).catch(() => {});
  }, []);

  const fetchCartCount = useCallback(() => {
    getCart().then((res) => {
      if (res?.success && res.data?.items) {
        setCartCount(res.data.items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0));
      } else setCartCount(0);
    });
  }, []);

  useEffect(() => { fetchCartCount(); }, [fetchCartCount]);
  useEffect(() => {
    window.addEventListener("cart-change", fetchCartCount);
    return () => window.removeEventListener("cart-change", fetchCartCount);
  }, [fetchCartCount]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

  const userAvatar = user?.profileImage
    ? <Image src={user.profileImage} alt={user.name} width={24} height={24} className="rounded-full object-cover" />
    : user?.country
      ? <span className="text-lg leading-none">{countryCodeToFlag(user.country)}</span>
      : <User size={18} />;

  return (
    <header className="sticky top-0 z-50">

      {/* ========== TOP BAR (promo / info) ========== */}
      <div className="bg-gray-900 text-gray-300 text-[11px] sm:text-xs hidden sm:block">
        <div className="container mx-auto px-4 flex items-center justify-between h-8">
          <div className="flex items-center gap-4 overflow-hidden">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Truck size={12} /> {t("freeShipping")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/help" className="hover:text-white transition whitespace-nowrap">{t("help")}</Link>
            {(user?.role === "VENDOR" || user?.role === "ADMIN") ? (
              <Link href="/vendor/dashboard" className="hover:text-white transition whitespace-nowrap">{t("sellOnLhams")}</Link>
            ) : (
              <Link href="/auth/register" className="hover:text-white transition whitespace-nowrap">{t("sellOnLhams")}</Link>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* ========== MAIN NAVBAR ========== */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3 h-14 sm:h-16">

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-700 touch-manipulation"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center gap-1.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-sm sm:text-base">
                L
              </div>
              <span className="hidden sm:block text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                LhamsDJ
              </span>
            </Link>

            {/* Search (desktop) */}
            <div className="flex-1 max-w-2xl hidden md:block mx-3">
              <SearchBar />
            </div>

            {/* Right section */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">

              {/* Account dropdown (desktop) */}
              <div className="hidden sm:block relative">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 min-h-[44px] px-2 lg:px-3 rounded-lg hover:bg-gray-50 touch-manipulation transition"
                      aria-expanded={userMenuOpen}
                    >
                      {userAvatar}
                      <div className="hidden lg:block text-left">
                        <p className="text-[10px] text-gray-500 leading-tight">{t("helloUser", { name: user.name.split(" ")[0] })}</p>
                        <p className="text-xs font-bold leading-tight">{t("accountAndLists")}</p>
                      </div>
                      <ChevronDown size={12} className="text-gray-400 hidden lg:block" />
                    </button>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl border shadow-xl py-2 z-20">
                          <div className="px-4 py-2 border-b mb-1">
                            <p className="font-bold text-sm truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                          <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 min-h-[42px] text-sm hover:bg-gray-50 touch-manipulation">
                            <User size={16} className="text-gray-400" /> {t("profile")}
                          </Link>
                          <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 min-h-[42px] text-sm hover:bg-gray-50 touch-manipulation">
                            <Package size={16} className="text-gray-400" /> {t("orders")}
                          </Link>
                          <Link href="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 min-h-[42px] text-sm hover:bg-gray-50 touch-manipulation">
                            <Heart size={16} className="text-gray-400" /> {t("wishlist")}
                          </Link>
                          {user.role === "ADMIN" && (
                            <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 min-h-[42px] text-sm hover:bg-gray-50 touch-manipulation">
                              <LayoutDashboard size={16} className="text-gray-400" /> {t("admin")}
                            </Link>
                          )}
                          {(user.role === "VENDOR" || user.role === "ADMIN") && (
                            <Link href="/vendor/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 min-h-[42px] text-sm hover:bg-gray-50 touch-manipulation">
                              <Store size={16} className="text-gray-400" /> {t("myStore")}
                            </Link>
                          )}
                          <div className="border-t mt-1 pt-1">
                            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 min-h-[42px] text-sm text-red-600 hover:bg-red-50 rounded-b-xl touch-manipulation">
                              <LogOut size={16} /> {t("logout")}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link href="/auth/login" prefetch={false} className="flex items-center gap-1.5 min-h-[44px] px-2 lg:px-3 rounded-lg hover:bg-gray-50 touch-manipulation transition">
                    <User size={18} className="text-gray-500" />
                    <div className="hidden lg:block text-left">
                      <p className="text-[10px] text-gray-500 leading-tight">{t("helloGuest")}</p>
                      <p className="text-xs font-bold leading-tight">{t("accountAndLists")}</p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Orders (desktop) */}
              <Link href="/orders" className="hidden md:flex items-center gap-1.5 min-h-[44px] px-2 lg:px-3 rounded-lg hover:bg-gray-50 touch-manipulation transition">
                <Package size={18} className="text-gray-500" />
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] text-gray-500 leading-tight">{t("returnsOrders")}</p>
                  <p className="text-xs font-bold leading-tight">{t("orders")}</p>
                </div>
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist" className="hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg relative touch-manipulation transition">
                <Heart size={20} />
              </Link>

              {/* Notifications */}
              <div className="hidden sm:block">
                <NotificationBell />
              </div>

              {/* Cart */}
              <button onClick={openCart} className="flex items-center gap-1 min-h-[44px] px-2 sm:px-3 text-gray-700 hover:bg-gray-50 rounded-lg relative touch-manipulation transition">
                <div className="relative">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-xs font-bold ml-0.5">{t("cart")}</span>
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-2.5">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* ========== CATEGORY / SECONDARY NAV BAR ========== */}
      <div className="bg-gray-50 border-b hidden sm:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-10 gap-0 overflow-x-auto scrollbar-hide">

            {/* All categories mega menu */}
            <div ref={catRef} className="relative shrink-0">
              <button
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                className="flex items-center gap-1.5 h-10 px-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition touch-manipulation whitespace-nowrap rounded-md"
              >
                <Menu size={16} />
                {t("allCategories")}
                <ChevronDown size={14} className={`transition-transform ${catMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {catMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCatMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-0.5 w-64 bg-white border rounded-xl shadow-xl z-20 py-2 max-h-[70vh] overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-400 px-4 py-3">No categories</p>
                    ) : (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/products?categoryId=${cat.id}`}
                          onClick={() => setCatMenuOpen(false)}
                          className="flex items-center gap-3 px-4 min-h-[42px] text-sm hover:bg-blue-50 hover:text-blue-700 touch-manipulation transition"
                        >
                          <span className="text-gray-400">{getCategoryIcon(cat.name)}</span>
                          <span className="flex-1">{cat.name}</span>
                          {cat._count?.products !== undefined && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{cat._count.products}</span>
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-5 bg-gray-300 mx-1 shrink-0" />

            {/* Quick links */}
            <Link href="/products?sort=createdAt&order=desc" className="flex items-center gap-1 h-10 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition whitespace-nowrap touch-manipulation">
              <Flame size={14} className="text-orange-500" />
              {t("deals")}
            </Link>
            <Link href="/products?sort=createdAt&order=desc" className="flex items-center gap-1 h-10 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition whitespace-nowrap touch-manipulation">
              <Zap size={14} className="text-yellow-500" />
              {t("newArrivals")}
            </Link>
            <Link href="/products?sort=sales&order=desc" className="flex items-center gap-1 h-10 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition whitespace-nowrap touch-manipulation">
              <Star size={14} className="text-purple-500" />
              {t("bestSellers")}
            </Link>

            <div className="w-px h-5 bg-gray-300 mx-1 shrink-0" />

            {/* Category quick chips */}
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="flex items-center gap-1.5 h-10 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition whitespace-nowrap touch-manipulation"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ========== MOBILE MENU ========== */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 sm:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-[85%] max-w-xs bg-white z-50 sm:hidden flex flex-col shadow-2xl" style={{ animation: "slideInLeft 0.25s ease" }}>

            {/* Mobile menu header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center gap-3">
              {user ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    {user.profileImage ? (
                      <Image src={user.profileImage} alt={user.name} width={36} height={36} className="rounded-full object-cover" />
                    ) : user.country ? (
                      <span className="text-2xl">{countryCodeToFlag(user.country)}</span>
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{t("helloUser", { name: user.name.split(" ")[0] })}</p>
                    <p className="text-[11px] text-white/70 truncate">{user.email}</p>
                  </div>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 touch-manipulation">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t("helloGuest")}</p>
                    <p className="text-[11px] text-white/70">{t("accountAndLists")}</p>
                  </div>
                </Link>
              )}
              <button onClick={() => setMobileMenuOpen(false)} className="ml-auto p-1.5 hover:bg-white/10 rounded-full touch-manipulation" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">

              {/* Trending / Deals */}
              <div className="p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">{t("trending")}</p>
                <Link href="/products?sort=createdAt&order=desc" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-orange-50 text-gray-700 touch-manipulation">
                  <Flame size={18} className="text-orange-500" /> <span className="text-sm font-medium">{t("deals")}</span>
                </Link>
                <Link href="/products?sort=createdAt&order=desc" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-yellow-50 text-gray-700 touch-manipulation">
                  <Zap size={18} className="text-yellow-500" /> <span className="text-sm font-medium">{t("newArrivals")}</span>
                </Link>
                <Link href="/products?sort=sales&order=desc" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-purple-50 text-gray-700 touch-manipulation">
                  <Star size={18} className="text-purple-500" /> <span className="text-sm font-medium">{t("bestSellers")}</span>
                </Link>
              </div>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Categories */}
              <div className="p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">{t("allCategories")}</p>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?categoryId=${cat.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation"
                  >
                    <span className="text-gray-400">{getCategoryIcon(cat.name)}</span>
                    <span className="text-sm font-medium flex-1">{cat.name}</span>
                  </Link>
                ))}
                <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-gray-50 text-blue-600 font-medium touch-manipulation">
                  <Search size={18} /> <span className="text-sm">{t("products")}</span>
                </Link>
              </div>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Account links */}
              <div className="p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">{t("account")}</p>
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                      <User size={18} className="text-gray-400" /> <span className="text-sm">{t("profile")}</span>
                    </Link>
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                      <Package size={18} className="text-gray-400" /> <span className="text-sm">{t("orders")}</span>
                    </Link>
                    <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                      <Heart size={18} className="text-gray-400" /> <span className="text-sm">{t("wishlist")}</span>
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                        <LayoutDashboard size={18} className="text-gray-400" /> <span className="text-sm">{t("admin")}</span>
                      </Link>
                    )}
                    {(user.role === "VENDOR" || user.role === "ADMIN") && (
                      <Link href="/vendor/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                        <Store size={18} className="text-gray-400" /> <span className="text-sm">{t("myStore")}</span>
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="space-y-2 px-2 pt-1">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} prefetch={false}
                      className="w-full min-h-[48px] flex items-center justify-center border-2 border-blue-600 text-blue-600 rounded-xl font-semibold touch-manipulation">
                      {t("login")}
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} prefetch={false}
                      className="w-full min-h-[48px] flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold touch-manipulation">
                      {t("register")}
                    </Link>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Settings */}
              <div className="p-3 pb-6">
                <Link href="/help" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-gray-50 text-gray-700 touch-manipulation">
                  <MapPin size={18} className="text-gray-400" /> <span className="text-sm">{t("help")}</span>
                </Link>
                <div className="flex items-center gap-3 px-3 py-2">
                  <LanguageSwitcher />
                </div>
                {user && (
                  <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 min-h-[46px] rounded-lg hover:bg-red-50 text-red-600 touch-manipulation mt-1">
                    <LogOut size={18} /> <span className="text-sm font-medium">{t("logout")}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </header>
  );
}
