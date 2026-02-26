// export default function AdminDashboard() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Bienvenido al Panel de Control</h1>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Tarjetas de Resumen (Stat Cards) */}
//         <div className="bg-white p-6 rounded-xl shadow-sm border">
//           <h3 className="text-gray-500 text-sm font-medium">Ingresos Totales</h3>
//           <p className="text-2xl font-bold mt-2">$0.00</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border">
//           <h3 className="text-gray-500 text-sm font-medium">Órdenes Pendientes</h3>
//           <p className="text-2xl font-bold mt-2">0</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border">
//           <h3 className="text-gray-500 text-sm font-medium">Productos Activos</h3>
//           <p className="text-2xl font-bold mt-2">0</p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/adminService";
import { Users, ShoppingBag, DollarSign, ShoppingCart, Store, TrendingUp, Package } from "lucide-react";

type Overview = {
  totalOrders: number;
  ordersThisMonth: number;
  ordersLastMonth: number;
  revenueTotal: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  totalUsers: number;
  activeVendors: number;
  activeSuppliers: number;
  pendingVendors: number;
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});
  const [topProducts, setTopProducts] = useState<{ productId: number; name: string; unitsSold: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    const res = await getDashboardStats();
    if (res.success && res.data) {
      setOverview(res.data.overview ?? null);
      setOrdersByStatus(res.data.ordersByStatus ?? {});
      setTopProducts(res.data.topProducts ?? []);
      setRecentOrders(res.data.recentOrders ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8">Cargando estadísticas...</div>;
  if (!overview) return <div className="p-8">No se pudieron cargar las estadísticas.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Ingresos totales"
          value={`$${overview.revenueTotal.toLocaleString()}`}
          icon={<DollarSign size={24} className="text-green-600" />}
          bg="bg-green-50"
        />
        <StatCard
          title="Ingresos este mes"
          value={`$${overview.revenueThisMonth.toLocaleString()}`}
          sub={overview.revenueGrowth !== 0 ? `${overview.revenueGrowth > 0 ? "+" : ""}${overview.revenueGrowth}% vs mes anterior` : undefined}
          icon={<TrendingUp size={24} className="text-emerald-600" />}
          bg="bg-emerald-50"
        />
        <StatCard
          title="Total órdenes"
          value={overview.totalOrders}
          sub={`${overview.ordersThisMonth} este mes`}
          icon={<ShoppingCart size={24} className="text-orange-600" />}
          bg="bg-orange-50"
        />
        <StatCard
          title="Usuarios"
          value={overview.totalUsers}
          icon={<Users size={24} className="text-blue-600" />}
          bg="bg-blue-50"
        />
        <StatCard
          title="Vendedores activos"
          value={overview.activeVendors}
          sub={overview.pendingVendors ? `${overview.pendingVendors} pendientes` : undefined}
          icon={<Store size={24} className="text-purple-600" />}
          bg="bg-purple-50"
        />
        <StatCard
          title="Proveedores"
          value={overview.activeSuppliers}
          icon={<Package size={24} className="text-indigo-600" />}
          bg="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-lg mb-4">Órdenes por estado</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <span key={status} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {status}: <strong>{count}</strong>
              </span>
            ))}
            {Object.keys(ordersByStatus).length === 0 && <p className="text-gray-500 text-sm">Sin datos</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-lg mb-4">Top productos (unidades vendidas)</h2>
          <ul className="space-y-2">
            {topProducts.slice(0, 5).map((p) => (
              <li key={p.productId} className="flex justify-between text-sm">
                <span className="truncate">{p.name}</span>
                <strong>{p.unitsSold}</strong>
              </li>
            ))}
            {topProducts.length === 0 && <p className="text-gray-500 text-sm">Sin datos</p>}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-4">Últimas órdenes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">ID</th>
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Estado</th>
                <th className="pb-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100">
                  <td className="py-2 font-mono">#{o.id}</td>
                  <td className="py-2">{o.userName}</td>
                  <td className="py-2">${Number(o.total).toFixed(2)}</td>
                  <td className="py-2">{o.status}</td>
                  <td className="py-2 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-gray-500">Sin órdenes recientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon, bg }: { title: string; value: string | number; sub?: string; icon: React.ReactNode; bg: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
      <div className={`p-3 rounded-full ${bg}`}>{icon}</div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}