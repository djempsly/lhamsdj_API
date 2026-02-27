// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
// import { createPaymentIntent } from "@/services/paymentService";
// import PaymentForm from "./PaymentForm"; // Lo crearemos abajo


// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);



// export default function PaymentPage() {
//   const { id } = useParams();
//   const [clientSecret, setClientSecret] = useState("");

//   useEffect(() => {
//     if (id) {
//       // Pedimos al backend permiso para cobrar esta orden
//       createPaymentIntent(Number(id)).then((res) => {
//         if (res.success) {
//           setClientSecret(res.data.clientSecret);
//         } else {
//           alert("Error iniciando pago: " + res.message);
//         }
//       });
//     }
//   }, [id]);

//   if (!clientSecret) return <div className="p-20 text-center">Cargando pasarela de pago...</div>;

//   return (
//     <div className="container mx-auto px-4 py-10 max-w-lg">
//       <h1 className="text-2xl font-bold mb-6 text-center">Pago Seguro</h1>
      
//       {/* Carga el entorno seguro de Stripe */}
//       <Elements stripe={stripePromise} options={{ clientSecret }}>
//         <PaymentForm orderId={Number(id)} />
//       </Elements>
//     </div>
//   );
// }






"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "@/services/paymentService";
import PaymentForm from "./PaymentForm"; // Lo crearemos abajo


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);



export default function PaymentPage() {
  const t = useTranslations("payment");
  const { id } = useParams();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (id) {
      // Pedimos al backend permiso para cobrar esta orden
      createPaymentIntent(Number(id)).then((res) => {
        if (res.success) {
          setClientSecret(res.data.clientSecret);
        } else {
          alert(t("paymentError") + ": " + res.message);
        }
      });
    }
  }, [id]);

  if (!clientSecret) return <div className="p-20 text-center">{t("loadingGateway")}</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">{t("securePayment")}</h1>
      
      {/* Carga el entorno seguro de Stripe */}
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm orderId={Number(id)} />
      </Elements>
    </div>
  );
}