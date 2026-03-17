"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MessageCircle, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type VendorInfo = {
  businessName: string;
  slug: string;
  description?: string;
  logo?: string;
  country?: string;
  type?: string;
  _count?: { products: number };
  createdAt?: string;
};

export default function SellerCard({ vendorSlug }: { vendorSlug?: string }) {
  const t = useTranslations("productPage");
  const [vendor, setVendor] = useState<VendorInfo | null>(null);

  useEffect(() => {
    if (!vendorSlug) return;
    fetch(`${API_URL}/vendors/profile/${vendorSlug}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => { if (j.success && j.data) setVendor(j.data); })
      .catch(() => {});
  }, [vendorSlug]);

  if (!vendor) return null;

  const initial = vendor.businessName.charAt(0).toUpperCase();

  return (
    <div
      className="p-4 transition-all duration-300"
      style={{
        border: "1px solid rgba(6,182,212,0.15)",
        background: "rgba(6,182,212,0.02)",
        borderRadius: 14,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(6,182,212,0.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ borderRadius: 10, background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}
        >
          {vendor.logo ? (
            <img src={vendor.logo} alt="" className="w-full h-full object-cover" style={{ borderRadius: 10 }} />
          ) : initial}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/vendor/${vendor.slug}`} className="font-semibold text-gray-900 text-sm hover:text-cyan-700 transition-colors truncate block">
            {vendor.businessName}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Star size={11} className="text-cyan-500 fill-cyan-500" />
              <span className="text-[11px] font-medium text-cyan-700">4.8</span>
            </div>
            <span className="text-[10px] text-gray-400">|</span>
            <span className="text-[10px] text-gray-500">{vendor._count?.products || 0} {t("sellerProducts")}</span>
          </div>
        </div>
        <Link
          href={`/vendor/${vendor.slug}`}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-cyan-300 hover:text-cyan-600 transition-all text-gray-400"
        >
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="text-center flex-1">
          <div className="text-xs font-bold text-gray-900">98%</div>
          <div className="text-[10px] text-gray-400">{t("sellerPositive")}</div>
        </div>
        <div className="w-px h-6 bg-gray-100" />
        <div className="text-center flex-1">
          <div className="text-xs font-bold text-gray-900">{vendor._count?.products || "—"}</div>
          <div className="text-[10px] text-gray-400">{t("sellerProducts")}</div>
        </div>
        <div className="w-px h-6 bg-gray-100" />
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-0.5">
            <MessageCircle size={10} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-900">24h</span>
          </div>
          <div className="text-[10px] text-gray-400">{t("sellerResponse")}</div>
        </div>
      </div>
    </div>
  );
}
