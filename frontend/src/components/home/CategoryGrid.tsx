"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowRight, Smartphone, Shirt, Home, Dumbbell, Sparkles, BookOpen, Baby, Car, Gamepad2, ChefHat, PawPrint, Wrench } from "lucide-react";

type Category = { id: number; name: string; slug: string };

const CATEGORY_ICONS: Record<string, typeof Smartphone> = {
  electronics: Smartphone, tecnologia: Smartphone, électronique: Smartphone,
  fashion: Shirt, moda: Shirt, mode: Shirt, ropa: Shirt,
  home: Home, hogar: Home, maison: Home,
  sports: Dumbbell, deportes: Dumbbell, sport: Dumbbell,
  beauty: Sparkles, belleza: Sparkles, beauté: Sparkles,
  books: BookOpen, libros: BookOpen, livres: BookOpen,
  baby: Baby, bebé: Baby, bébé: Baby,
  automotive: Car, automotriz: Car, automobile: Car,
  gaming: Gamepad2, juegos: Gamepad2, jeux: Gamepad2,
  kitchen: ChefHat, cocina: ChefHat, cuisine: ChefHat,
  pets: PawPrint, mascotas: PawPrint, animaux: PawPrint,
  tools: Wrench, herramientas: Wrench, outils: Wrench,
};

const STYLES = [
  { gradient: "linear-gradient(135deg, #302b63, #8b5cf6)", shadow: "0 12px 40px rgba(139,92,246,0.35)" },
  { gradient: "linear-gradient(135deg, #831843, #ec4899)", shadow: "0 8px 24px rgba(236,72,153,0.3)" },
  { gradient: "linear-gradient(135deg, #164e63, #06b6d4)", shadow: "0 8px 24px rgba(6,182,212,0.3)" },
  { gradient: "linear-gradient(135deg, #78350f, #f59e0b)", shadow: "0 8px 24px rgba(245,158,11,0.3)" },
  { gradient: "linear-gradient(135deg, #14532d, #22c55e)", shadow: "0 8px 24px rgba(34,197,94,0.3)" },
  { gradient: "linear-gradient(135deg, #7f1d1d, #ef4444)", shadow: "0 8px 24px rgba(239,68,68,0.3)" },
  { gradient: "linear-gradient(135deg, #312e81, #6366f1)", shadow: "0 8px 24px rgba(99,102,241,0.3)" },
  { gradient: "linear-gradient(135deg, #134e4a, #14b8a6)", shadow: "0 8px 24px rgba(20,184,166,0.3)" },
  { gradient: "linear-gradient(135deg, #581c87, #a855f7)", shadow: "0 8px 24px rgba(168,85,247,0.3)" },
  { gradient: "linear-gradient(135deg, #7c2d12, #ea580c)", shadow: "0 8px 24px rgba(234,88,12,0.3)" },
  { gradient: "linear-gradient(135deg, #0c4a6e, #0284c7)", shadow: "0 8px 24px rgba(2,132,199,0.3)" },
  { gradient: "linear-gradient(135deg, #701a75, #d946ef)", shadow: "0 8px 24px rgba(217,70,239,0.3)" },
];

const ITEMS_COUNT = ["2,450+", "1,830+", "3,100+", "980+", "1,420+", "760+", "540+", "890+", "1,200+", "670+", "1,050+", "430+"];

function getIcon(name: string) {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) { if (key.includes(k)) return v; }
  return Sparkles;
}

export default function CategoryGrid({ categories, title }: { categories: Category[]; title: string }) {
  const { ref, visible } = useScrollReveal();
  if (categories.length === 0) return null;
  const display = categories.slice(0, 12);

  return (
    <section ref={ref} className="mb-12 sm:mb-16">
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }} />
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 auto-rows-[140px] sm:auto-rows-[160px]">
        {display.map((cat, i) => {
          const Icon = getIcon(cat.name);
          const s = STYLES[i % STYLES.length];
          const isFirst = i === 0;
          return (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className={`group relative flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 overflow-hidden text-white ${isFirst ? "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2" : ""}`}
              style={{
                borderRadius: 16, background: s.gradient,
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)", transitionDelay: `${i * 60}ms`,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = s.shadow; (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div className={`rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${isFirst ? "w-16 h-16" : "w-12 h-12 sm:w-14 sm:h-14"}`}>
                <Icon size={isFirst ? 30 : 24} className="text-white sm:w-7 sm:h-7" />
              </div>
              <span className={`font-semibold text-center leading-tight ${isFirst ? "text-base sm:text-lg" : "text-xs sm:text-sm"}`}>{cat.name}</span>
              <span className={`text-white/60 ${isFirst ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs"}`}>{ITEMS_COUNT[i % ITEMS_COUNT.length]} items</span>
              {/* Arrow on hover */}
              <ArrowRight size={16} className="absolute right-3 top-3 text-white/0 group-hover:text-white/80 transition-all duration-300 group-hover:translate-x-0 -translate-x-2" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
