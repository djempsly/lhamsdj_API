import { getProducts, getBestSellers } from "@/services/productService";
import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/ui/Carousel";
import { getTranslations } from "next-intl/server";

function ProductCard({ product, viewMore }: { product: any; viewMore: string }) {
  return (
    <Link href={`/product/${product.slug}`} className="group touch-manipulation">
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white">
        <div className="relative w-full aspect-[4/3] sm:h-64 bg-gray-100">
          <Image
            src={product.images?.[0]?.url || "https://via.placeholder.com/300"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-lg truncate">{product.name}</h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-2 line-clamp-2">
            {product.description?.substring(0, 50)}...
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg sm:text-xl font-bold">${product.price}</span>
            <span className="text-blue-600 text-xs sm:text-sm font-medium">{viewMore}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const [productsResult, bestSellers] = await Promise.all([
    getProducts({ limit: 8, sort: "createdAt", order: "desc" }),
    getBestSellers(),
  ]);

  return (
    <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-8 sm:mb-10">
        <Carousel />
      </div>

      {bestSellers.length > 0 && (
        <>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("featured")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {bestSellers.map((product: any) => (
              <ProductCard key={`best-${product.id}`} product={product} viewMore={tc("viewMore")} />
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-12">{t("newArrivals")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {productsResult.data.map((product: any) => (
          <ProductCard key={`new-${product.id}`} product={product} viewMore={tc("viewMore")} />
        ))}
      </div>

      {productsResult.pagination?.totalPages > 1 && (
        <div className="text-center mt-8">
          <Link href="/products" className="inline-flex items-center justify-center bg-black text-white px-8 min-h-[48px] rounded-full font-semibold hover:bg-gray-800 transition touch-manipulation">
            {t("viewAll")}
          </Link>
        </div>
      )}
    </main>
  );
}
