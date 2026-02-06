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
import { Users, ShoppingBag, DollarSign, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0
  });

  const loadStats = async () => {
    const res = await getDashboardStats();
    if (res.success) setStats(res.data);
  };

  useEffect(() => {
    loadStats(); // Cargar al entrar

    // OPCIONAL: Auto-actualizar cada 10 segundos para ver registros "en vivo"
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Tarjeta Ingresos */}
        <StatCard 
          title="Ingresos Totales" 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon={<DollarSign size={24} className="text-green-600" />}
          bg="bg-green-50"
        />

        {/* Tarjeta Usuarios */}
        <StatCard 
          title="Usuarios Registrados" 
          value={stats.users} 
          icon={<Users size={24} className="text-blue-600" />}
          bg="bg-blue-50"
        />

        {/* Tarjeta Productos */}
        <StatCard 
          title="Productos Activos" 
          value={stats.products} 
          icon={<ShoppingBag size={24} className="text-purple-600" />}
          bg="bg-purple-50"
        />

        {/* Tarjeta Órdenes */}
        <StatCard 
          title="Total Órdenes" 
          value={stats.orders} 
          icon={<ShoppingCart size={24} className="text-orange-600" />}
          bg="bg-orange-50"
        />

      </div>
    </div>
  );
}

// Componente pequeño para no repetir código HTML
function StatCard({ title, value, icon, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
      <div className={`p-3 rounded-full ${bg}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}