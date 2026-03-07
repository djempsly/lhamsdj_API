"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getMyKyc, submitKyc } from "@/services/vendorService";
import { ShieldCheck } from "lucide-react";

const DOC_TYPES = ["ID_CARD", "PASSPORT", "TAX_ID"] as const;

type KycData = {
  kycStatus: string;
  documentType: string | null;
  documentUrl: string | null;
  documentVerifiedAt: string | null;
  businessAddressVerifiedAt: string | null;
  bankAccountVerifiedAt: string | null;
};

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const v = t(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export default function VendorKycPage() {
  const t = useTranslations("vendor");
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [allowedTypes, setAllowedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ documentType: "ID_CARD", documentUrl: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    const res = await getMyKyc();
    if (res.success && res.data) {
      setKyc(res.data);
      if (Array.isArray(res.allowedDocumentTypes)) setAllowedTypes(res.allowedDocumentTypes);
    } else {
      setError(res.message || "Failed to load KYC status");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.documentUrl.trim()) {
      setError("Please enter the document URL");
      return;
    }
    setSubmitting(true);
    const res = await submitKyc({
      documentType: form.documentType,
      documentUrl: form.documentUrl.trim(),
    });
    setSubmitting(false);
    if (res.success) {
      setSuccess("KYC submitted for review. We will verify your document and identity.");
      setForm((f) => ({ ...f, documentUrl: "" }));
      load();
    } else {
      setError(res.message || "Submit failed");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="w-8 h-8" />
        {safeT(t, "kyc", "Verification (KYC)")}
      </h1>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

      {kyc && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Status</h2>
          <p>
            <span className="text-gray-500">KYC status: </span>
            <span className={`font-medium px-2 py-1 rounded ${
              kyc.kycStatus === "APPROVED" ? "bg-green-100 text-green-800" :
              kyc.kycStatus === "PENDING" ? "bg-amber-100 text-amber-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {kyc.kycStatus}
            </span>
          </p>
          {kyc.documentVerifiedAt && (
            <p className="text-sm text-gray-500 mt-2">Document verified at {new Date(kyc.documentVerifiedAt).toLocaleString()}</p>
          )}
        </div>
      )}

      {kyc && kyc.kycStatus !== "APPROVED" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">Submit verification</h2>
          <p className="text-gray-500 text-sm mb-4">Upload your document to a secure URL (e.g. cloud storage) and paste the link below. Allowed types: ID card, passport, tax ID.</p>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document type</label>
              <select
                value={form.documentType}
                onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {(allowedTypes.length ? allowedTypes : DOC_TYPES).map((type) => (
                  <option key={type} value={type}>{type.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document URL</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={form.documentUrl}
                onChange={(e) => setForm((f) => ({ ...f, documentUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#065f46] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#054a36] disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for review"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
