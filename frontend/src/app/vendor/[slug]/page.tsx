"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getVendorProfile, getVendorProducts } from "@/services/vendorService";
import Image from "next/image";
import Link from "next/link";
import { Store, MapPin, Package, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Pagination } from "@/types";

export default function VendorStorePage() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getVendorProfile(slug as string).then((res) => {
      if (res.success) {
        setVendor(res.data);
        loadProducts(res.data.id, 1);
      }
      setLoading(false);
    });
  }, [slug]);

  async function loadProducts(vendorId: number, p: number) {
    const res = await getVendorProducts(vendorId, p);
    if (res.success || res.data) {
      setProducts(res.data);
      setPagination(res.pagination);
      setPage(p);
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-10"><div className="h-48 bg-gray-100 rounded-xl animate-pulse" /></div>;
  if (!vendor) return <div className="container mx-auto px-4 py-20 text-center text-gray-400 text-lg">Vendedor no encontrado</div>;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-4">
          {vendor.logo ? (
            <Image src={vendor.logo} alt={vendor.businessName} width={72} height={72} className="rounded-xl" />
          ) : (
            <div className="w-[72px] h-[72px] bg-white/10 rounded-xl flex items-center justify-center">
              <Store size={32} className="text-white/60" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{vendor.businessName}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
              <span className="flex items-center gap-1"><MapPin size={14} />{vendor.country}{vendor.city ? `, ${vendor.city}` : ""}</span>
              <span className="flex items-center gap-1"><Package size={14} />{vendor._count?.products || 0} productos</span>
            </div>
          </div>
        </div>
        {vendor.description && <p className="mt-4 text-sm text-white/80 max-w-2xl">{vendor.description}</p>}
      </div>

      <h2 className="text-xl font-bold mb-4">Productos de {vendor.businessName}</h2>

      {products.length === 0 ? (
        <p className="text-center py-10 text-gray-400">Este vendedor aún no tiene productos</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product: any) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group">
              <div className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="relative aspect-square bg-gray-50">
                  <Image src={product.images?.[0]?.url || "https://via.placeholder.com/300"} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <span className="text-lg font-bold">${product.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button disabled={!pagination.hasPrev} onClick={() => loadProducts(vendor.id, page - 1)} className="p-2 border rounded-lg disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600 px-4">Página {page} de {pagination.totalPages}</span>
          <button disabled={!pagination.hasNext} onClick={() => loadProducts(vendor.id, page + 1)} className="p-2 border rounded-lg disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </main>
  );
}
