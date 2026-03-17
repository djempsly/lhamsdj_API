"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Heart, Share2, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { getCategoryPlaceholder } from "@/components/shared/cardColors";

type Props = {
  images: { id: number; url: string }[];
  productName: string;
  categoryName?: string;
  discountPercent?: number;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onShareClick?: () => void;
};

export default function ProductGallery({ images, productName, categoryName, discountPercent, isWishlisted, onToggleWishlist, onShareClick }: Props) {
  const [mainIdx, setMainIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const placeholder = getCategoryPlaceholder(categoryName);
  const mainImage = images[mainIdx]?.url;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  return (
    <>
      <div className="flex gap-3">
        {/* Vertical thumbnails */}
        {images.length > 1 && (
          <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setMainIdx(i)}
                className="relative w-[54px] h-[54px] overflow-hidden flex-shrink-0 transition-all duration-200"
                style={{
                  borderRadius: 10,
                  border: mainIdx === i ? "2px solid #8b5cf6" : "2px solid #e5e7eb",
                  boxShadow: mainIdx === i ? "0 0 12px rgba(139,92,246,0.3)" : "none",
                }}
              >
                <Image src={img.url} alt={`${productName} ${i + 1}`} fill className="object-cover" sizes="54px" />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 relative">
          <div
            ref={imgRef}
            className="relative w-full aspect-square overflow-hidden cursor-crosshair group"
            style={{
              borderRadius: 20,
              border: "1px solid rgba(139,92,246,0.1)",
              transition: "box-shadow 400ms ease",
            }}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightbox(true)}
          >
            {mainImage ? (
              <Image
                src={mainImage}
                alt={productName}
                fill
                className="object-contain transition-transform duration-200"
                style={{
                  transform: zoom ? "scale(1.7)" : "scale(1)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl" style={{ background: placeholder.bg }}>
                {placeholder.icon}
              </div>
            )}

            {/* Discount badge */}
            {discountPercent && discountPercent > 0 && (
              <span className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1.5 z-10" style={{ borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #f97316)" }}>
                -{discountPercent}%
              </span>
            )}

            {/* Zoom hint */}
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ZoomIn size={12} /> Click to expand
            </div>

            {/* Action buttons top-right */}
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              {onToggleWishlist && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
                  className="w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all"
                  style={{ borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                >
                  <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"} />
                </button>
              )}
              {onShareClick && (
                <button
                  onClick={(e) => { e.stopPropagation(); onShareClick(); }}
                  className="w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all"
                  style={{ borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                >
                  <Share2 size={16} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:hidden gap-2 mt-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setMainIdx(i)}
                  className="relative w-14 h-14 overflow-hidden flex-shrink-0 transition-all"
                  style={{
                    borderRadius: 8,
                    border: mainIdx === i ? "2px solid #8b5cf6" : "2px solid transparent",
                  }}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox modal */}
      {lightbox && mainImage && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition z-10">
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition z-10"
                onClick={(e) => { e.stopPropagation(); setMainIdx(i => (i === 0 ? images.length - 1 : i - 1)); }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition z-10"
                onClick={(e) => { e.stopPropagation(); setMainIdx(i => (i + 1) % images.length); }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <div className="relative w-[90vw] h-[80vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[mainIdx].url} alt={productName} fill className="object-contain" sizes="90vw" />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setMainIdx(i); }}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === mainIdx ? "#8b5cf6" : "rgba(255,255,255,0.4)" }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
