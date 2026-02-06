"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link"; 

// Datos de ejemplo (Luego puedes poner fotos reales de banners)
const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
    title: "Nueva Colección 2025",
    description: "Estilo y tecnología en un solo lugar.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
    title: "Ofertas de Electrónica",
    description: "Hasta 50% de descuento en gadgets.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    title: "Moda Urbana",
    description: "Vístete con las últimas tendencias.",
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  // Auto-play cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-xl group">
      {/* Slides */}
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
              className="object-cover brightness-75" // Oscurecemos un poco para que se lea el texto
            />
            {/* Texto sobre la imagen */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{slide.title}</h2>
              <p className="text-lg md:text-2xl mb-8 drop-shadow-md">{slide.description}</p>
              {/* <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                Ver Ofertas
              </button> */}

            <Link href="/products">
              <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                Ver Ofertas
              </button>
            </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Flechas (Solo visibles al pasar el mouse) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronLeft size={30} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronRight size={30} />
      </button>

      {/* Puntitos indicadores */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <div 
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition ${
              current === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}