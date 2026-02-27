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

type Payout = {
  id: number;
  amount: number;
  currency: string;
  status: string;
  stripePayoutId: string | null;
  paidAt: string | null;
  createdAt: string;
};

export default function VendorPayoutsPage() {
  const t = useTranslations("vendor");
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`${API_URL}/vendor-payouts/mine`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPayouts(json.data);
      } else {
        setPayouts([]);
      }
    } catch {
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
    // Check if Stripe is connected via vendor profile
    fetch(`${API_URL}/vendors/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data?.stripeAccountId) {
          setStripeConnected(true);
        } else {
          setStripeConnected(false);
        }
      })
      .catch(() => setStripeConnected(false));
  }, []);

  const handleConnectStripe = async () => {
    setConnecting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/vendor-payouts/connect`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        window.location.href = json.data.url;
        return;
      }
      setError(json.message || "Failed to create Connect link");
    } catch {
      setError("Network error");
    } finally {
      setConnecting(false);
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
        {safeT(t, "payouts", "Payouts")}
      </h1>

      {stripeConnected === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="font-semibold text-amber-900 mb-2">
            {safeT(t, "setupStripeConnect", "Set up Stripe Connect")}
          </h2>
          <p className="text-amber-800 text-sm mb-4">
            {safeT(t, "setupConnectDesc", "Connect your Stripe account to receive payouts from your sales.")}
          </p>
          <button
            type="button"
            onClick={handleConnectStripe}
            disabled={connecting}
            className="py-2 px-4 bg-[#065f46] text-white font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50"
          >
            {connecting ? "Connecting..." : safeT(t, "setupStripeConnect", "Set up Stripe Connect")}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="px-6 py-4 font-semibold text-gray-900 border-b border-gray-200">
          {safeT(t, "payoutHistory", "Payout History")}
        </h2>
        {payouts.length === 0 ? (
          <p className="px-6 py-12 text-gray-500 text-center">
            {safeT(t, "noPayouts", "No payouts yet")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {safeT(t, "amount", "Amount")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {safeT(t, "transferId", "Transfer ID")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {safeT(t, "paidAt", "Paid At")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${Number(p.amount).toFixed(2)} {p.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          p.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {p.stripePayoutId || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString()
                        : new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
