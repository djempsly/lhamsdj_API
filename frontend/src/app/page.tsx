import { getProducts, getBestSellers } from "@/services/productService";
import Carousel from "@/components/ui/Carousel";
import DealOfTheDaySlider from "@/components/home/DealOfTheDaySlider";
import ExploreStrip from "@/components/home/ExploreStrip";
import BentoFeatured from "@/components/home/BentoFeatured";
import NewArrivalsScroll from "@/components/home/NewArrivalsScroll";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const [productsResult, bestSellers] = await Promise.all([
    getProducts({ limit: 8, sort: "createdAt", order: "desc" }),
    getBestSellers(),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero: slider principal */}
      <section className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-6 sm:pb-8">
        <Carousel />
      </section>

      {/* Ofertas del día: slider de productos en oferta */}
      <section className="container mx-auto px-3 sm:px-4">
        <DealOfTheDaySlider />
      </section>

      {/* Strip: explorar / confianza (envío, devoluciones, etc.) */}
      <ExploreStrip />

      {/* Destacados: layout bento (1 grande + 3 pequeños) */}
      <section className="container mx-auto px-3 sm:px-4">
        <BentoFeatured
          products={bestSellers}
          title={t("featured")}
          viewMore={tc("viewMore")}
        />
      </section>

      {/* Nuevos: scroll horizontal en móvil, grid en desktop */}
      <section className="container mx-auto px-3 sm:px-4">
        <NewArrivalsScroll
          products={productsResult.data}
          title={t("newArrivals")}
          viewMore={tc("viewMore")}
          viewAllHref="/products"
          viewAllLabel={productsResult.pagination?.totalPages > 1 ? t("viewAll") : undefined}
        />
      </section>
    </main>
  );
}
