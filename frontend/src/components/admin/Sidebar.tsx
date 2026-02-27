"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, ShoppingBag, List, Users, ShoppingCart, Store, Tag, FileText, Package } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.sidebar");

  const menuItems = [
    { nameKey: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { nameKey: "products", href: "/admin/products", icon: ShoppingBag },
    { nameKey: "categories", href: "/admin/categories", icon: List },
    { nameKey: "orders", href: "/admin/orders", icon: ShoppingCart },
    { nameKey: "users", href: "/admin/users", icon: Users },
    { nameKey: "vendors", href: "/admin/vendors", icon: Store },
    { nameKey: "suppliers", href: "/admin/suppliers", icon: Package },
    { nameKey: "coupons", href: "/admin/coupons", icon: Tag },
    { nameKey: "auditLog", href: "/admin/audit", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-black text-white min-h-screen p-4 hidden md:block">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold">{t("adminPanel")}</h1>
        <p className="text-xs text-gray-400">{t("storeName")}</p>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-white text-black font-bold" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {t(item.nameKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}