"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  getDealOfTheDayAdmin,
  addDealProduct,
  removeDealProduct,
  reorderDealOfTheDay,
  sendDealToSubscribers,
} from "@/services/adminService";
import { getProducts } from "@/services/productService";
import { Zap, Trash2, ChevronUp, ChevronDown, Plus, Mail } from "lucide-react";

type DealItem = {
  id: number;
  productId: number;
  position: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    isActive: boolean;
    images?: { url: string }[];
  };
};

export default function AdminDealOfTheDayPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [dealList, setDealList] = useState<DealItem[]>([]);
  const [allProducts, setAllProducts] = useState<{ id: number; name: string; slug: string; price: string | number; images?: { url: string }[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    const [dealRes, productsRes] = await Promise.all([
      getDealOfTheDayAdmin(),
      getProducts({ limit: 500 }),
    ]);
    if (dealRes.success && Array.isArray(dealRes.data)) setDealList(dealRes.data);
    if (productsRes?.data) setAllProducts(productsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (productId: number) => {
    setMessage("");
    const res = await addDealProduct(productId);
    if (res.success) {
      setShowAdd(false);
      load();
    } else {
      setMessage(res.message || "Error");
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm("¿Quitar este producto de Ofertas del día?")) return;
    const res = await removeDealProduct(id);
    if (res.success) load();
    else setMessage(res.message || "Error");
  };

  const move = async (index: number, dir: 1 | -1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= dealList.length) return;
    const reordered = [...dealList];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const ids = reordered.map((d) => d.id);
    const res = await reorderDealOfTheDay(ids);
    if (res.success && res.data) setDealList(res.data);
  };

  const handleSendEmail = async () => {
    if (!confirm("¿Enviar ahora el correo de ofertas del día a todos los suscriptores?")) return;
    setSending(true);
    setMessage("");
    const res = await sendDealToSubscribers();
    setSending(false);
    if (res.success && res.data) {
      setMessage(`Enviados: ${res.data.sent}, fallidos: ${res.data.failed}`);
    } else {
      setMessage(res.message || "Error al enviar");
    }
  };

  const alreadyInDeal = new Set(dealList.map((d) => d.productId));
  const availableProducts = allProducts.filter((p) => !alreadyInDeal.has(p.id));

  if (loading) return <div className="p-8">{tCommon("loading")}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Zap className="w-8 h-8" />
        Ofertas del día
      </h1>
      <p className="text-gray-500 mb-6">
        Los productos que añadas aquí se muestran en el slider de la página principal y se envían por correo a los suscriptores del newsletter (automáticamente cada 24h o al pulsar &quot;Enviar ahora&quot;).
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.startsWith("Enviados") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
        >
          <Plus size={18} />
          Añadir producto
        </button>
        <button
          type="button"
          onClick={handleSendEmail}
          disabled={sending || dealList.length === 0}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          <Mail size={18} />
          {sending ? "Enviando…" : "Enviar ofertas por correo ahora"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <h2 className="font-bold mb-3">Elegir producto</h2>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableProducts.length === 0 ? (
              <p className="text-gray-500">Todos los productos ya están en ofertas o no hay productos.</p>
            ) : (
              availableProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden">
                      <Image
                        src={p.images?.[0]?.url || "https://via.placeholder.com/80"}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-gray-500">${typeof p.price === "number" ? p.price.toFixed(2) : p.price}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdd(p.id)}
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Añadir
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <h2 className="p-4 border-b font-bold">Productos en ofertas del día (orden del slider)</h2>
        {dealList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aún no hay productos. Añade alguno para que aparezcan en el slider y en el correo.</div>
        ) : (
          <ul className="divide-y">
            {dealList.map((item, index) => (
              <li key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="flex flex-col gap-0">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="p-1 text-gray-500 hover:text-black disabled:opacity-30">
                    <ChevronUp size={20} />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === dealList.length - 1} className="p-1 text-gray-500 hover:text-black disabled:opacity-30">
                    <ChevronDown size={20} />
                  </button>
                </div>
                <div className="relative w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product?.images?.[0]?.url || "https://via.placeholder.com/80"}
                    alt={item.product?.name || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product?.name}</p>
                  <p className="text-sm text-gray-500">${typeof item.product?.price === "number" ? item.product.price.toFixed(2) : item.product?.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Quitar"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
