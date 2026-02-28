"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "@/services/paymentService";
import PaymentForm from "./PaymentForm";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage() {
  const t = useTranslations("payment");
  const { id } = useParams();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const initPayment = () => {
    if (!id) return;
    setLoading(true);
    setError("");
    createPaymentIntent(Number(id)).then((res) => {
      if (res.success) {
        setClientSecret(res.data.clientSecret);
      } else {
        const msg = res.message || "";
        if (msg.toLowerCase().includes("api key") || msg.toLowerCase().includes("invalid")) {
          setError(t("stripeNotConfigured"));
        } else {
          setError(msg);
        }
      }
      setLoading(false);
    });
  };

  useEffect(() => { initPayment(); }, [id]);

  if (loading) return <div className="p-20 text-center">{t("loadingGateway")}</div>;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">{t("paymentError")}</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/cart")} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> {t("backToCart")}
            </button>
            <button onClick={initPayment} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
              <RotateCcw size={16} /> {t("retryPayment")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">{t("securePayment")}</h1>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm orderId={Number(id)} />
      </Elements>
    </div>
  );
}