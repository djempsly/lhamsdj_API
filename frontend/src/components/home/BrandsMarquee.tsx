"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const BRANDS = [
  "Apple", "Samsung", "Nike", "Adidas", "Sony",
  "LG", "HP", "Dell", "Zara", "H&M",
  "Puma", "Philips", "Canon", "Bose", "JBL",
  "Levi's", "Converse", "Xiaomi", "Huawei", "Asus",
];

export default function BrandsMarquee() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="mb-12 sm:mb-16 py-8 sm:py-10 bg-gray-50 -mx-3 sm:-mx-4 px-3 sm:px-4 rounded-2xl transition-all duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="overflow-hidden relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-[marquee_40s_linear_infinite] hover:pause">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <div
              key={`${brand}-${i}`}
              className="flex-shrink-0 mx-4 sm:mx-8 flex items-center justify-center"
            >
              <span className="text-lg sm:text-xl font-bold text-gray-300 hover:text-gray-500 transition-colors duration-300 whitespace-nowrap select-none">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
