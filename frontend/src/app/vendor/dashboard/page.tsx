"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DollarSign, ShoppingCart, Package, Clock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const v = t(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

type DashboardData = {
  products: number;
  totalRevenue: number;
  totalOrders: number;
  pendingShipments: number;
  totalPaidOut?: number;
  recentOrders?: Array<{
    id: number;
    total: number;
    status: string;
    user?: { name: string };
  }>;
};

export default function VendorDashboardPage() {
  const t = useTranslations("vendor");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/vendors/dashboard`, {
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.message || "Failed to load dashboard");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-10 w-10 border-2 border-[#065f46] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700">
        <p>{error || "Could not load dashboard. You may need to register as a vendor first."}</p>
        <Link href="/vendor/register" className="mt-3 inline-block text-[#065f46] font-medium hover:underline">
          Register as Vendor
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: safeT(t, "totalSales", "Total Sales"),
      value: `$${Number(data.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      bg: "bg-emerald-50",
      text: "text-[#065f46]",
    },
    {
      label: safeT(t, "totalOrders", "Total Orders"),
      value: String(data.totalOrders || 0),
      icon: ShoppingCart,
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      label: safeT(t, "totalProducts", "Total Products"),
      value: String(data.products || 0),
      icon: Package,
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: safeT(t, "pendingOrders", "Pending Orders"),
      value: String(data.pendingShipments || 0),
      icon: Clock,
      bg: "bg-purple-50",
      text: "text-purple-700",
    },
  ];

  const recentOrders = data.recentOrders || [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">
        {safeT(t, "dashboard", "Dashboard")}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} ${stat.text} p-6 rounded-lg shadow-sm border border-gray-100`}
          >
            <div className="flex items-center gap-3">
              <stat.icon className="w-10 h-10" />
              <div>
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="px-6 py-4 font-semibold text-gray-900 border-b border-gray-200">
          {safeT(t, "recentOrders", "Recent Orders")}
        </h2>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-8 text-gray-500">
            {safeT(t, "noOrders", "No orders yet")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.user?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${Number(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {order.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
