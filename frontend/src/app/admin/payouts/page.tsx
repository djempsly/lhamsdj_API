"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Wallet, RefreshCw, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPayoutsPage() {
  const t = useTranslations("admin");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleProcessPayouts = async () => {
    setProcessing(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/vendor-payouts/process`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success) {
        setResult({
          type: "success",
          message: json.message || t("payoutsProcessed"),
        });
      } else {
        setResult({
          type: "error",
          message: json.message || t("payoutsError"),
        });
      }
    } catch {
      setResult({
        type: "error",
        message: t("payoutsError"),
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wallet className="w-8 h-8 text-gray-700" />
          {t("vendorPayouts")}
        </h1>
        <button
          onClick={handleProcessPayouts}
          disabled={processing}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {processing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          {t("processPayouts")}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {result.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-12 text-center text-gray-500">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{t("noPendingPayouts")}</p>
        </div>
      </div>
    </div>
  );
}
