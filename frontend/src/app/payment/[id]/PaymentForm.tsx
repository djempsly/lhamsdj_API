// "use client";

// import { useState } from "react";
// import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// import { useRouter } from "next/navigation";

// export default function PaymentForm({ orderId }: { orderId: number }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const router = useRouter();
  
//   const [message, setMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");

//   // --- LÓGICA STRIPE ---
//   const handleSubmitStripe = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;

//     setIsLoading(true);

//     const { error } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         // A donde vuelve el usuario tras pagar (página de éxito)
//         return_url: `${window.location.origin}/payment/success?orderId=${orderId}`,
//       },
//     });

//     if (error) setMessage(error.message || "Error desconocido");
//     setIsLoading(false);
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-lg border">
      
//       {/* Selector de Método */}
//       <div className="flex gap-4 mb-6">
//         <button 
//           onClick={() => setPaymentMethod("stripe")}
//           className={`flex-1 py-2 rounded-lg border font-bold transition ${
//             paymentMethod === "stripe" ? "bg-black text-white border-black" : "bg-white text-gray-600"
//           }`}
//         >
//           Tarjeta (Stripe)
//         </button>
//         <button 
//           onClick={() => setPaymentMethod("paypal")}
//           className={`flex-1 py-2 rounded-lg border font-bold transition ${
//             paymentMethod === "paypal" ? "bg-yellow-400 text-black border-yellow-400" : "bg-white text-gray-600"
//           }`}
//         >
//           PayPal
//         </button>
//       </div>

//       {/* --- FORMULARIO STRIPE --- */}
//       {paymentMethod === "stripe" && (
//         <form onSubmit={handleSubmitStripe}>
//           <PaymentElement />
//           <button 
//             disabled={isLoading || !stripe || !elements} 
//             className="w-full bg-black text-white py-3 rounded-lg font-bold mt-6 hover:bg-gray-800 disabled:opacity-50"
//           >
//             {isLoading ? "Procesando..." : "Pagar Ahora"}
//           </button>
//           {message && <div className="text-red-500 mt-4 text-sm text-center">{message}</div>}
//         </form>
//       )}

//       {/* --- BOTONES PAYPAL --- */}
//       {paymentMethod === "paypal" && (
//         <div className="mt-4">
//                    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
//             <PayPalButtons 
//               style={{ layout: "vertical" }}
//               createOrder={async () => {
//                 // Llamar a tu backend para crear orden PayPal
//                 const res = await fetch("http://localhost:4000/api/v1/paypal/create-order", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ orderId }),
//                     // credentials: "include" // Si usas cookies
//                 });
//                 const order = await res.json();
//                 return order.id;
//               }}
//               onApprove={async (data) => {
//                 // Capturar pago
//                 await fetch("http://localhost:4000/api/v1/paypal/capture-order", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ paypalOrderId: data.orderID, orderId }),
//                 });
//                 router.push(`/payment/success?orderId=${orderId}`);
//               }}
//             />
//           </PayPalScriptProvider>
//         </div>
//       )}

//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";

export default function PaymentForm({ orderId }: { orderId: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"stripe" | "paypal">("stripe");

  // --- LÓGICA STRIPE ---
  const handleSubmitStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirige a una página de agradecimiento
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    // Si llega aquí, hubo un error (si es éxito, stripe redirige solo)
    if (error) setMessage(error.message || "Error desconocido");
    setIsLoading(false);
  };

  return (
    <div className="p-6">
      
      {/* Pestañas de Selección */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        <button 
          onClick={() => setActiveTab("stripe")}
          className={`flex-1 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition ${
            activeTab === "stripe" ? "bg-white shadow text-black" : "text-gray-500"
          }`}
        >
          <CreditCard size={16} /> Tarjeta
        </button>
        <button 
          onClick={() => setActiveTab("paypal")}
          className={`flex-1 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition ${
            activeTab === "paypal" ? "bg-white shadow text-[#003087]" : "text-gray-500"
          }`}
        >
          {/* Logo simple de PayPal texto */}
          PayPal
        </button>
      </div>

      {/* --- OPCIÓN 1: STRIPE --- */}
      {activeTab === "stripe" && (
        <form onSubmit={handleSubmitStripe} className="animate-in fade-in slide-in-from-bottom-2">
          {/* Este componente carga los inputs de tarjeta con logos */}
          <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
          
          <button 
            disabled={isLoading || !stripe || !elements} 
            className="w-full bg-black text-white py-4 rounded-lg font-bold mt-6 hover:bg-gray-800 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Pagar Ahora"}
          </button>
          
          {message && <div className="text-red-500 mt-4 text-sm text-center bg-red-50 p-2 rounded">{message}</div>}
        </form>
      )}

      {/* --- OPCIÓN 2: PAYPAL --- */}
      {activeTab === "paypal" && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
          <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
            <PayPalButtons 
              style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
              
              // 1. CREAR ORDEN EN PAYPAL
              createOrder={async () => {
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paypal/create-order`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId }),
                      credentials: "include" 
                  });
                  const orderData = await res.json();
                  
                  if (!orderData.id) throw new Error("No se recibió ID de PayPal");
                  return orderData.id; // Retornamos el ID de PayPal (ej: 5X...12)
                } catch (err) {
                  console.error(err);
                  setMessage("Error conectando con PayPal");
                  return ""; 
                }
              }}

              // 2. CAPTURAR PAGO (Al aprobar)
              onApprove={async (data) => {
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paypal/capture-order`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ 
                        paypalOrderId: data.orderID, 
                        orderId 
                      }),
                      credentials: "include"
                  });
                  
                  const result = await res.json();
                  
                  if (result.success || result.status === 'COMPLETED') {
                    router.push("/payment/success"); // Éxito
                  } else {
                    setMessage("El pago no se pudo completar.");
                  }
                } catch (err) {
                  setMessage("Error al capturar el pago.");
                }
              }}
            />
          </PayPalScriptProvider>
          {message && <div className="text-red-500 mt-2 text-sm text-center">{message}</div>}
        </div>
      )}

    </div>
  );
}