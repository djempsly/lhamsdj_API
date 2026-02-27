"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, Users, DollarSign, Download, BarChart3, ShoppingBag } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SalesData = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dailySales: { date: string; revenue: number; orders: number }[];
};

type ProductData = {
  topProducts: { id: number; name: string; totalSold: number; revenue: number }[];
};

type UserData = {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
};

const PERIODS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "1 Year", value: "365d" },
];

export default function AdminAnalyticsPage() {
  const t = useTranslations("admin");
  const [period, setPeriod] = useState("30d");
  const [sales, setSales] = useState<SalesData | null>(null);
  const [products, setProducts] = useState<ProductData | null>(null);
  const [users, setUsers] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [salesRes, productsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/analytics/sales?period=${period}`, { credentials: "include" }),
        fetch(`${API_URL}/analytics/products`, { credentials: "include" }),
        fetch(`${API_URL}/analytics/users`, { credentials: "include" }),
      ]);
      const [salesData, productsData, usersData] = await Promise.all([
        salesRes.json(), productsRes.json(), usersRes.json(),
      ]);
      if (salesData.success) setSales(salesData.data);
      if (productsData.success) setProducts(productsData.data);
      if (usersData.success) setUsers(usersData.data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/export?period=${period}&format=csv`, {
        credentials: "include",
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${period}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("Export failed"); }
  };

  const maxRevenue = sales?.dailySales?.length
    ? Math.max(...sales.dailySales.map((d) => d.revenue), 1)
    : 1;

  if (loading) return <div className="p-8">Loading analytics...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border rounded-lg overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  period === p.value ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">${sales?.totalRevenue?.toLocaleString() ?? "0"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">{sales?.totalOrders ?? 0} orders</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold">${sales?.averageOrderValue?.toFixed(2) ?? "0.00"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Per transaction</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{users?.totalUsers?.toLocaleString() ?? "0"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">{users?.newUsers ?? 0} new this period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-4">Revenue Overview</h2>
          {sales?.dailySales && sales.dailySales.length > 0 ? (
            <div className="flex items-end gap-1 h-48">
              {sales.dailySales.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                  <div className="absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                    ${day.revenue.toLocaleString()} - {new Date(day.date).toLocaleDateString()}
                  </div>
                  <div
                    className="w-full bg-black rounded-t hover:bg-gray-700 transition-colors cursor-pointer"
                    style={{
                      height: `${Math.max((day.revenue / maxRevenue) * 100, 2)}%`,
                      minHeight: "4px",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-4">Top Products</h2>
          <div className="space-y-4">
            {products?.topProducts?.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.totalSold} sold</p>
                </div>
                <span className="text-sm font-bold text-green-700">${p.revenue.toLocaleString()}</span>
              </div>
            )) ?? (
              <p className="text-sm text-gray-400">No product data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
