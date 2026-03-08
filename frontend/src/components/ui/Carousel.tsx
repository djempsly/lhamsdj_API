"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Carousel() {
  const t = useTranslations("home");
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
      title: t("slide1Title"),
      description: t("slide1Desc"),
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
      title: t("slide2Title"),
      description: t("slide2Desc"),
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
      title: t("slide3Title"),
      description: t("slide3Desc"),
    },
  ];

  const prevSlide = useCallback(() => {
    setCurrent(c => c === 0 ? slides.length - 1 : c - 1);
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrent(c => c === slides.length - 1 ? 0 : c + 1);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  };

  return (
    <div
      className="group relative w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[520px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={slide.id} className="min-w-full relative h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className={`object-cover transition-transform duration-700 ${i === current ? "scale-100" : "scale-105"}`}
              sizes="100vw"
              priority={slide.id === 1}
            />
            {/* Overlay gradiente para legibilidad y profundidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 sm:p-10">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/90 mb-2">
                {i + 1} / {slides.length}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-3 sm:mb-4 leading-tight tracking-tight drop-shadow-2xl">
                {slide.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-xl text-white/95 drop-shadow-lg">
                {slide.description}
              </p>
              <Link
                href="/products"
                className="bg-white text-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-300 touch-manipulation"
              >
                {t("viewOffers")}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        aria-label="Previous"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/20 hover:bg-white/25 hover:scale-110 md:opacity-0 md:group-hover:opacity-100 transition-all touch-manipulation z-10"
      >
        <ChevronLeft size={24} className="sm:w-7 sm:h-7" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/20 hover:bg-white/25 hover:scale-110 md:opacity-0 md:group-hover:opacity-100 transition-all touch-manipulation z-10"
      >
        <ChevronRight size={24} className="sm:w-7 sm:h-7" />
      </button>

      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2.5 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 sm:h-2 rounded-full transition-all touch-manipulation ${
              current === index ? "bg-white w-8 sm:w-10" : "bg-white/50 w-2 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
