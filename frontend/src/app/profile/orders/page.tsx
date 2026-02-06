"use client";

import { useEffect, useState } from "react";
import { getMyOrders } from "@/services/orderService";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then((res) => {
      if (res.success) setOrders(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-center">Cargando historial...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/profile" className="text-gray-500 hover:text-black">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Mis Pedidos</h1>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Aún no has realizado compras.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-6 bg-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-bold text-lg">Orden #{order.id}</p>
                <p className="text-sm text-gray-500">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
                <div className="mt-2 flex gap-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-bold rounded bg-gray-100 text-gray-700">
                    {order.orderItems.length} Artículos
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold">${order.total}</p>
                {/* Aquí podrías poner un botón "Ver Detalle" en el futuro */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}