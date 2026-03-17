"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getProductBySlug } from "@/services/productService";
import { checkWishlist, toggleWishlist } from "@/services/wishlistService";
import { addToCart } from "@/services/cartService";
import { Star, Check, AlertCircle, Truck, Heart, Scale, Minus, Plus, ShoppingCart } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ProductGallery from "@/components/product/ProductGallery";
import ShareDropdown from "@/components/product/ShareDropdown";
import SellerCard from "@/components/product/SellerCard";
import PolicyAccordions from "@/components/product/PolicyAccordions";
import BundleSection from "@/components/product/BundleSection";
import ProductTabs from "@/components/product/ProductTabs";
import RelatedProducts from "@/components/product/RelatedProducts";
import StickyMobileBar from "@/components/product/StickyMobileBar";
import { showToast } from "@/components/shared/Toast";
import Script from "next/script";

export default function ProductDetailPage() {
  const t = useTranslations("products");
  const tp = useTranslations("productPage");
  const tc = useTranslations("common");
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug as string).then((data) => {
      if (data) {
        setProduct(data);
        // Track view
        import("@/lib/apiFetch").then(({ apiFetch }) => {
          apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/search/track-view/${data.id}`, { method: "POST" }).catch(() => {});
        });
        // Check wishlist
        checkWishlist(data.id).then(res => { if (res?.success) setIsWishlisted(res.data?.inWishlist || false); }).catch(() => {});
      }
      setLoading(false);
    });
  }, [slug]);

  const currentPrice = selectedVariant ? selectedVariant.price : product?.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product?.stock;
  const priceStr = typeof currentPrice === "number" ? currentPrice.toFixed(2) : String(currentPrice || "0");

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.variants?.length > 0 && !selectedVariant) {
      showToast(t("selectOption"), "warning");
      return;
    }
    setIsAdding(true);
    const res = await addToCart(product.id, quantity, selectedVariant?.id);
    setIsAdding(false);
    if (res.success) {
      window.dispatchEvent(new Event("cart-change"));
      window.dispatchEvent(new CustomEvent("cart-drawer-open", {
        detail: {
          mode: "mini",
          product: {
            name: product.name,
            price: currentPrice,
            image: product.images?.[0]?.url || "",
            variant: selectedVariant ? `${selectedVariant.size || ""} ${selectedVariant.color || ""}`.trim() : undefined,
            quantity,
          },
        },
      }));
      showToast(t("addedToCart"), "success");
    } else {
      if (res.message?.toLowerCase().includes("token") || res.message?.toLowerCase().includes("autenticado")) {
        router.push("/auth/login");
        return;
      }
      showToast(res.message || "Error", "error");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (product.variants?.length > 0 && !selectedVariant) {
      showToast(t("selectOption"), "warning");
      return;
    }
    setIsAdding(true);
    const res = await addToCart(product.id, quantity, selectedVariant?.id);
    if (res.success) {
      window.dispatchEvent(new Event("cart-change"));
      router.push("/checkout");
    } else {
      if (res.message?.includes("autenticado") || res.message?.toLowerCase().includes("token")) {
        router.push("/auth/login");
      } else {
        showToast(res.message || "Error", "error");
      }
    }
    setIsAdding(false);
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    const res = await toggleWishlist(product.id);
    if (res.success) {
      setIsWishlisted(!isWishlisted);
      showToast(isWishlisted ? tp("removedFromWishlist") : tp("addedToWishlist"), "success");
    }
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse" />
            <div className="h-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-10 sm:p-20 text-center text-gray-500">{t("notFound")}</div>;

  // Build specs from available fields
  const specs = [
    product.weight && { label: tp("specWeight"), value: `${product.weight} kg` },
    product.category?.name && { label: tp("specCategory"), value: product.category.name },
    product.variants?.length > 0 && { label: tp("specVariants"), value: `${product.variants.length}` },
    product.stock != null && { label: tp("specStock"), value: `${product.stock}` },
  ].filter(Boolean) as { label: string; value: string }[];

  // Colors and sizes from variants
  const colors: string[] = Array.from(new Set((product.variants || []).filter((v: any) => v.color).map((v: any) => v.color as string)));
  const sizes: string[] = Array.from(new Set((product.variants || []).filter((v: any) => v.size).map((v: any) => v.size as string)));

  const reviewCount = product.reviews?.length || product._count?.reviews || 0;
  const avgRating = product.reviews?.length > 0
    ? product.reviews.reduce((a: number, r: any) => a + r.rating, 0) / product.reviews.length
    : 0;

  const productUrl = typeof window !== "undefined" ? window.location.href : "";

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.map((i: any) => i.url) || [],
    sku: product.slug,
    brand: { "@type": "Brand", name: product.vendor?.businessName || "LhamsDJ" },
    offers: {
      "@type": "Offer",
      price: currentPrice,
      priceCurrency: "USD",
      availability: currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount,
      },
    }),
  };

  return (
    <>
      <Script id="product-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: t("allProducts"), href: "/products" },
          ...(product.category ? [{ label: product.category.name, href: `/products?categoryId=${product.categoryId}` }] : []),
          { label: product.name },
        ]} />

        {/* ═══ Top section: Gallery + Info ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mt-2">

          {/* Left: Gallery */}
          <ProductGallery
            images={product.images || []}
            productName={product.name}
            categoryName={product.category?.name}
            isWishlisted={isWishlisted}
            onToggleWishlist={handleToggleWishlist}
            onShareClick={() => setShowShare(!showShare)}
          />

          {/* Right: Product info */}
          <div className="space-y-4">

            {/* Brand badge */}
            {product.vendor?.businessName && (
              <span
                className="inline-flex items-center text-xs font-medium px-2.5 py-1"
                style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6", borderRadius: 6 }}
              >
                {product.vendor.businessName}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} className={s <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                ))}
              </div>
              {avgRating > 0 && (
                <span className="text-xs font-bold px-2 py-0.5" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderRadius: 6 }}>
                  {avgRating.toFixed(1)}
                </span>
              )}
              {reviewCount > 0 && (
                <button onClick={scrollToReviews} className="text-xs text-gray-500 hover:text-purple-600 underline transition-colors">
                  {reviewCount} {tp("reviews")}
                </button>
              )}
            </div>

            {/* Price box */}
            <div className="p-3.5" style={{ border: "1px solid rgba(139,92,246,0.1)", background: "rgba(139,92,246,0.04)", borderRadius: 14 }}>
              <div className="flex items-center gap-2">
                <span
                  className="text-2xl sm:text-[28px] font-bold"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  ${priceStr}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">{tp("taxIncluded")}</span>
            </div>

            {/* Shipping */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.1)", borderRadius: 6 }}>
                <Truck size={14} className="text-green-600" />
              </div>
              <div>
                <span className="text-sm font-bold text-green-600">{tp("freeShipping")}</span>
                <p className="text-[11px] text-gray-400">{tp("deliveryEstimate")}</p>
              </div>
            </div>

            {/* ─── Variants ─── */}
            {colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {tp("color")}: <span className="text-gray-900">{selectedVariant?.color || "—"}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color: string) => {
                    const variant = product.variants.find((v: any) => v.color === color);
                    const selected = selectedVariant?.color === color;
                    return (
                      <button
                        key={color}
                        onClick={() => { setSelectedVariant(variant); }}
                        className="w-[34px] h-[34px] rounded-full transition-all duration-200"
                        style={{
                          background: color.startsWith("#") ? color : "#6b7280",
                          boxShadow: selected
                            ? "0 0 0 3px white, 0 0 0 5px #8b5cf6, 0 0 16px rgba(139,92,246,0.3)"
                            : "inset 0 0 0 1px rgba(0,0,0,0.1)",
                          transform: selected ? "scale(1)" : "scale(1)",
                        }}
                        onMouseEnter={(e) => { if (!selected) e.currentTarget.style.transform = "scale(1.15)"; }}
                        onMouseLeave={(e) => { if (!selected) e.currentTarget.style.transform = "scale(1)"; }}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{tp("size")}:</p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size: string) => {
                    const variant = product.variants.find((v: any) => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color));
                    const selected = selectedVariant?.size === size;
                    const outOfStock = variant?.stock === 0;
                    return (
                      <button
                        key={size}
                        onClick={() => { if (!outOfStock && variant) setSelectedVariant(variant); }}
                        disabled={outOfStock}
                        className="min-w-[42px] px-3 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:line-through disabled:cursor-not-allowed"
                        style={{
                          borderRadius: 10,
                          border: selected ? "1.5px solid #8b5cf6" : "1.5px solid #e5e7eb",
                          background: selected ? "rgba(139,92,246,0.08)" : "white",
                          color: selected ? "#8b5cf6" : "#374151",
                          boxShadow: selected ? "0 0 12px rgba(139,92,246,0.15)" : "none",
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Generic variant selector (if no color/size split) */}
            {product.variants?.length > 0 && colors.length === 0 && sizes.length === 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t("availableOptions")}:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any) => {
                    const selected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className="px-4 py-2 text-sm font-medium transition-all disabled:opacity-30 disabled:line-through disabled:cursor-not-allowed"
                        style={{
                          borderRadius: 10,
                          border: selected ? "1.5px solid #8b5cf6" : "1.5px solid #e5e7eb",
                          background: selected ? "rgba(139,92,246,0.08)" : "white",
                          color: selected ? "#8b5cf6" : "#374151",
                        }}
                      >
                        {variant.size && <span className="font-bold mr-1">{variant.size}</span>}
                        {variant.color && <span>{variant.color}</span>}
                        {!variant.size && !variant.color && <span>{variant.sku}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Stock indicator ─── */}
            <div className="flex items-center gap-2">
              {currentStock > 0 ? (
                currentStock < 5 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500" style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                    <span className="text-sm font-medium text-amber-600">{tp("lowStock", { count: currentStock })}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500" style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                    <span className="text-sm font-medium text-green-600">
                      <Check size={14} className="inline mr-1" />{t("inStock", { count: currentStock })}
                    </span>
                  </>
                )
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-600">
                    <AlertCircle size={14} className="inline mr-1" />{t("outOfStock")}
                  </span>
                </>
              )}
            </div>

            {/* ─── Cart controls ─── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center self-start" style={{ border: "1.5px solid #e5e7eb", borderRadius: 10 }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center transition-colors"
                  style={{ borderRadius: "8px 0 0 8px" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.color = "#8b5cf6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "inherit"; }}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 font-bold text-sm min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(currentStock || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center transition-colors"
                  style={{ borderRadius: "0 8px 8px 0" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.color = "#8b5cf6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "inherit"; }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex gap-2 flex-1">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0 || isAdding}
                  className="flex-1 text-white font-bold text-sm flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 transition-all active:scale-[0.98]"
                  style={{
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(139,92,246,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,92,246,0.3)"; }}
                >
                  <ShoppingCart size={16} />
                  {isAdding ? t("adding") : t("addToCart")}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={currentStock === 0 || isAdding}
                  className="flex-1 font-bold text-sm flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 transition-all active:scale-[0.98]"
                  style={{
                    borderRadius: 10,
                    border: "1.5px solid #8b5cf6",
                    background: "rgba(139,92,246,0.04)",
                    color: "#8b5cf6",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.04)"; }}
                >
                  {t("buyNow")}
                </button>
              </div>
            </div>

            {/* ─── Action links ─── */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleToggleWishlist}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 transition-all"
                style={{ border: "0.5px solid #e5e7eb", borderRadius: 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.color = "#8b5cf6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#4b5563"; }}
              >
                <Heart size={13} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                {isWishlisted ? tp("wishlisted") : tp("addToWishlist")}
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 transition-all"
                style={{ border: "0.5px solid #e5e7eb", borderRadius: 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.color = "#8b5cf6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#4b5563"; }}
              >
                <Scale size={13} /> {tp("compare")}
              </button>
              <ShareDropdown url={productUrl} title={product.name} />
            </div>

            {/* ─── Seller card ─── */}
            {product.vendor?.slug && <SellerCard vendorSlug={product.vendor.slug} />}

            {/* ─── Policies ─── */}
            <PolicyAccordions />

            {/* Description */}
            {product.description && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{tp("description")}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Bundle ═══ */}
        <div className="mt-10">
          <BundleSection productId={product.id} categoryId={product.categoryId} />
        </div>

        {/* ═══ Tabs: Specs / Reviews / Q&A ═══ */}
        <div className="mt-10">
          <ProductTabs productId={product.id} specs={specs} reviewsRef={reviewsRef} />
        </div>

        {/* ═══ Related Products ═══ */}
        <div className="mt-10">
          <RelatedProducts productId={product.id} />
        </div>
      </div>

      {/* ═══ Sticky mobile bar ═══ */}
      <StickyMobileBar
        price={priceStr}
        onAddToCart={handleAddToCart}
        disabled={currentStock === 0}
        adding={isAdding}
        addLabel={t("addToCart")}
        addingLabel={t("adding")}
      />

      <style jsx>{`@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
    </>
  );
}
