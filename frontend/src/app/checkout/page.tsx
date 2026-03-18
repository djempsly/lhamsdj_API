"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getAddresses, createAddress, deleteAddress } from "@/services/addressService";
import { createOrder } from "@/services/orderService";
import { validateGiftCard, calculateTax } from "@/services/analyticsAdminService";
import { MapPin, Plus, Loader2, CheckCircle, Gift, Trash2, Receipt } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardResult, setGiftCardResult] = useState<any>(null);
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [taxInfo, setTaxInfo] = useState<{ taxRate: number; taxAmount: number; taxName: string } | null>(null);

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

  const handleDeleteAddress = async (id: number) => {
    if (!confirm(t("deleteAddressConfirm"))) return;
    const res = await deleteAddress(id);
    if (res.success) {
      await loadAddresses();
      if (selectedAddressId === id) setSelectedAddressId(null);
    }
  };

  const handleValidateGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    setGiftCardLoading(true);
    const res = await validateGiftCard(giftCardCode.trim());
    setGiftCardResult(res);
    setGiftCardLoading(false);
  };

  // Calculate tax when address changes
  useEffect(() => {
    if (!selectedAddressId) return;
    const addr = addresses.find((a: any) => a.id === selectedAddressId);
    if (addr) {
      calculateTax(addr.country, addr.state, 0).then((res) => {
        if (res.success && res.data) setTaxInfo(res.data);
      });
    }
  }, [selectedAddressId, addresses]);

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
      <Breadcrumbs items={[{ label: tc("cart"), href: "/cart" }, { label: t("title") }]} />
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
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {selectedAddressId === addr.id && <CheckCircle className="text-green-600" size={20} />}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
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

            {taxInfo && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 p-2 bg-white rounded-lg border">
                <Receipt size={16} className="text-gray-400" />
                <span>{taxInfo.taxName}: {taxInfo.taxRate}%</span>
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1.5">
                <Gift size={16} /> {t("giftCard")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  placeholder={t("giftCardPlaceholder")}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={handleValidateGiftCard}
                  disabled={giftCardLoading || !giftCardCode.trim()}
                  className="px-3 py-2 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {giftCardLoading ? "..." : t("applyGiftCard")}
                </button>
              </div>
              {giftCardResult && (
                <p className={`text-xs mt-1 ${giftCardResult.success ? "text-green-600" : "text-red-500"}`}>
                  {giftCardResult.success ? `${t("giftCardApplied")}: $${giftCardResult.data?.balance}` : (giftCardResult.message || t("giftCardInvalid"))}
                </p>
              )}
            </div>

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