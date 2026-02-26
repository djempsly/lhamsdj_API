"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, List, Users, ShoppingCart, Store, Tag, FileText, Package } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Productos", href: "/admin/products", icon: ShoppingBag },
  { name: "Categorías", href: "/admin/categories", icon: List },
  { name: "Órdenes", href: "/admin/orders", icon: ShoppingCart },
  { name: "Usuarios", href: "/admin/users", icon: Users },
  { name: "Vendedores", href: "/admin/vendors", icon: Store },
  { name: "Proveedores", href: "/admin/suppliers", icon: Package },
  { name: "Cupones", href: "/admin/coupons", icon: Tag },
  { name: "Audit log", href: "/admin/audit", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black text-white min-h-screen p-4 hidden md:block">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-xs text-gray-400">LhamsDJ Store</p>
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
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}