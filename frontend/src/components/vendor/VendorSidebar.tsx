"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Wallet,
  User,
} from "lucide-react";

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const v = t(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export default function VendorSidebar() {
  const pathname = usePathname();
  const t = useTranslations("vendor");

  const menuItems = [
    { nameKey: "dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
    { nameKey: "products", href: "/vendor/products", icon: ShoppingBag },
    { nameKey: "orders", href: "/vendor/orders", icon: ShoppingCart },
    { nameKey: "shipments", href: "/vendor/shipments", icon: Truck },
    { nameKey: "payouts", href: "/vendor/payouts", icon: Wallet },
    { nameKey: "profile", href: "/vendor/profile", icon: User },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#065f46] text-white p-4 hidden md:block">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold">Vendor Portal</h1>
        <p className="text-xs text-emerald-200">Manage your store</p>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-white text-[#065f46] font-bold"
                  : "text-emerald-100 hover:bg-emerald-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {safeT(t, item.nameKey, item.nameKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
