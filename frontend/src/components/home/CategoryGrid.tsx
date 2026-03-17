"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Smartphone, Shirt, Home, Dumbbell, Sparkles, BookOpen,
  Baby, Car, Gamepad2, ChefHat, PawPrint, Wrench,
} from "lucide-react";

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

const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-600",
  "from-teal-500 to-green-500",
  "from-fuchsia-500 to-purple-500",
  "from-sky-500 to-blue-500",
  "from-amber-500 to-yellow-500",
  "from-red-500 to-rose-500",
  "from-cyan-500 to-teal-500",
];

function getIcon(name: string) {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return Sparkles;
}

export default function CategoryGrid({ categories, title }: { categories: Category[]; title: string }) {
  const { ref, visible } = useScrollReveal();
  if (categories.length === 0) return null;

  const display = categories.slice(0, 12);

  return (
    <section ref={ref} className="mb-12 sm:mb-16">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">{title}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {display.map((cat, i) => {
          const Icon = getIcon(cat.name);
          return (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="group relative flex flex-col items-center gap-3 p-4 sm:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-transparent overflow-hidden"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: `${i * 60}ms`,
              }}
            >
              {/* Hover gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-100 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <Icon size={24} className="text-gray-700 group-hover:text-white transition-colors sm:w-7 sm:h-7" />
              </div>
              <span className="relative z-10 text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-white text-center transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
