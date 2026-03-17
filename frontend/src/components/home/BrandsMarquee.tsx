"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const BRANDS = [
  "APPLE", "SAMSUNG", "NIKE", "ADIDAS", "SONY",
  "LG", "HP", "DELL", "ZARA", "H&M",
  "PUMA", "PHILIPS", "CANON", "BOSE", "JBL",
  "LEVI'S", "CONVERSE", "XIAOMI", "HUAWEI", "ASUS",
];

export default function BrandsMarquee() {
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref} className="mb-12 sm:mb-16 py-8 sm:py-10 bg-gray-50 -mx-3 sm:-mx-4 px-3 sm:px-4 rounded-2xl" style={{ opacity: visible ? 1 : 0, transition: "all 700ms ease" }}>
      <div className="overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="flex animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <div key={`${brand}-${i}`} className="flex-shrink-0 mx-5 sm:mx-10 flex items-center justify-center">
              <span className="text-base sm:text-lg font-bold text-gray-300 hover:text-[#8b5cf6] transition-colors duration-300 whitespace-nowrap select-none" style={{ letterSpacing: "1.5px" }}>
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}
