"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getAllOrders, updateOrderStatus, downloadOrdersCsv } from "@/services/adminService";
import { Truck, CheckCircle, Download } from "lucide-react";

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const res = await getAllOrders();
    if (res.success) setOrders(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (id: number, newStatus: string) => {
    if (!confirm(t("changeStatusConfirm", { status: newStatus }))) return;
    const res = await updateOrderStatus(id, newStatus);
    if (res.success) loadOrders();
  };

  if (loading) return <div className="p-8">{t("loadingOrders")}</div>;

  const handleExport = async () => {
    try {
      await downloadOrdersCsv();
    } catch (e) {
      alert(t("exportErrorMsg"));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("purchaseOrders")}</h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
          <Download size={18} /> {t("exportCSV")}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">{tCommon("id")}</th>
              <th className="p-4 font-medium text-gray-500">{t("customer")}</th>
              <th className="p-4 font-medium text-gray-500">{tCommon("total")}</th>
              <th className="p-4 font-medium text-gray-500">{t("paymentStatus")}</th>
              <th className="p-4 font-medium text-gray-500">{t("shippingStatus")}</th>
              <th className="p-4 font-medium text-gray-500 text-right">{t("manage")}</th>
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
                        title={t("markShipped")}
                      >
                        <Truck size={18} />
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button 
                        onClick={() => changeStatus(order.id, 'DELIVERED')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title={t("markDelivered")}
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">{t("noOrders")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}