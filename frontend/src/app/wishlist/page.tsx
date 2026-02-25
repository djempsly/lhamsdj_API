"use client";

import { useState, useEffect } from "react";
import { getWishlist, toggleWishlist } from "@/services/wishlistService";
import { addToCart } from "@/services/cartService";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import type { WishlistItem } from "@/types";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist().then((res) => {
      if (res.success) setItems(res.data);
      setLoading(false);
    });
  }, []);

  async function handleRemove(productId: number) {
    await toggleWishlist(productId);
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  async function handleAddToCart(productId: number) {
    const res = await addToCart(productId, 1);
    if (res.success) {
      window.dispatchEvent(new Event("cart-change"));
      alert("Producto agregado al carrito");
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart size={24} className="text-red-500" />
        <h1 className="text-2xl font-bold">Mi Lista de Deseos</h1>
        <span className="text-gray-400 text-sm">({items.length} productos)</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg text-gray-400 mb-4">Tu lista de deseos está vacía</p>
          <Link href="/products" className="inline-block bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl overflow-hidden group relative">
              <button
                onClick={() => handleRemove(item.product.id)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={14} />
              </button>

              <Link href={`/product/${item.product.slug}`}>
                <div className="relative aspect-square bg-gray-50">
                  <Image src={item.product.images?.[0]?.url || "https://via.placeholder.com/300"} alt={item.product.name} fill className="object-cover" />
                </div>
              </Link>

              <div className="p-3">
                <Link href={`/product/${item.product.slug}`}>
                  <p className="text-sm font-medium truncate hover:text-blue-600">{item.product.name}</p>
                </Link>
                <p className="text-lg font-bold mt-1">${item.product.price}</p>
                <button
                  onClick={() => handleAddToCart(item.product.id)}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  <ShoppingCart size={14} />
                  Agregar al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
