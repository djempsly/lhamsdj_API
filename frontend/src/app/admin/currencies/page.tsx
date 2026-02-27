"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, Globe, DollarSign } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Currency = { code: string; name: string; symbol?: string; rate?: number };
type Country = { code: string; name: string; currency?: string; flag?: string };

export default function AdminCurrencies() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [curRes, countriesRes] = await Promise.all([
        fetch(`${API_URL}/currencies`, { cache: "no-store" }),
        fetch(`${API_URL}/currencies/countries`, { cache: "no-store" }),
      ]);
      const curData = await curRes.json();
      const countriesData = await countriesRes.json();
      if (curData?.data) setCurrencies(Array.isArray(curData.data) ? curData.data : []);
      if (countriesData?.data) setCountries(Array.isArray(countriesData.data) ? countriesData.data : []);
    } catch {
      setMessage({ type: "error", text: tCommon("error") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSync = async () => {
    try {
      const res = await fetch(`${API_URL}/currencies/sync`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        showMessage("success", t("syncSuccess"));
        loadData();
      } else {
        showMessage("error", t("syncError"));
      }
    } catch {
      showMessage("error", t("syncError"));
    }
  };

  const handleSeed = async () => {
    try {
      const res = await fetch(`${API_URL}/currencies/seed-countries`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        showMessage("success", t("seedSuccess"));
        loadData();
      } else {
        showMessage("error", t("seedError"));
      }
    } catch {
      showMessage("error", t("seedError"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t("currencyManagement")}</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Admin actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={handleSync}
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          <RefreshCw size={18} />
          {t("syncExchangeRates")}
        </button>
        <button
          onClick={handleSeed}
          className="inline-flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          <Globe size={18} />
          {t("seedCountries")}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Currencies table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
            <DollarSign size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">{t("currencies")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-medium text-gray-500">{t("code")}</th>
                  <th className="p-4 font-medium text-gray-500">{tCommon("name")}</th>
                  <th className="p-4 font-medium text-gray-500">{t("symbol")}</th>
                  <th className="p-4 font-medium text-gray-500">{t("rate")}</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((c) => (
                  <tr key={c.code} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono font-semibold">{c.code}</td>
                    <td className="p-4">{c.name || "-"}</td>
                    <td className="p-4">{c.symbol ?? "-"}</td>
                    <td className="p-4 text-gray-600">{c.rate != null ? c.rate : "-"}</td>
                  </tr>
                ))}
                {currencies.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      {t("noCurrencies")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Countries table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
            <Globe size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">{t("countries")}</h2>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="p-4 font-medium text-gray-500">{t("code")}</th>
                  <th className="p-4 font-medium text-gray-500">{tCommon("name")}</th>
                  <th className="p-4 font-medium text-gray-500">{t("currency")}</th>
                  <th className="p-4 font-medium text-gray-500">{t("flag")}</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((c) => (
                  <tr key={c.code} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono font-semibold">{c.code}</td>
                    <td className="p-4">{c.name || "-"}</td>
                    <td className="p-4">{c.currency ?? "-"}</td>
                    <td className="p-4">{c.flag ?? "-"}</td>
                  </tr>
                ))}
                {countries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      {t("noCountries")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
