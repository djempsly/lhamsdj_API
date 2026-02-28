"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, Check } from "lucide-react";
import { getCart, updateCartItem, removeCartItem } from "@/services/cartService";

interface AddedProduct {
  name: string;
  price: string | number;
  image: string;
  variant?: string;
  quantity: number;
}

export default function CartDrawer() {
  const t = useTranslations("cart");
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"full" | "mini">("full");
  const [addedProduct, setAddedProduct] = useState<AddedProduct | null>(null);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    const res = await getCart();
    if (res.success) setCart(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.mode === "mini" && detail?.product) {
        setMode("mini");
        setAddedProduct(detail.product);
      } else {
        setMode("full");
        setAddedProduct(null);
      }
      setOpen(true);
      loadCart();
    };

    window.addEventListener("cart-drawer-open", handleOpen);
    return () => window.removeEventListener("cart-drawer-open", handleOpen);
  }, [loadCart]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (mode === "mini" && open) {
      const timer = setTimeout(() => {
        setMode("full");
        setAddedProduct(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [mode, open]);

  const close = () => setOpen(false);

  const handleQuantity = async (itemId: number, qty: number) => {
    if (qty < 1) return;
    setUpdating(true);
    await updateCartItem(itemId, qty);
    await loadCart();
    window.dispatchEvent(new Event("cart-change"));
    setUpdating(false);
  };

  const handleRemove = async (itemId: number) => {
    setUpdating(true);
    await removeCartItem(itemId);
    await loadCart();
    window.dispatchEvent(new Event("cart-change"));
    setUpdating(false);
  };

  const goCheckout = () => {
    close();
    router.push("/checkout");
  };

  const goCart = () => {
    close();
    router.push("/cart");
  };

  const total = cart?.items?.reduce((acc: number, item: any) => {
    const price = item.productVariant ? Number(item.productVariant.price) : Number(item.product.price);
    return acc + price * item.quantity;
  }, 0) || 0;

  const itemCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag size={20} />
            {t("title")}
            {itemCount > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                {itemCount} {t("items")}
              </span>
            )}
          </h2>
          <button onClick={close} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Mini notification banner */}
        {mode === "mini" && addedProduct && (
          <div className="bg-green-50 border-b border-green-100 px-5 py-3 flex items-center gap-3 animate-in fade-in duration-300">
            <div className="bg-green-500 rounded-full p-1 shrink-0">
              <Check size={14} className="text-white" />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <Image src={addedProduct.image || "https://via.placeholder.com/100"} alt={addedProduct.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-green-800 truncate">{t("itemAdded")}</p>
                <p className="text-xs text-green-700 truncate">{addedProduct.name}</p>
              </div>
              <span className="text-sm font-bold text-green-800 shrink-0">${addedProduct.price}</span>
            </div>
          </div>
        )}

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : !cart || cart.items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <ShoppingBag size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">{t("empty")}</p>
              <p className="text-gray-300 text-sm mt-1">{t("emptyDesc")}</p>
              <button onClick={close} className="mt-6 text-sm font-medium text-black underline underline-offset-4 hover:text-gray-600 transition">
                {t("continueShopping")}
              </button>
            </div>
          ) : (
            <ul className="divide-y">
              {cart.items.map((item: any) => {
                const price = item.productVariant ? Number(item.productVariant.price) : Number(item.product.price);
                const image = item.product.images?.[0]?.url || "https://via.placeholder.com/100";
                return (
                  <li key={item.id} className="px-5 py-4 flex gap-3">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <Image src={image} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      {item.productVariant && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.productVariant.size && `${t("size")}: ${item.productVariant.size}`}
                          {item.productVariant.color && ` · ${t("color")}: ${item.productVariant.color}`}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => handleQuantity(item.id, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                            className="px-2 py-1 hover:bg-gray-50 disabled:opacity-30"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantity(item.id, item.quantity + 1)}
                            disabled={updating}
                            className="px-2 py-1 hover:bg-gray-50 disabled:opacity-30"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-sm font-bold">${(price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="self-start p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer with totals */}
        {cart && cart.items?.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t("subtotal")}</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t("shipping")}</span>
              <span className="font-medium text-green-600">{t("free")}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>{t("total")}</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button onClick={goCheckout} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2">
              {t("checkout")} <ArrowRight size={18} />
            </button>
            <button onClick={goCart} className="w-full text-center text-sm text-gray-500 hover:text-black transition py-1">
              {t("viewCart")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
