"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getVendors, updateVendorStatus } from "@/services/adminService";
import { Store, Check, X, Clock } from "lucide-react";
import Link from "next/link";

export default function AdminVendorsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = async () => {
    setLoading(true);
    const res = await getVendors({ status: statusFilter || undefined, limit: 100 });
    if (res.success) setVendors(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleStatus = async (id: number, status: string) => {
    if (!confirm(t("changeVendorStatus", { status }))) return;
    const res = await updateVendorStatus(id, { status });
    if (res.success) load();
    else alert(res.message || "Error");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t("vendors")}</h1>
      <div className="mb-4 flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">{t("all")}</option>
          <option value="PENDING">{t("pending")}</option>
          <option value="ACTIVE">{t("activeStatus")}</option>
          <option value="SUSPENDED">{t("suspended")}</option>
          <option value="REJECTED">{t("rejected")}</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">{t("store")}</th>
              <th className="p-4 font-medium text-gray-500">{t("slug")}</th>
              <th className="p-4 font-medium text-gray-500">{t("country")}</th>
              <th className="p-4 font-medium text-gray-500">{t("commission")}</th>
              <th className="p-4 font-medium text-gray-500">{tCommon("status")}</th>
              <th className="p-4 font-medium text-gray-500 text-right">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">{tCommon("loading")}</td></tr>
            )}
            {!loading && vendors.map((v) => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{v.businessName}</td>
                <td className="p-4">
                  <Link href={`/vendor/${v.slug}`} className="text-blue-600 hover:underline">{v.slug}</Link>
                </td>
                <td className="p-4">{v.country}</td>
                <td className="p-4">{v.commissionRate}%</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    v.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                    v.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    v.status === "SUSPENDED" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {v.status === "PENDING" && (
                    <>
                      <button onClick={() => handleStatus(v.id, "ACTIVE")} className="p-2 text-green-600 hover:bg-green-50 rounded" title={t("approve")}>
                        <Check size={18} />
                      </button>
                      <button onClick={() => handleStatus(v.id, "REJECTED")} className="p-2 text-red-600 hover:bg-red-50 rounded" title={t("reject")}>
                        <X size={18} />
                      </button>
                    </>
                  )}
                  {v.status === "ACTIVE" && (
                    <button onClick={() => handleStatus(v.id, "SUSPENDED")} className="p-2 text-orange-600 hover:bg-orange-50 rounded" title={t("suspend")}>
                      <Clock size={18} />
                    </button>
                  )}
                  {v.status === "SUSPENDED" && (
                    <button onClick={() => handleStatus(v.id, "ACTIVE")} className="p-2 text-green-600 hover:bg-green-50 rounded" title={t("reactivate")}>
                      <Check size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && vendors.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">{t("noVendors")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
