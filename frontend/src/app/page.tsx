import { getProducts, getBestSellers } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import Carousel from "@/components/ui/Carousel";
import CategoryGrid from "@/components/home/CategoryGrid";
import FlashSalesBanner from "@/components/home/FlashSalesBanner";
import DealOfTheDaySlider from "@/components/home/DealOfTheDaySlider";
import ExploreStrip from "@/components/home/ExploreStrip";
import BestSellersCarousel from "@/components/home/BestSellersCarousel";
import PromoBanner from "@/components/home/PromoBanner";
import NewArrivalsScroll from "@/components/home/NewArrivalsScroll";
import BrandsMarquee from "@/components/home/BrandsMarquee";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import NewsletterSection from "@/components/home/NewsletterSection";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const [productsResult, bestSellers, categoriesResult] = await Promise.all([
    getProducts({ limit: 8, sort: "createdAt", order: "desc" }),
    getBestSellers(),
    getCategories().catch(() => ({ data: [] })),
  ]);

  const categories = categoriesResult?.data || categoriesResult || [];

  return (
    <main className="min-h-screen">
      {/* 1. Hero Banner — fade + zoom transitions, auto-play 6s */}
      <section className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-6 sm:pb-8">
        <Carousel />
      </section>

      {/* 2. Category Grid — animated cards with hover gradients */}
      <section className="container mx-auto px-3 sm:px-4">
        <CategoryGrid categories={categories} title={t("shopByCategory")} />
      </section>

      {/* 3. Flash Sales — countdown timer + discount badges */}
      <section className="container mx-auto px-3 sm:px-4">
        <FlashSalesBanner />
      </section>

      {/* 4. Deal of the Day — slider de productos en oferta */}
      <section className="container mx-auto px-3 sm:px-4">
        <DealOfTheDaySlider />
      </section>

      {/* 5. Trust strip — shipping, returns, security badges */}
      <ExploreStrip />

      {/* 6. Best Sellers — horizontal carousel with badges and ratings */}
      <section className="container mx-auto px-3 sm:px-4">
        <BestSellersCarousel
          products={bestSellers}
          title={t("bestSellers")}
          badge={t("bestSellerBadge")}
        />
      </section>

      {/* 7. Promotional Banner — gradient + floating shapes */}
      <section className="container mx-auto px-3 sm:px-4">
        <PromoBanner />
      </section>

      {/* 8. New Arrivals — fade between groups of 4 with auto-play */}
      <section className="container mx-auto px-3 sm:px-4">
        <NewArrivalsScroll
          products={productsResult.data}
          title={t("newArrivals")}
          viewMore={tc("viewMore")}
          viewAllHref="/products"
          viewAllLabel={productsResult.pagination?.totalPages > 1 ? t("viewAll") : undefined}
        />
      </section>

      {/* 9. Brands Marquee — auto-scroll infinite loop */}
      <section className="container mx-auto px-3 sm:px-4">
        <BrandsMarquee />
      </section>

      {/* 10. Recently Viewed — user's browsing history carousel */}
      <section className="container mx-auto px-3 sm:px-4">
        <RecentlyViewed />
      </section>

      {/* 11. Newsletter — modern gradient section with email input */}
      <section className="container mx-auto px-3 sm:px-4">
        <NewsletterSection />
      </section>
    </main>
  );
}
