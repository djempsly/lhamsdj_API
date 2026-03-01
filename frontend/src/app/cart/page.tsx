"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getCart, updateCartItem, removeCartItem } from "@/services/cartService";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const t = useTranslations("cart");
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
    if (!confirm(t("removeProduct"))) return;
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

  if (loading) return <div className="p-10 sm:p-20 text-center">{t("loadingCart")}</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-gray-100 p-5 sm:p-6 rounded-full mb-4">
          <ShoppingBag size={40} className="text-gray-400 sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{t("empty")}</h1>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">{t("emptyDesc")}</p>
        <Link href="/" className="bg-black text-white px-6 min-h-[48px] flex items-center rounded-lg font-bold hover:bg-gray-800 transition touch-manipulation">
          {t("goShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {cart.items.map((item: any) => {
            const price = item.productVariant ? item.productVariant.price : item.product.price;
            const image = item.product.images[0]?.url || "https://via.placeholder.com/150";
            return (
              <div key={item.id} className="flex gap-3 sm:gap-4 border p-3 sm:p-4 rounded-xl bg-white shadow-sm">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={image} alt={item.product.name} fill className="object-cover" sizes="96px" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm sm:text-lg truncate">{item.product.name}</h3>
                    {item.productVariant && (
                      <p className="text-xs sm:text-sm text-gray-500">
                        {item.productVariant.size && `${t("size")}: ${item.productVariant.size} `}
                        {item.productVariant.color && `| ${t("color")}: ${item.productVariant.color}`}
                      </p>
                    )}
                    <p className="font-semibold text-gray-900 mt-1 text-sm sm:text-base">${price}</p>
                  </div>
                  <div className="flex items-center border rounded-lg self-start mt-2">
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={updating || item.quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 touch-manipulation">
                      <Minus size={14} />
                    </button>
                    <span className="px-2 text-sm font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} disabled={updating}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 touch-manipulation">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:bg-red-50 w-10 h-10 flex items-center justify-center rounded-full transition self-start shrink-0 touch-manipulation">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border sticky top-20">
            <h2 className="text-lg sm:text-xl font-bold mb-4">{t("orderSummary")}</h2>
            <div className="space-y-2 mb-4 border-b pb-4">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">{t("subtotal")}</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">{t("shipping")}</span>
                <span className="font-medium text-green-600">{t("free")}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg sm:text-xl font-bold mb-6">
              <span>{t("total")}</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="w-full bg-black text-white min-h-[48px] rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 touch-manipulation">
              {t("checkout")} <ArrowRight size={20} />
            </Link>
            <p className="text-xs text-gray-400 text-center mt-4">{t("securePayments")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}