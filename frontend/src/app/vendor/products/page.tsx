"use client";

import { useTranslations } from "next-intl";

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const v = t(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export default function VendorProductsPage() {
  const t = useTranslations("vendor");
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {safeT(t, "products", "Products")}
      </h1>
      <p className="text-gray-500">Product management coming soon.</p>
    </div>
  );
}
