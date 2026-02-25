import { getProducts, getBestSellers } from "@/services/productService";
import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/ui/Carousel";

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white">
        <div className="relative w-full h-64 bg-gray-100">
          <Image
            src={product.images?.[0]?.url || "https://via.placeholder.com/300"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-2">
            {product.description?.substring(0, 50)}...
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">${product.price}</span>
            <span className="text-blue-600 text-sm font-medium">Ver más</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const [productsResult, bestSellers] = await Promise.all([
    getProducts({ limit: 8, sort: "createdAt", order: "desc" }),
    getBestSellers(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <Carousel />
      </div>

      {bestSellers.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-6">Productos Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.map((product: any) => (
              <ProductCard key={`best-${product.id}`} product={product} />
            ))}
          </div>
        </>
      )}

      <h2 className="text-2xl font-bold mb-6 mt-12">Novedades</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productsResult.data.map((product: any) => (
          <ProductCard key={`new-${product.id}`} product={product} />
        ))}
      </div>

      {productsResult.pagination?.totalPages > 1 && (
        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
          >
            Ver todos los productos
          </Link>
        </div>
      )}
    </main>
  );
}
