"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductBySlug } from "@/services/productService";
import { addToCart } from "@/services/cartService";
import Image from "next/image";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";


export default function ProductDetailPage() {
  const { slug } = useParams();
   const router = useRouter()
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  
  // Estados de selección
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (slug) {
      getProductBySlug(slug as string).then((data) => {
        if (data) {
          setProduct(data);
          // Poner la primera imagen como principal
          if (data.images.length > 0) setMainImage(data.images[0].url);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  // Manejar el botón de compra
  const handleAddToCart = async () => {
    // 1. Validar si requiere variante (si el producto tiene variantes y no elegí ninguna)
    if (product.variants.length > 0 && !selectedVariant) {
      alert("Por favor selecciona una opción (Talla/Color)");
      return;
    }

    setIsAdding(true);
    
    // 2. Llamar al servicio
    const res = await addToCart(
      product.id, 
      quantity, 
      selectedVariant ? selectedVariant.id : undefined
    );

    setIsAdding(false);

    if (res.success) {
    window.dispatchEvent(new Event("cart-change"));
      alert("✅ Producto agregado al carrito");
      // Aquí podríamos abrir un "Mini Cart" lateral en el futuro
    } else {
         // 👇 SOLUCIÓN AQUÍ: Detectar error de autenticación
      // Si el mensaje dice "token", "autorizado", "permiso", etc.
      if (res.message?.toLowerCase().includes("token") || res.message?.toLowerCase().includes("autenticado")) {
        // Redirigimos al login
        alert("Debes iniciar sesión para comprar")
        window.location.href = "/auth/login";
        return;
      }
      
      alert("Error: " + res.message);
    }
  };
  const handleBuyNow = async () => {

   
    // 1. Validaciones iguales al AddToCart
    if (product.variants.length > 0 && !selectedVariant) {
      return alert("Selecciona una opción");
    }

    setIsAdding(true);
    
    // 2. Agregar al carrito
    const res = await addToCart(
      product.id, 
      quantity, 
      selectedVariant ? selectedVariant.id : undefined
    );

    if (res.success) {
      window.dispatchEvent(new Event("cart-change"));
      // 3. REDIRECCIÓN INMEDIATA
      router.push("/cart"); // O directo a "/checkout" si prefieres
     // router.push("/checkout"); // O directo a "/checkout" si prefieres
    } else {
      if (res.message?.includes("autenticado")) router.push("/auth/login");
    }
    setIsAdding(false);
  };

  if (loading) return <div className="p-20 text-center">Cargando producto...</div>;
  if (!product) return <div className="p-20 text-center">Producto no encontrado 😢</div>;

  // Precio dinámico: Si elegí variante, muestra precio variante, si no precio base
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* COLUMNA IZQUIERDA: GALERÍA */}
        <div>
          {/* Imagen Principal */}
          <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 border">
            <Image 
              src={mainImage || "https://via.placeholder.com/500"} 
              alt={product.name} 
              fill 
              className="object-contain"
            />
          </div>
          
          {/* Miniaturas */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img: any) => (
              <button 
                key={img.id}
                onClick={() => setMainImage(img.url)}
                className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition ${
                  mainImage === img.url ? "border-black" : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image src={img.url} alt="Thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: INFO Y COMPRA */}
        <div>
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-6 text-sm">Categoría: {product.category?.name}</p>
          
          <div className="text-3xl font-bold mb-6">${currentPrice}</div>

          <div className="prose prose-sm text-gray-600 mb-8">
            <p>{product.description}</p>
          </div>

          {/* SELECTOR DE VARIANTES (Solo si existen) */}
          {product.variants.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold mb-3">Opciones Disponibles:</h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 border rounded-lg text-sm transition ${
                      selectedVariant?.id === variant.id
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 hover:border-black"
                    } ${variant.stock === 0 ? "opacity-50 cursor-not-allowed line-through" : ""}`}
                    disabled={variant.stock === 0}
                  >
                    {variant.size && <span className="font-bold mr-1">{variant.size}</span>}
                    {variant.color && <span>{variant.color}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STOCK STATUS */}
          <div className="mb-6">
            {currentStock > 0 ? (
              <span className="flex items-center text-green-600 font-medium gap-2">
                <Check size={20} /> Disponible ({currentStock} en stock)
              </span>
            ) : (
              <span className="flex items-center text-red-600 font-medium gap-2">
                <AlertCircle size={20} /> Agotado
              </span>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-4">
            {/* Contador */}
            <div className="flex items-center border rounded-lg">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-3 hover:bg-gray-100"
              >-</button>
              <span className="px-4 font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                className="px-4 py-3 hover:bg-gray-100"
              >+</button>
            </div>

            {/* Agregar al Carrito */}
            <button
              onClick={handleAddToCart}
              disabled={currentStock === 0 || isAdding}
              className="flex-1 bg-black text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              
               {/* <ShoppingCart size={16} /> */}
              {isAdding ? "Agregando..." : "Agregar al Carrito"} 
            </button>


            <button
        onClick={handleBuyNow}
        disabled={currentStock === 0 || isAdding}
        className="flex-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition"
      >
        Comprar Ahora
      </button>
          </div>

        </div>
      </div>
    </div>
  );
}