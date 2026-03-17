"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const SLIDE_GRADIENTS = [
  "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
  "linear-gradient(135deg, #1a002e, #6b21a8, #c026d3)",
  "linear-gradient(135deg, #001d3d, #0077b6, #00b4d8)",
];

export default function Carousel() {
  const t = useTranslations("home");
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = [
    { id: 1, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop", title: t("slide1Title"), description: t("slide1Desc") },
    { id: 2, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop", title: t("slide2Title"), description: t("slide2Desc") },
    { id: 3, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop", title: t("slide3Title"), description: t("slide3Desc") },
  ];

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => goTo(current === 0 ? slides.length - 1 : current - 1), [current, slides.length, goTo]);
  const nextSlide = useCallback(() => goTo(current === slides.length - 1 ? 0 : current + 1), [current, slides.length, goTo]);

  useEffect(() => { const timer = setInterval(nextSlide, 6000); return () => clearInterval(timer); }, [nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => { const diff = touchStartX.current - touchEndX.current; if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide(); };

  return (
    <div
      className="group relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[560px] overflow-hidden"
      style={{ borderRadius: 20, boxShadow: "0 8px 40px rgba(139,92,246,0.2)" }}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 2 : 1,
            transition: "opacity 800ms ease-in-out",
          }}
        >
          {/* Gradient background behind image */}
          <div className="absolute inset-0" style={{ background: SLIDE_GRADIENTS[i] }} />
          <Image
            src={slide.image} alt={slide.title} fill
            className="object-cover"
            style={{ transform: i === current ? "scale(1.08)" : "scale(1)", transition: "transform 6000ms ease-out", opacity: 0.5 }}
            sizes="100vw" priority={slide.id === 1}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

          <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-10 md:p-16 lg:p-20">
            <span
              className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/90 mb-4"
              style={{
                borderRadius: 20, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.1)",
                opacity: i === current ? 1 : 0, transform: i === current ? "translateY(0)" : "translateY(30px)",
                transition: "all 700ms ease-out", transitionDelay: i === current ? "300ms" : "0ms",
              }}
            >
              {i + 1} / {slides.length}
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4 leading-tight tracking-tight max-w-2xl"
              style={{ opacity: i === current ? 1 : 0, transform: i === current ? "translateY(0)" : "translateY(40px)", transition: "all 700ms ease-out", transitionDelay: i === current ? "450ms" : "0ms" }}
            >
              {slide.title}
            </h2>
            <p
              className="text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8 max-w-lg"
              style={{ opacity: i === current ? 1 : 0, transform: i === current ? "translateY(0)" : "translateY(40px)", transition: "all 700ms ease-out", transitionDelay: i === current ? "600ms" : "0ms" }}
            >
              {slide.description}
            </p>
            <Link
              href="/products"
              className="px-8 sm:px-10 py-3 sm:py-3.5 font-bold text-sm sm:text-base text-white hover:scale-105 active:scale-100 touch-manipulation"
              style={{
                borderRadius: 50, background: "linear-gradient(135deg, #8b5cf6, #d946ef)", boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
                opacity: i === current ? 1 : 0, transform: i === current ? "translateY(0)" : "translateY(40px)",
                transition: "all 700ms ease-out, transform 300ms ease", transitionDelay: i === current ? "750ms" : "0ms",
              }}
            >
              {t("viewOffers")}
            </Link>
          </div>
        </div>
      ))}

      <button onClick={prevSlide} aria-label="Previous" className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-white hover:scale-110 md:opacity-0 md:group-hover:opacity-100 touch-manipulation z-10" style={{ backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", transition: "all 300ms ease" }}>
        <ChevronLeft size={24} />
      </button>
      <button onClick={nextSlide} aria-label="Next" className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-white hover:scale-110 md:opacity-0 md:group-hover:opacity-100 touch-manipulation z-10" style={{ backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", transition: "all 300ms ease" }}>
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index} onClick={() => goTo(index)} aria-label={`Go to slide ${index + 1}`}
            className="relative overflow-hidden touch-manipulation"
            style={{ height: 6, borderRadius: 5, width: current === index ? 28 : 8, backgroundColor: current === index ? "transparent" : "rgba(255,255,255,0.4)", transition: "all 400ms ease" }}
          >
            {current === index && (
              <>
                <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
                <div className="absolute inset-0 rounded-full origin-left" style={{ background: "linear-gradient(135deg, #8b5cf6, #d946ef)", animation: "progress 6s linear" }} />
              </>
            )}
          </button>
        ))}
      </div>
      <style jsx>{`@keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}
