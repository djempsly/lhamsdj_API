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
      className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden rounded-xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full relative h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover brightness-75"
              sizes="100vw"
              priority={slide.id === 1}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4 sm:p-8">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 drop-shadow-lg leading-tight">{slide.title}</h2>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-8 drop-shadow-md max-w-2xl">{slide.description}</p>
              <Link href="/products" className="bg-white text-black px-6 sm:px-8 min-h-[44px] sm:min-h-[48px] flex items-center rounded-full font-bold hover:bg-gray-200 transition touch-manipulation active:scale-95 text-sm sm:text-base">
                {t("viewOffers")}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows - always visible on mobile, hover on desktop */}
      <button onClick={prevSlide} aria-label="Previous"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/30 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-white hover:bg-black/50 md:opacity-0 md:group-hover:opacity-100 transition touch-manipulation"
      >
        <ChevronLeft size={22} className="sm:w-7 sm:h-7" />
      </button>
      <button onClick={nextSlide} aria-label="Next"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/30 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-white hover:bg-black/50 md:opacity-0 md:group-hover:opacity-100 transition touch-manipulation"
      >
        <ChevronRight size={22} className="sm:w-7 sm:h-7" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition touch-manipulation ${
              current === index ? "bg-white scale-110" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
