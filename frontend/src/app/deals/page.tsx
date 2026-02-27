"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Zap, Clock, ShoppingBag } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FlashSaleItem = {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: { url: string }[];
  };
};

type FlashSale = {
  id: number;
  name: string;
  discount: number;
  endDate: string;
  items: FlashSaleItem[];
};

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="flex gap-2">
      {[
        { label: "D", value: timeLeft.days },
        { label: "H", value: timeLeft.hours },
        { label: "M", value: timeLeft.minutes },
        { label: "S", value: timeLeft.seconds },
      ].map((unit) => (
        <div key={unit.label} className="bg-black text-white rounded-lg px-3 py-2 text-center min-w-[52px]">
          <p className="text-xl font-bold font-mono">{String(unit.value).padStart(2, "0")}</p>
          <p className="text-xs text-gray-400">{unit.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function DealsPage() {
  const t = useTranslations("common");
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/marketplace/flash-sales`);
        const data = await res.json();
        if (data.success) setSales(Array.isArray(data.data) ? data.data : []);
      } catch { /* empty */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
          <Zap size={16} /> Flash Sales
        </div>
        <h1 className="text-4xl font-bold mb-2">Today&apos;s Deals</h1>
        <p className="text-gray-500">Limited-time offers you don&apos;t want to miss</p>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto mb-4 text-gray-300" size={64} />
          <h2 className="text-xl font-bold text-gray-600 mb-2">No active deals right now</h2>
          <p className="text-gray-400 mb-6">Check back soon for amazing offers!</p>
          <Link href="/" className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-16">
          {sales.map((sale) => (
            <section key={sale.id}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{sale.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                      {sale.discount}% OFF
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> Ends {new Date(sale.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <CountdownTimer endDate={sale.endDate} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sale.items.map((item) => {
                  const originalPrice = item.product.price;
                  const salePrice = originalPrice * (1 - sale.discount / 100);
                  const imageUrl = item.product.images?.[0]?.url;

                  return (
                    <Link
                      key={item.id}
                      href={`/product/${item.product.slug}`}
                      className="group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative aspect-square bg-gray-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag size={48} />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                          {sale.discount}% OFF
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-gray-600">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">${salePrice.toFixed(2)}</span>
                          <span className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
