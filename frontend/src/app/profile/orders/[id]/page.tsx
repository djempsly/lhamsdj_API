"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, Truck } from "lucide-react";

type OrderItem = {
  id: number;
  quantity: number;
  price: string | number;
  product: { name: string };
};

type ShipmentEvent = {
  id: number;
  status: string;
  location: string | null;
  details: string | null;
  occurredAt: string;
};

type Shipment = {
  id: number;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: string;
  events: ShipmentEvent[];
};

type Address = {
  street: string;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
};

type Order = {
  id: number;
  status: string;
  total: string | number;
  createdAt: string;
  orderItems: OrderItem[];
  address: Address;
  shipments?: Shipment[];
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PROCESSING: "bg-sky-100 text-sky-800 border-sky-200",
  SHIPPED: "bg-sky-100 text-sky-800 border-sky-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-700 border-gray-200",
};

function getStatusClass(status: string): string {
  return STATUS_BADGE_CLASSES[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const v = t(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export default function OrderDetailPage() {
  const t = useTranslations("orderDetail");
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    Promise.all([
      fetch(`${apiUrl}/orders/${id}`, { credentials: "include" }).then((r) => r.json()),
      fetch(`${apiUrl}/shipments/order/${id}`, { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([orderRes, shipmentRes]) => {
        if (orderRes.success && orderRes.data) {
          setOrder(orderRes.data);
        } else {
          setNotFound(true);
        }
        if (shipmentRes.success && Array.isArray(shipmentRes.data)) {
          setShipments(shipmentRes.data);
        } else if (orderRes.success && orderRes.data?.shipments?.length) {
          setShipments(orderRes.data.shipments);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">
            {safeT(t, "loading", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-600">
            {safeT(t, "notFound", "Order not found")}
          </p>
          <Link
            href="/profile/orders"
            className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {safeT(t, "backToOrders", "Back to orders")}
          </Link>
        </div>
      </div>
    );
  }

  const addr = order.address;
  const addressLine = [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
    .filter(Boolean)
    .join(", ");
  const displayShipments = shipments.length > 0 ? shipments : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/profile/orders"
          className="p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Back to orders"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {safeT(t, "title", "Order Details")}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {safeT(t, "orderNumber", "Order #")}{order.id} · {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusClass(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* Order items */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              {safeT(t, "items", "Items")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">{safeT(t, "product", "Product")}</th>
                  <th className="px-6 py-3 text-center">{safeT(t, "quantity", "Qty")}</th>
                  <th className="px-6 py-3 text-right">{safeT(t, "unitPrice", "Unit Price")}</th>
                  <th className="px-6 py-3 text-right">{safeT(t, "subtotal", "Subtotal")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.orderItems.map((item) => {
                  const price = Number(item.price);
                  const subtotal = price * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.product?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        ${price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ${subtotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-right text-lg font-bold text-gray-900">
              {safeT(t, "total", "Total")}: ${Number(order.total).toFixed(2)}
            </p>
          </div>
        </section>

        {/* Shipping address */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              {safeT(t, "shippingAddress", "Shipping Address")}
            </h2>
          </div>
          <div className="px-6 py-4 text-gray-600">
            {addressLine || "—"}
          </div>
        </section>

        {/* Shipment tracking */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-500" />
              {safeT(t, "tracking", "Shipment Tracking")}
            </h2>
          </div>
          <div className="px-6 py-4">
            {displayShipments.length === 0 ? (
              <p className="text-gray-500">
                {safeT(t, "noTracking", "No tracking information available yet")}
              </p>
            ) : (
              <div className="space-y-6">
                {displayShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">{safeT(t, "carrier", "Carrier")}:</span>{" "}
                        <span className="font-medium">{shipment.carrier ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{safeT(t, "trackingNumber", "Tracking Number")}:</span>{" "}
                        {shipment.trackingUrl ? (
                          <a
                            href={shipment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sky-600 hover:text-sky-700 underline"
                          >
                            {shipment.trackingNumber ?? "—"}
                          </a>
                        ) : (
                          <span className="font-medium">{shipment.trackingNumber ?? "—"}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">{safeT(t, "status", "Status")}:</span>{" "}
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getStatusClass(
                            shipment.status
                          )}`}
                        >
                          {shipment.status}
                        </span>
                      </div>
                    </div>

                    {shipment.events && shipment.events.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          {safeT(t, "events", "Tracking Events")}
                        </h3>
                        <div className="relative">
                          <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
                          <ul className="space-y-3">
                            {shipment.events.map((evt) => (
                              <li key={evt.id} className="relative pl-6">
                                <span className="absolute left-0 w-2 h-2 rounded-full bg-sky-500 top-1.5" />
                                <span className="text-sm font-medium text-gray-900">{evt.status}</span>
                                {(evt.location || evt.details) && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {[evt.location, evt.details].filter(Boolean).join(" · ")}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(evt.occurredAt).toLocaleString()}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
