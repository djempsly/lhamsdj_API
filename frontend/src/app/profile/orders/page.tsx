"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getMyOrders } from "@/services/orderService";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MyOrdersPage() {
  const t = useTranslations("profile");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then((res) => {
      if (res.success) setOrders(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-center">{t("loadingHistory")}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/profile" className="text-gray-500 hover:text-black">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">{t("myOrders")}</h1>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-10">{t("noPurchases")}</p>
        ) : (
          orders.map((order) => (
            <Link key={order.id} href={`/profile/orders/${order.id}`}>
              <div className="border rounded-lg p-6 bg-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:border-gray-300 transition-colors cursor-pointer">
                <div>
                  <p className="font-bold text-lg">{t("orderNumber")}{order.id}</p>
                  <p className="text-sm text-gray-500">{t("orderDate")}: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 flex gap-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status}
                    </span>
                    <span className="px-2 py-1 text-xs font-bold rounded bg-gray-100 text-gray-700">
                      {order.orderItems.length} {t("items")}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold">${order.total}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}