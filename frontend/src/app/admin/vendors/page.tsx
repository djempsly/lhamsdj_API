"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getVendors, updateVendorStatus, reviewVendorKyc } from "@/services/adminService";
import { Store, Check, X, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminVendorsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [kycModal, setKycModal] = useState<{ vendorId: number; businessName: string } | null>(null);
  const [kycStatus, setKycStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [kycNotes, setKycNotes] = useState("");
  const [kycSubmitting, setKycSubmitting] = useState(false);

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

  const handleKycReview = async () => {
    if (!kycModal) return;
    if (kycStatus === "REJECTED" && !kycNotes.trim()) {
      alert("Notes are required when rejecting KYC.");
      return;
    }
    setKycSubmitting(true);
    const res = await reviewVendorKyc(kycModal.vendorId, { status: kycStatus, notes: kycNotes.trim() || undefined });
    setKycSubmitting(false);
    if (res.success) {
      setKycModal(null);
      setKycNotes("");
      setKycStatus("APPROVED");
      load();
    } else {
      alert(res.message || "Error");
    }
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
              <th className="p-4 font-medium text-gray-500">KYC</th>
              <th className="p-4 font-medium text-gray-500">{tCommon("status")}</th>
              <th className="p-4 font-medium text-gray-500 text-right">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">{tCommon("loading")}</td></tr>
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
                    v.kycStatus === "APPROVED" ? "bg-green-100 text-green-800" :
                    v.kycStatus === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {v.kycStatus ?? "—"}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    v.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                    v.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    v.status === "SUSPENDED" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2 flex-wrap">
                  {v.kycStatus === "PENDING" && (
                    <button onClick={() => setKycModal({ vendorId: v.id, businessName: v.businessName })} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Review KYC">
                      <ShieldCheck size={18} />
                    </button>
                  )}
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
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">{t("noVendors")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {kycModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Review KYC: {kycModal.businessName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
                <select value={kycStatus} onChange={(e) => setKycStatus(e.target.value as "APPROVED" | "REJECTED")} className="w-full border rounded-lg px-3 py-2">
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes {kycStatus === "REJECTED" && "(required)"}</label>
                <textarea value={kycNotes} onChange={(e) => setKycNotes(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2" placeholder="Optional notes or reason for rejection" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => { setKycModal(null); setKycNotes(""); setKycStatus("APPROVED"); }} className="flex-1 border rounded-lg py-2 font-medium">Cancel</button>
              <button onClick={handleKycReview} disabled={kycSubmitting} className="flex-1 bg-black text-white rounded-lg py-2 font-medium disabled:opacity-50">
                {kycSubmitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
