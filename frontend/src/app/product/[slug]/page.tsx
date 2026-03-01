"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getProductBySlug } from "@/services/productService";
import { addToCart } from "@/services/cartService";
import Image from "next/image";
import { Check, AlertCircle } from "lucide-react";
import ReviewSection from "@/components/product/ReviewSection";


export default function ProductDetailPage() {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { slug } = useParams();
   const router = useRouter()
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  
  // Estados de selección
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [variantError, setVariantError] = useState(false);

  useEffect(() => {
    if (slug) {
      getProductBySlug(slug as string).then((data) => {
        if (data) {
          setProduct(data);
          if (data.images.length > 0) setMainImage(data.images[0].url);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  const currentPrice = selectedVariant ? selectedVariant.price : product?.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product?.stock;

  const handleAddToCart = async () => {
    if (product.variants.length > 0 && !selectedVariant) {
      setVariantError(true);
      return;
    }
    setVariantError(false);
    setIsAdding(true);

    const res = await addToCart(
      product.id,
      quantity,
      selectedVariant ? selectedVariant.id : undefined
    );

    setIsAdding(false);

    if (res.success) {
      window.dispatchEvent(new Event("cart-change"));
      window.dispatchEvent(new CustomEvent("cart-drawer-open", {
        detail: {
          mode: "mini",
          product: {
            name: product.name,
            price: currentPrice,
            image: mainImage || product.images?.[0]?.url || "",
            variant: selectedVariant ? `${selectedVariant.size || ""} ${selectedVariant.color || ""}`.trim() : undefined,
            quantity,
          },
        },
      }));
    } else {
      if (res.message?.toLowerCase().includes("token") || res.message?.toLowerCase().includes("autenticado")) {
        router.push("/auth/login");
        return;
      }
    }
  };
  const handleBuyNow = async () => {
    if (product.variants.length > 0 && !selectedVariant) {
      setVariantError(true);
      return;
    }
    setVariantError(false);
    setIsAdding(true);

    const res = await addToCart(
      product.id,
      quantity,
      selectedVariant ? selectedVariant.id : undefined
    );

    if (res.success) {
      window.dispatchEvent(new Event("cart-change"));
      router.push("/checkout");
    } else {
      if (res.message?.includes("autenticado") || res.message?.toLowerCase().includes("token")) {
        router.push("/auth/login");
      }
    }
    setIsAdding(false);
  };

  if (loading) return <div className="p-10 sm:p-20 text-center">{t("loadingProduct")}</div>;
  if (!product) return <div className="p-10 sm:p-20 text-center">{t("notFound")}</div>;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">

        {/* Gallery */}
        <div>
          <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3 sm:mb-4 border">
            <Image src={mainImage || "https://via.placeholder.com/500"} alt={product.name} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" priority />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {product.images.map((img: any) => (
              <button
                key={img.id}
                onClick={() => setMainImage(img.url)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 shrink-0 transition touch-manipulation ${
                  mainImage === img.url ? "border-black" : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image src={img.url} alt="Thumbnail" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4 sm:mb-6 text-sm">{tc("category")}: {product.category?.name}</p>
          <div className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">${currentPrice}</div>
          <div className="prose prose-sm text-gray-600 mb-6 sm:mb-8">
            <p>{product.description}</p>
          </div>

          {product.variants.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="font-bold mb-3">{t("availableOptions")}:</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => { setSelectedVariant(variant); setVariantError(false); }}
                    className={`min-h-[44px] px-4 py-2 border rounded-lg text-sm transition touch-manipulation ${
                      selectedVariant?.id === variant.id ? "bg-black text-white border-black" : "bg-white text-gray-700 hover:border-black"
                    } ${variant.stock === 0 ? "opacity-50 cursor-not-allowed line-through" : ""}`}
                    disabled={variant.stock === 0}
                  >
                    {variant.size && <span className="font-bold mr-1">{variant.size}</span>}
                    {variant.color && <span>{variant.color}</span>}
                  </button>
                ))}
              </div>
              {variantError && <p className="text-red-500 text-sm mt-2 font-medium">{t("selectOption")}</p>}
            </div>
          )}

          <div className="mb-6">
            {currentStock > 0 ? (
              <span className="flex items-center text-green-600 font-medium gap-2 text-sm sm:text-base">
                <Check size={18} /> {t("inStock", { count: currentStock })}
              </span>
            ) : (
              <span className="flex items-center text-red-600 font-medium gap-2 text-sm sm:text-base">
                <AlertCircle size={18} /> {t("outOfStock")}
              </span>
            )}
          </div>

          {/* Action buttons - stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex items-center border rounded-lg self-start">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 touch-manipulation text-lg">-</button>
              <span className="px-3 font-bold min-w-[40px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(currentStock, q + 1))} className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 touch-manipulation text-lg">+</button>
            </div>
            <div className="flex gap-3 flex-1">
              <button onClick={handleAddToCart} disabled={currentStock === 0 || isAdding}
                className="flex-1 bg-black text-white rounded-lg font-bold flex items-center justify-center gap-2 min-h-[48px] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition touch-manipulation active:scale-[0.98]">
                {isAdding ? t("adding") : t("addToCart")}
              </button>
              <button onClick={handleBuyNow} disabled={currentStock === 0 || isAdding}
                className="flex-1 bg-blue-600 text-white rounded-lg font-bold min-h-[48px] hover:bg-blue-700 disabled:opacity-50 transition touch-manipulation active:scale-[0.98]">
                {t("buyNow")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReviewSection productId={product.id} />
    </div>
  );
}