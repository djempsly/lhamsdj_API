"use client";

import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "@/services/adminService";
import { Package, Truck, CheckCircle } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const res = await getAllOrders();
    if (res.success) setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (id: number, newStatus: string) => {
    if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return;
    const res = await updateOrderStatus(id, newStatus);
    if (res.success) loadOrders();
  };

  if (loading) return <div className="p-8">Cargando órdenes...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Órdenes de Compra</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">ID</th>
              <th className="p-4 font-medium text-gray-500">Cliente</th>
              <th className="p-4 font-medium text-gray-500">Total</th>
              <th className="p-4 font-medium text-gray-500">Pago</th>
              <th className="p-4 font-medium text-gray-500">Estado Envío</th>
              <th className="p-4 font-medium text-gray-500 text-right">Gestionar</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono text-sm">#{order.id}</td>
                <td className="p-4">
                  <p className="font-bold text-sm">{order.user.name}</p>
                  <p className="text-xs text-gray-500">{order.user.email}</p>
                </td>
                <td className="p-4 font-bold text-green-700">${order.total}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                    order.status === 'DELIVERED' ? 'bg-gray-800 text-white' : 
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {/* Botones de acción rápida */}
                    {order.status === 'PAID' && (
                      <button 
                        onClick={() => changeStatus(order.id, 'SHIPPED')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Marcar como Enviado"
                      >
                        <Truck size={18} />
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button 
                        onClick={() => changeStatus(order.id, 'DELIVERED')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Marcar como Entregado"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay órdenes registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}