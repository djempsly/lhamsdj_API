"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getAddresses, createAddress } from "@/services/addressService";
import { createOrder } from "@/services/orderService"; // Asegúrate de tener este servicio en frontend
import { MapPin, Plus, Loader2, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Formulario nueva dirección
  const [newAddress, setNewAddress] = useState({
    street: "", city: "", state: "", postalCode: "", country: ""
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const res = await getAddresses();
    if (res.success) {
      setAddresses(res.data);
      // Seleccionar por defecto la primera (usualmente la default)
      if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
    }
    setLoading(false);
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const res = await createAddress(newAddress);
    setProcessing(false);
    
    if (res.success) {
      await loadAddresses();
      setShowForm(false);
      setSelectedAddressId(res.data.id); // Seleccionar la nueva
    } else {
      alert("Error: " + res.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return alert(t("selectAddress"));
    
    setProcessing(true);
    
    // 1. Crear la Orden en el Backend
    // Necesitas crear la función createOrder en src/services/orderService.ts del frontend
    const res = await createOrder(selectedAddressId); 
    
    if (res.success) {
      // 2. Redirigir a la página de pago con el ID de la orden
      router.push(`/payment/${res.data.id}`);
    } else {
      alert(t("orderError") + ": " + res.message);
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center">{tc("loading")}</div>;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin size={20} /> {t("shippingAddress")}
          </h2>

          <div className="space-y-3 sm:space-y-4 mb-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition flex justify-between items-center min-h-[56px] touch-manipulation ${
                  selectedAddressId === addr.id ? "border-black bg-gray-50 ring-1 ring-black" : "hover:border-gray-400"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm sm:text-base truncate">{addr.street}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{addr.city}, {addr.country}</p>
                  <p className="text-xs text-gray-500">{addr.postalCode}</p>
                </div>
                {selectedAddressId === addr.id && <CheckCircle className="text-green-600 shrink-0 ml-2" size={20} />}
              </div>
            ))}
          </div>

          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-blue-600 font-medium hover:underline min-h-[44px] touch-manipulation">
              <Plus size={18} /> {t("addAddress")}
            </button>
          ) : (
            <form onSubmit={handleCreateAddress} className="bg-gray-50 p-3 sm:p-4 rounded-lg border space-y-3">
              <input required placeholder={t("street")} className="w-full px-3 py-2.5 border rounded-lg text-sm" onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input required placeholder={t("city")} className="w-full px-3 py-2.5 border rounded-lg text-sm" onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
                <input required placeholder={t("state")} className="w-full px-3 py-2.5 border rounded-lg text-sm" onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input required placeholder={t("zip")} className="w-full px-3 py-2.5 border rounded-lg text-sm" onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} />
                <input required placeholder={t("country")} className="w-full px-3 py-2.5 border rounded-lg text-sm" onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="min-h-[44px] px-4 text-gray-500 text-sm touch-manipulation">{tc("cancel")}</button>
                <button disabled={processing} className="bg-black text-white px-5 min-h-[44px] rounded-lg text-sm font-bold touch-manipulation">{tc("save")}</button>
              </div>
            </form>
          )}
        </div>

        <div>
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border sticky top-20">
            <h2 className="text-lg font-bold mb-4">{t("summary")}</h2>
            <p className="text-sm text-gray-500 mb-6">{t("confirmNote")}</p>
            <button onClick={handlePlaceOrder} disabled={processing || !selectedAddressId}
              className="w-full bg-black text-white min-h-[52px] rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 touch-manipulation active:scale-[0.98]">
              {processing ? <Loader2 className="animate-spin" /> : t("confirmPay")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}