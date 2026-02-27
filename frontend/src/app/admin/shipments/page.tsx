"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Truck, Package, Search, ChevronDown, Loader2 } from "lucide-react";

type Shipment = {
  id: number;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
};

type Order = {
  id: number;
  user: { name: string; email: string };
  shipments: Shipment[];
};

const STATUS_BADGE: Record<string, string> = {
  LABEL_CREATED: "bg-gray-100 text-gray-700 border-gray-200",
  PENDING: "bg-gray-100 text-gray-700 border-gray-200",
  PICKED_UP: "bg-blue-100 text-blue-800 border-blue-200",
  IN_TRANSIT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  RETURNED: "bg-red-100 text-red-800 border-red-200",
  EXCEPTION: "bg-orange-100 text-orange-800 border-orange-200",
  FAILED: "bg-orange-100 text-orange-800 border-orange-200",
};

const UPDATABLE_STATUSES = ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

function getStatusClass(status: string): string {
  return STATUS_BADGE[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const v = t(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

type FlatShipment = {
  shipment: Shipment;
  order: Order;
};

export default function AdminShipmentsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all?limit=500`,
        { credentials: "include", cache: "no-store" }
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const flatShipments: FlatShipment[] = orders.flatMap((order) =>
    (order.shipments ?? []).map((shipment) => ({ shipment, order }))
  );

  const filteredShipments = flatShipments.filter(({ shipment, order }) => {
    const matchesStatus = statusFilter == null || shipment.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      String(order.id).includes(searchQuery) ||
      order.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.carrier?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateStatus = async (shipmentId: number, status: string) => {
    setUpdatingId(shipmentId);
    setOpenDropdown(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/shipments/${shipmentId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
          credentials: "include",
        }
      );
      const json = await res.json();
      if (json.success) {
        await loadOrders();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const statusTabs = [
    null,
    "PENDING",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "RETURNED",
    "FAILED",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="text-gray-500">{t("loadingOrders")}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="w-8 h-8 text-gray-700" />
          {safeT(t, "shipments", "Shipments")}
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusTabs.map((status) => (
          <button
            key={status ?? "all"}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {status === null
              ? safeT(t, "allShipments", "All Shipments")
              : status.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={tCommon("search") ?? "Search"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-gray-500">
                  {safeT(t, "orderNumber", "Order #")}
                </th>
                <th className="p-4 font-medium text-gray-500">{t("customer")}</th>
                <th className="p-4 font-medium text-gray-500">
                  {t("shippingStatus")}
                </th>
                <th className="p-4 font-medium text-gray-500">
                  {safeT(t, "carrier", "Carrier")}
                </th>
                <th className="p-4 font-medium text-gray-500">
                  {safeT(t, "trackingNumber", "Tracking Number")}
                </th>
                <th className="p-4 font-medium text-gray-500 text-right">
                  {t("manage")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map(({ shipment, order }) => (
                <tr
                  key={shipment.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <Link
                      href={`/profile/orders/${order.id}`}
                      className="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-sm">{order.user?.name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{order.user?.email ?? "—"}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusClass(
                        shipment.status
                      )}`}
                    >
                      {shipment.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-700">
                    {shipment.carrier ?? "—"}
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-700">
                    {shipment.trackingNumber ?? "—"}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === shipment.id ? null : shipment.id
                            )
                          }
                          disabled={updatingId === shipment.id}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          {updatingId === shipment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                          {safeT(t, "updateStatus", "Update Status")}
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {openDropdown === shipment.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 py-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                              {UPDATABLE_STATUSES.filter(
                                (s) => s !== shipment.status
                              ).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateStatus(shipment.id, status)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {status.replace(/_/g, " ")}
                                </button>
                              ))}
                              {UPDATABLE_STATUSES.every(
                                (s) => s === shipment.status
                              ) && (
                                <div className="px-4 py-2 text-sm text-gray-400">
                                  {shipment.status === "DELIVERED"
                                    ? "Already delivered"
                                    : "No changes available"}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredShipments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-gray-500"
                  >
                    {safeT(t, "noShipments", "No shipments found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
