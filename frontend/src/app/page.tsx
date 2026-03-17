import { getProducts, getBestSellers } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import Carousel from "@/components/ui/Carousel";
import TrendingTags from "@/components/home/TrendingTags";
import CategoryGrid from "@/components/home/CategoryGrid";
import FlashSalesBanner from "@/components/home/FlashSalesBanner";
import DealOfTheDaySlider from "@/components/home/DealOfTheDaySlider";
import ExploreStrip from "@/components/home/ExploreStrip";
import BestSellersCarousel from "@/components/home/BestSellersCarousel";
import FeaturedPicks from "@/components/home/FeaturedPicks";
import PromoBanner from "@/components/home/PromoBanner";
import NewArrivalsScroll from "@/components/home/NewArrivalsScroll";
import TestimonialsCarousel from "@/components/home/TestimonialsCarousel";
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
      {/* 1. Hero Banner — fade + zoom, deep gradients, progress dots */}
      <section className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-4 sm:pb-6">
        <Carousel />
      </section>

      {/* 2. Trending Tags — colored chips with hover shadows */}
      <section className="container mx-auto px-3 sm:px-4">
        <TrendingTags />
      </section>

      {/* 3. Category Grid — gradient cards, variable layout, colored shadows */}
      <section className="container mx-auto px-3 sm:px-4">
        <CategoryGrid categories={categories} title={t("shopByCategory")} />
      </section>

      {/* 4. Flash Sales — countdown, glow orbs, discount badges */}
      <section className="container mx-auto px-3 sm:px-4">
        <FlashSalesBanner />
      </section>

      {/* 5. Deal of the Day */}
      <section className="container mx-auto px-3 sm:px-4">
        <DealOfTheDaySlider />
      </section>

      {/* 6. Trust Strip */}
      <ExploreStrip />

      {/* 7. Best Sellers — colored border cards, wishlist hearts, rating stars */}
      <section className="container mx-auto px-3 sm:px-4">
        <BestSellersCarousel products={bestSellers} title={t("bestSellers")} badge={t("bestSellerBadge")} />
      </section>

      {/* 8. Featured Picks — asymmetric grid, gradient cards with tags */}
      <section className="container mx-auto px-3 sm:px-4">
        <FeaturedPicks products={bestSellers} title={t("featured")} />
      </section>

      {/* 9. Promo Banner — orbital circles, purple gradient */}
      <section className="container mx-auto px-3 sm:px-4">
        <PromoBanner />
      </section>

      {/* 10. New Arrivals — fade between pages, colored borders, NEW badges */}
      <section className="container mx-auto px-3 sm:px-4">
        <NewArrivalsScroll
          products={productsResult.data}
          title={t("newArrivals")}
          viewMore={tc("viewMore")}
          viewAllHref="/products"
          viewAllLabel={productsResult.pagination?.totalPages > 1 ? t("viewAll") : undefined}
        />
      </section>

      {/* 11. Testimonials — colored borders, avatar gradients */}
      <section className="container mx-auto px-3 sm:px-4">
        <TestimonialsCarousel />
      </section>

      {/* 12. Brands Marquee — uppercase, purple hover */}
      <section className="container mx-auto px-3 sm:px-4">
        <BrandsMarquee />
      </section>

      {/* 13. Recently Viewed — colored border cards */}
      <section className="container mx-auto px-3 sm:px-4">
        <RecentlyViewed />
      </section>

      {/* 14. Newsletter — gradient, glow orb, gradient button */}
      <section className="container mx-auto px-3 sm:px-4">
        <NewsletterSection />
      </section>
    </main>
  );
}
