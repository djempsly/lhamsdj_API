"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAddresses, createAddress } from "@/services/addressService";
import { createOrder } from "@/services/orderService"; // Asegúrate de tener este servicio en frontend
import { MapPin, Plus, Loader2, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
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
    if (!selectedAddressId) return alert("Selecciona una dirección de envío");
    
    setProcessing(true);
    
    // 1. Crear la Orden en el Backend
    // Necesitas crear la función createOrder en src/services/orderService.ts del frontend
    const res = await createOrder(selectedAddressId); 
    
    if (res.success) {
      // 2. Redirigir a la página de pago con el ID de la orden
      router.push(`/payment/${res.data.id}`);
    } else {
      alert("Error creando la orden: " + res.message);
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SELECCIÓN DE DIRECCIÓN */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin /> Dirección de Envío
          </h2>

          <div className="space-y-4 mb-6">
            {addresses.map((addr) => (
              <div 
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`p-4 border rounded-lg cursor-pointer transition flex justify-between items-center ${
                  selectedAddressId === addr.id ? "border-black bg-gray-50 ring-1 ring-black" : "hover:border-gray-400"
                }`}
              >
                <div>
                  <p className="font-bold">{addr.street}</p>
                  <p className="text-sm text-gray-600">{addr.city}, {addr.country}</p>
                  <p className="text-xs text-gray-500">{addr.postalCode}</p>
                </div>
                {selectedAddressId === addr.id && <CheckCircle className="text-green-600" />}
              </div>
            ))}
          </div>

          {!showForm ? (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 text-blue-600 font-medium hover:underline"
            >
              <Plus size={18} /> Agregar nueva dirección
            </button>
          ) : (
            <form onSubmit={handleCreateAddress} className="bg-gray-50 p-4 rounded-lg border space-y-3 animate-in fade-in slide-in-from-top-2">
              <input required placeholder="Calle y número" className="w-full p-2 border rounded" 
                onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="Ciudad" className="w-full p-2 border rounded" 
                  onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
                <input required placeholder="Estado/Provincia" className="w-full p-2 border rounded" 
                  onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="Código Postal" className="w-full p-2 border rounded" 
                  onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} />
                <input required placeholder="País" className="w-full p-2 border rounded" 
                  onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 text-sm px-3">Cancelar</button>
                <button disabled={processing} className="bg-black text-white px-4 py-2 rounded text-sm font-bold">Guardar</button>
              </div>
            </form>
          )}
        </div>

        {/* RESUMEN Y CONFIRMACIÓN */}
        <div>
          <div className="bg-gray-50 p-6 rounded-xl border sticky top-24">
            <h2 className="text-lg font-bold mb-4">Resumen</h2>
            <p className="text-sm text-gray-500 mb-6">
              Al confirmar, se creará tu orden y pasarás a la pasarela de pago segura.
            </p>
            
            <button
              onClick={handlePlaceOrder}
              disabled={processing || !selectedAddressId}
              className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {processing ? <Loader2 className="animate-spin" /> : "Confirmar y Pagar"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}