"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingCart, Truck } from "lucide-react";
import { CARD_COLORS, BADGE_GRADIENTS, getCategoryPlaceholder } from "@/components/shared/cardColors";

type ProductData = {
  id: number;
  name: string;
  slug?: string;
  price: string | number;
  description?: string | null;
  stock?: number;
  images?: { url: string }[];
  category?: { name: string; slug?: string };
  _count?: { reviews: number };
};

type Badge = "new" | "bestSeller" | "hot" | "discount";

type Props = {
  product: ProductData;
  colorIndex?: number;
  variant?: "default" | "compact" | "horizontal";
  badge?: Badge;
  badgeLabel?: string;
  discountPercent?: number;
  showStars?: boolean;
  showShipping?: boolean;
  showStock?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function ProductCard({
  product,
  colorIndex = 0,
  variant = "default",
  badge,
  badgeLabel,
  discountPercent,
  showStars = true,
  showShipping = false,
  showStock = false,
  className = "",
  style,
}: Props) {
  const c = CARD_COLORS[colorIndex % CARD_COLORS.length];
  const img = product.images?.[0]?.url;
  const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;
  const href = `/product/${product.slug || product.id}`;
  const categoryPlaceholder = getCategoryPlaceholder(product.category?.name);

  // Auto-badge: if product has stock < 5 and > 0, show "hot"
  const effectiveBadge = badge || (product.stock != null && product.stock > 0 && product.stock < 5 ? "hot" : undefined);
  const effectiveBadgeLabel = badgeLabel || (effectiveBadge === "new" ? "NEW" : effectiveBadge === "bestSeller" ? "Best Seller" : effectiveBadge === "hot" ? "Hot" : effectiveBadge === "discount" && discountPercent ? `-${discountPercent}%` : undefined);

  if (variant === "horizontal") return <HorizontalCard product={product} c={c} img={img} price={price} href={href} categoryPlaceholder={categoryPlaceholder} effectiveBadge={effectiveBadge} effectiveBadgeLabel={effectiveBadgeLabel} showStars={showStars} className={className} style={style} />;
  if (variant === "compact") return <CompactCard product={product} c={c} img={img} price={price} href={href} categoryPlaceholder={categoryPlaceholder} effectiveBadge={effectiveBadge} effectiveBadgeLabel={effectiveBadgeLabel} className={className} style={style} />;

  // Default variant
  return (
    <Link href={href} className={`group block touch-manipulation ${className}`} style={style}>
      <div
        className="relative overflow-hidden bg-white h-full flex flex-col"
        style={{ borderRadius: 16, borderBottom: `2.5px solid ${c.border}`, transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = c.shadow; e.currentTarget.style.transform = "translateY(-8px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {img ? (
            <Image src={img} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 75vw, 25vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: categoryPlaceholder.bg }}>
              {categoryPlaceholder.icon}
            </div>
          )}

          {/* Badge */}
          {effectiveBadge && effectiveBadgeLabel && (
            <span className="absolute top-2.5 left-2.5 text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1" style={{ background: BADGE_GRADIENTS[effectiveBadge] }}>
              {effectiveBadge === "bestSeller" && <Star size={10} className="fill-current" />}
              {effectiveBadgeLabel}
            </span>
          )}

          {/* Wishlist heart */}
          <button
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={15} className="text-gray-500 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>

          {product.description && (
            <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{product.description.substring(0, 60)}</p>
          )}

          {/* Stars */}
          {showStars && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />)}</div>
              {product._count?.reviews != null && <span className="text-[10px] text-gray-400">({product._count.reviews})</span>}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-gray-900">${price}</span>
              {discountPercent && (
                <span className="text-xs text-gray-400 line-through">${(Number(price) / (1 - discountPercent / 100)).toFixed(2)}</span>
              )}
            </div>
            <span
              className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1"
              style={{ background: c.btnGrad }}
            >
              <ShoppingCart size={10} /> Add
            </span>
          </div>

          {/* Shipping tag */}
          {showShipping && (
            <div className="flex items-center gap-1 mt-1.5">
              <Truck size={11} className="text-green-600" />
              <span className="text-[10px] text-green-600 font-medium">Free Shipping</span>
            </div>
          )}

          {/* Stock warning */}
          {showStock && product.stock != null && product.stock > 0 && product.stock < 10 && (
            <span className="text-[10px] text-orange-500 font-medium mt-1">Only {product.stock} left!</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Compact variant (smaller, for RecentlyViewed) ─── */
function CompactCard({ product, c, img, price, href, categoryPlaceholder, effectiveBadge, effectiveBadgeLabel, className, style }: {
  product: ProductData; c: typeof CARD_COLORS[0]; img?: string; price: string; href: string;
  categoryPlaceholder: { bg: string; icon: string }; effectiveBadge?: Badge; effectiveBadgeLabel?: string;
  className?: string; style?: React.CSSProperties;
}) {
  return (
    <Link href={href} className={`group block touch-manipulation ${className}`} style={style}>
      <div
        className="relative overflow-hidden bg-white h-full flex flex-col"
        style={{ borderRadius: 16, borderBottom: `2.5px solid ${c.border}`, transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = c.shadow; e.currentTarget.style.transform = "translateY(-8px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {img ? (
            <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="190px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: categoryPlaceholder.bg }}>
              {categoryPlaceholder.icon}
            </div>
          )}
          {effectiveBadge && effectiveBadgeLabel && (
            <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: BADGE_GRADIENTS[effectiveBadge] }}>
              {effectiveBadgeLabel}
            </span>
          )}
          <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300" onClick={(e) => e.preventDefault()}>
            <Heart size={13} className="text-gray-500 hover:text-red-500 transition-colors" />
          </button>
        </div>
        <div className="p-2.5">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</h3>
          <span className="text-sm font-bold text-gray-900">${price}</span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Horizontal variant (for list views) ─── */
function HorizontalCard({ product, c, img, price, href, categoryPlaceholder, effectiveBadge, effectiveBadgeLabel, showStars, className, style }: {
  product: ProductData; c: typeof CARD_COLORS[0]; img?: string; price: string; href: string;
  categoryPlaceholder: { bg: string; icon: string }; effectiveBadge?: Badge; effectiveBadgeLabel?: string;
  showStars?: boolean; className?: string; style?: React.CSSProperties;
}) {
  return (
    <Link href={href} className={`group block touch-manipulation ${className}`} style={style}>
      <div
        className="relative overflow-hidden bg-white flex"
        style={{ borderRadius: 16, borderLeft: `3px solid ${c.border}`, transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = c.shadow; e.currentTarget.style.transform = "translateY(-4px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div className="relative w-28 sm:w-36 bg-gray-100 overflow-hidden flex-shrink-0">
          {img ? (
            <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="144px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl min-h-[100px]" style={{ background: categoryPlaceholder.bg }}>
              {categoryPlaceholder.icon}
            </div>
          )}
          {effectiveBadge && effectiveBadgeLabel && (
            <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: BADGE_GRADIENTS[effectiveBadge] }}>
              {effectiveBadgeLabel}
            </span>
          )}
        </div>
        <div className="p-3 sm:p-4 flex flex-col justify-center flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
          {product.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{product.description.substring(0, 80)}</p>}
          {showStars && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />)}</div>
              {product._count?.reviews != null && <span className="text-[10px] text-gray-400">({product._count.reviews})</span>}
            </div>
          )}
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-lg font-bold text-gray-900">${price}</span>
            <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all" style={{ background: c.btnGrad }}>
              <ShoppingCart size={10} className="inline mr-1" />Add
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
