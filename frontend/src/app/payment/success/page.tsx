"use client";

import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId"); // Si lo enviamos en la URL

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border text-center">
        
        <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={60} />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-500 mb-8 text-lg">
          Gracias por tu compra. Tu pedido ha sido confirmado y pronto lo prepararemos.
        </p>

        {orderId && (
          <div className="bg-gray-100 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Número de Orden</p>
            <p className="text-2xl font-mono font-bold text-black">#{orderId}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/profile/orders" 
            className=" w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} /> Ver mis Pedidos
          </Link>

          <Link 
            href="/" 
            className=" w-full bg-white text-black border-2 border-gray-200 py-4 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            Seguir Comprando <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}