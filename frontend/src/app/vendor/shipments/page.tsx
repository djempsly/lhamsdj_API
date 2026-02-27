"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const v = t(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

type Shipment = {
  id: number;
  orderId: number;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  order?: { id: number; total: number; user?: { name: string } };
};

export default function VendorShipmentsPage() {
  const t = useTranslations("vendor");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${API_URL}/shipments/vendor/mine`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setShipments(json.data);
      } else {
        setShipments([]);
      }
    } catch {
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const openEdit = (s: Shipment) => {
    setEditingId(s.id);
    setTrackingNumber(s.trackingNumber || "");
    setCarrier(s.carrier || "");
  };

  const closeEdit = () => {
    setEditingId(null);
    setTrackingNumber("");
    setCarrier("");
    setError("");
  };

  const handleUpdate = async (id: number) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_URL}/shipments/${id}/tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, carrier }),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(safeT(t, "trackingUpdated", "Tracking updated successfully"));
        closeEdit();
        fetchShipments();
      } else {
        setError(json.message || "Update failed");
      }
    } catch {
      setError("Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-10 w-10 border-2 border-[#065f46] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {safeT(t, "shipments", "Shipments")}
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {shipments.length === 0 ? (
          <p className="px-6 py-12 text-gray-500 text-center">
            No shipments yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {safeT(t, "trackingNumber", "Tracking #")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {safeT(t, "carrier", "Carrier")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shipments.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{s.order?.id ?? s.orderId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.order?.user?.name ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.trackingNumber || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.carrier || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === s.id ? (
                        <div className="space-y-2 max-w-xs">
                          <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Tracking number"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            placeholder="Carrier"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                          />
                          {error && (
                            <p className="text-xs text-red-600">{error}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdate(s.id)}
                              className="px-3 py-1.5 text-sm bg-[#065f46] text-white rounded hover:bg-emerald-800"
                            >
                              {safeT(t, "updateTracking", "Update")}
                            </button>
                            <button
                              type="button"
                              onClick={closeEdit}
                              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          className="text-sm text-[#065f46] font-medium hover:underline"
                        >
                          {safeT(t, "updateTracking", "Update Tracking")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {success && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
