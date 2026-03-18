"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, Users, DollarSign, Download, BarChart3, ShoppingBag } from "lucide-react";
import { getSalesAnalytics, getProductAnalytics, getUserAnalytics, exportAnalyticsReport } from "@/services/analyticsAdminService";

type SalesData = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
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

export default function AdminAnalyticsPage() {
  const t = useTranslations("admin");
  const [period, setPeriod] = useState("30d");
  const [sales, setSales] = useState<SalesData | null>(null);
  const [products, setProducts] = useState<ProductData | null>(null);
  const [users, setUsers] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const periods = [
    { label: t("period7d"), value: "7d" },
    { label: t("period30d"), value: "30d" },
    { label: t("period90d"), value: "90d" },
    { label: t("period1y"), value: "365d" },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const [salesData, productsData, usersData] = await Promise.all([
        getSalesAnalytics(period),
        getProductAnalytics(),
        getUserAnalytics(),
      ]);
      if (salesData.success) setSales(salesData.data);
      if (productsData.success) setProducts(productsData.data);
      if (usersData.success) setUsers(usersData.data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  const handleExport = async () => {
    await exportAnalyticsReport("csv");
  };

  const maxRevenue = sales?.dailySales?.length
    ? Math.max(...sales.dailySales.map((d) => d.revenue), 1)
    : 1;

  if (loading) return <div className="p-8">{t("loadingStats")}</div>;

  return (
    <div>
      <div
        className="flex justify-between items-center mb-8 p-6 rounded-xl text-white"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          <h1 className="text-3xl font-bold">{t("analyticsTitle")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/20 rounded-lg overflow-hidden">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  period === p.value ? "bg-white text-purple-700" : "text-white/80 hover:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
          >
            <Download size={18} /> {t("exportReport")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6" style={{ border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 2px 8px rgba(139,92,246,0.1)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("totalRevenue")}</p>
              <p className="text-2xl font-bold">${sales?.totalRevenue?.toLocaleString() ?? "0"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6" style={{ border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 2px 8px rgba(139,92,246,0.1)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("totalOrders")}</p>
              <p className="text-2xl font-bold">{sales?.totalOrders?.toLocaleString() ?? "0"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6" style={{ border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 2px 8px rgba(139,92,246,0.1)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("avgOrderValue")}</p>
              <p className="text-2xl font-bold">${sales?.avgOrderValue?.toFixed(2) ?? "0.00"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6" style={{ border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 2px 8px rgba(139,92,246,0.1)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("totalUsers")}</p>
              <p className="text-2xl font-bold">{users?.totalUsers?.toLocaleString() ?? "0"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6" style={{ border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 2px 8px rgba(139,92,246,0.1)" }}>
          <h2 className="text-lg font-bold mb-4">{t("salesOverview")}</h2>
          {sales?.dailySales && sales.dailySales.length > 0 ? (
            <div className="flex items-end gap-1 h-48">
              {sales.dailySales.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                  <div className="absolute -top-8 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity z-10">
                    ${day.revenue.toLocaleString()} - {new Date(day.date).toLocaleDateString()}
                  </div>
                  <div
                    className="w-full rounded-t transition-colors cursor-pointer"
                    style={{
                      height: `${Math.max((day.revenue / maxRevenue) * 100, 2)}%`,
                      minHeight: "4px",
                      background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">{t("noData")}</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6" style={{ border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 2px 8px rgba(139,92,246,0.1)" }}>
          <h2 className="text-lg font-bold mb-4">{t("topProductsTable")}</h2>
          <div className="space-y-4">
            {products?.topProducts?.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-purple-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.totalSold} {t("unitsSoldCol")}</p>
                </div>
                <span className="text-sm font-bold text-green-700">${p.revenue.toLocaleString()}</span>
              </div>
            )) ?? (
              <p className="text-sm text-gray-400">{t("noData")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
