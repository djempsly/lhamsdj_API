"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCart, updateCartItem, removeCartItem } from "@/services/cartService";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // Para bloquear botones mientras actualiza

  const loadCart = async () => {
    const res = await getCart();
    if (res.success) setCart(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Función para actualizar el Navbar
  const refreshNavbar = () => {
    window.dispatchEvent(new Event("cart-change"));
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    await updateCartItem(itemId, newQuantity);
    await loadCart(); // Recargar datos
    refreshNavbar();  // Actualizar bolita roja
    setUpdating(false);
  };

  const handleRemove = async (itemId: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setUpdating(true);
    await removeCartItem(itemId);
    await loadCart();
    refreshNavbar();
    setUpdating(false);
  };

  // Calcular total dinámicamente
  const total = cart?.items.reduce((acc: number, item: any) => {
    const price = item.productVariant ? Number(item.productVariant.price) : Number(item.product.price);
    return acc + price * item.quantity;
  }, 0) || 0;

  if (loading) return <div className="p-20 text-center">Cargando carrito...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Parece que aún no has agregado nada.</p>
        <Link href="/" className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition">
          Ir a Comprar
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LISTA DE ITEMS (Izquierda) */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: any) => {
            // Determinar datos a mostrar (Producto base o Variante)
            const price = item.productVariant ? item.productVariant.price : item.product.price;
            const image = item.product.images[0]?.url || "https://via.placeholder.com/150";
            
            return (
              <div key={item.id} className="flex gap-4 border p-4 rounded-xl bg-white shadow-sm">
                {/* Imagen */}
                <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={image} alt="Producto" fill className="object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{item.product.name}</h3>
                    {item.productVariant && (
                      <p className="text-sm text-gray-500">
                        {item.productVariant.size && `Talla: ${item.productVariant.size} `}
                        {item.productVariant.color && `| Color: ${item.productVariant.color}`}
                      </p>
                    )}
                    <p className="font-semibold text-gray-900 mt-1">${price}</p>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex flex-col justify-between items-end">
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex items-center border rounded-lg">
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={updating || item.quantity <= 1}
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2 text-sm font-bold w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updating}
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RESUMEN DE PAGO (Derecha) */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-xl border sticky top-24">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-2 mb-4 border-b pb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Link 
              href="/checkout" 
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              Continuar al Pago <ArrowRight size={20} />
            </Link>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              Pagos seguros con Stripe y PayPal
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}