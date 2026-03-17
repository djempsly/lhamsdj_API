"use client";

import { useState } from "react";
import { Truck, RotateCcw, Shield, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PolicyAccordions() {
  const t = useTranslations("productPage");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const policies = [
    { icon: Truck, title: t("policyShipping"), content: t("policyShippingDesc") },
    { icon: RotateCcw, title: t("policyReturns"), content: t("policyReturnsDesc") },
    { icon: Shield, title: t("policyWarranty"), content: t("policyWarrantyDesc") },
  ];

  return (
    <div className="space-y-1.5">
      {policies.map((p, i) => {
        const open = openIdx === i;
        const Icon = p.icon;
        return (
          <div
            key={i}
            className="transition-all duration-200"
            style={{
              border: open ? "0.5px solid rgba(139,92,246,0.3)" : "0.5px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: open ? "0 2px 8px rgba(139,92,246,0.06)" : "none",
            }}
            onMouseEnter={(e) => { if (!open) e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)"; }}
            onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = "#e5e7eb"; }}
          >
            <button
              onClick={() => setOpenIdx(open ? null : i)}
              className="w-full flex items-center gap-3 px-3.5 py-3 text-left"
            >
              <Icon size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 flex-1">{p.title}</span>
              <ChevronDown
                size={14}
                className="text-gray-400 transition-transform duration-200 flex-shrink-0"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
              />
            </button>
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: open ? 200 : 0, opacity: open ? 1 : 0 }}
            >
              <p className="px-3.5 pb-3 text-xs text-gray-500 leading-relaxed">{p.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
