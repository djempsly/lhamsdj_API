"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { getCategoryPlaceholder } from "@/components/shared/cardColors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BundleProduct = {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  images?: { url: string }[];
  category?: { name: string };
};

type Bundle = {
  id: number;
  name: string;
  price: string | number;
  discount: number;
  items: { product: BundleProduct; quantity: number }[];
};

export default function BundleSection({ productId, categoryId }: { productId: number; categoryId?: number }) {
  const t = useTranslations("productPage");
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<BundleProduct[]>([]);

  useEffect(() => {
    // Try to find a bundle containing this product
    fetch(`${API_URL}/marketplace/bundles`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        if (j.success && Array.isArray(j.data)) {
          const found = j.data.find((b: Bundle) => b.items.some((item: { product: BundleProduct }) => item.product.id === productId));
          if (found) { setBundle(found); return; }
        }
        // Fallback: get related products from same category
        if (categoryId) {
          fetch(`${API_URL}/search/recommendations/${productId}`, { cache: "no-store" })
            .then(r => r.json())
            .then(j => { if (j.success && Array.isArray(j.data)) setRelatedProducts(j.data.slice(0, 3)); })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [productId, categoryId]);

  const items = bundle ? bundle.items.map(i => i.product) : relatedProducts;
  if (items.length < 2) return null;

  const displayItems = items.slice(0, 3);
  const totalPrice = displayItems.reduce((sum, p) => sum + Number(p.price), 0);
  const discount = bundle ? bundle.discount : 10;
  const bundlePrice = bundle ? Number(bundle.price) : totalPrice * (1 - discount / 100);

  return (
    <section
      className="p-5 sm:p-6 relative overflow-hidden"
      style={{ border: "1px solid rgba(236,72,153,0.15)", borderRadius: 18, background: "rgba(236,72,153,0.02)" }}
    >
      {/* Glow orb */}
      <div className="absolute -top-20 -right-20 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{t("bundleTitle")}</h3>
          <span
            className="text-white text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "linear-gradient(135deg, #ec4899, #d946ef)" }}
          >
            {t("bundleSave", { percent: discount })}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
          {displayItems.map((product, i) => {
            const img = product.images?.[0]?.url;
            const ph = getCategoryPlaceholder(product.category?.name);
            return (
              <div key={product.id} className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {i > 0 && <Plus size={16} className="text-pink-400 flex-shrink-0" />}
                <Link
                  href={`/product/${product.slug}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 relative overflow-hidden bg-gray-100 flex-shrink-0 transition-all duration-200"
                  style={{ borderRadius: 12, border: "1px solid #f3f4f6" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(236,72,153,0.3)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(236,72,153,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f3f4f6"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {img ? (
                    <Image src={img} alt={product.name} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: ph.bg }}>{ph.icon}</div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-pink-100">
          <div>
            <span className="text-xs text-gray-400 line-through mr-2">${totalPrice.toFixed(2)}</span>
            <span className="text-lg font-bold" style={{ background: "linear-gradient(135deg, #ec4899, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ${bundlePrice.toFixed(2)}
            </span>
          </div>
          <button
            className="text-white text-sm font-bold px-4 py-2 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-100"
            style={{ borderRadius: 10, background: "linear-gradient(135deg, #ec4899, #d946ef)", boxShadow: "0 4px 12px rgba(236,72,153,0.25)" }}
          >
            <ShoppingCart size={14} /> {t("bundleAdd")}
          </button>
        </div>
      </div>
    </section>
  );
}
