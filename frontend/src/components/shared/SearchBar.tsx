"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { searchAutocomplete } from "@/services/searchService";

interface ProductResult {
  id: number;
  name: string;
  price: string;
  slug: string;
  images?: { url: string }[];
}

interface CategoryResult {
  id: number;
  name: string;
  slug?: string;
}

export default function SearchBar() {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const totalItems = products.length + categories.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setProducts([]);
      setCategories([]);
      if (query.length === 0) setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAutocomplete(query);
        if (res.success && res.data) {
          setProducts(res.data.products || []);
          setCategories(res.data.categories || []);
          setOpen(true);
          setActiveIndex(-1);
        }
      } catch {
        setProducts([]);
        setCategories([]);
      }
      setLoading(false);
    }, 300);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setOpen(false);
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open || totalItems === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (activeIndex < products.length) {
        const p = products[activeIndex];
        router.push(`/product/${p.slug}`);
      } else {
        const c = categories[activeIndex - products.length];
        router.push(`/products?category=${c.slug || c.id}`);
      }
      setOpen(false);
      setFocused(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }, [open, totalItems, activeIndex, products, categories, router]);

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex">
        <div className={`relative flex-1 flex items-center border-2 rounded-xl bg-white transition-all ${focused ? "border-purple-400 shadow-[0_0_0_3px_rgba(139,92,246,0.1)]" : "border-gray-200 hover:border-gray-300"}`}>
          <Search className="absolute left-3 text-gray-400 pointer-events-none" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { setFocused(true); if (products.length > 0 || categories.length > 0) setOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-transparent outline-none text-sm rounded-xl"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setProducts([]); setCategories([]); setOpen(false); inputRef.current?.focus(); }}
              className="absolute right-2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full touch-manipulation">
              <X size={15} />
            </button>
          )}
        </div>
        <button type="submit"
          className="ml-1.5 px-4 sm:px-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition font-medium text-sm touch-manipulation active:scale-95 hidden sm:flex items-center gap-1.5">
          <Search size={16} />
          <span className="hidden lg:inline">{t("searchButton") || "Search"}</span>
        </button>
      </form>

      {/* Results dropdown */}
      {open && (
        <div
          className="absolute top-full mt-1.5 left-0 right-0 bg-white shadow-2xl z-50 overflow-hidden"
          style={{ border: "1px solid rgba(139,92,246,0.15)", borderRadius: 12 }}
        >
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          )}

          {!loading && (products.length > 0 || categories.length > 0) && (
            <>
              {/* Products section */}
              {products.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">{t("products")}</p>
                  {products.map((product, i) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => { setOpen(false); setFocused(false); }}
                      className={`flex items-center gap-3 px-4 py-2.5 transition touch-manipulation group ${
                        activeIndex === i ? "bg-purple-50" : "hover:bg-purple-50"
                      }`}
                    >
                      <div className="relative w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={product.images?.[0]?.url || "https://via.placeholder.com/44"} alt={product.name} fill className="object-cover" sizes="44px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-purple-700 transition">{product.name}</p>
                        <span className="text-sm font-bold text-orange-600">${product.price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Categories section */}
              {categories.length > 0 && (
                <div>
                  {products.length > 0 && <div className="h-px bg-gray-100 mx-4" />}
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">{t("categories")}</p>
                  {categories.map((cat, i) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug || cat.id}`}
                      onClick={() => { setOpen(false); setFocused(false); }}
                      className={`flex items-center gap-3 px-4 py-2.5 transition touch-manipulation ${
                        activeIndex === products.length + i ? "bg-purple-50" : "hover:bg-purple-50"
                      }`}
                    >
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 flex-shrink-0">
                        <Search size={14} />
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* View all link */}
              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                onClick={() => { setOpen(false); setFocused(false); }}
                className="flex items-center justify-center gap-1.5 py-3 text-sm text-purple-600 font-semibold border-t hover:bg-purple-50 transition touch-manipulation"
              >
                <Search size={14} />
                {t("viewAll")} &quot;{query}&quot;
              </Link>
            </>
          )}

          {!loading && query.length >= 2 && products.length === 0 && categories.length === 0 && (
            <div className="py-8 text-center">
              <Search size={28} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-500">{t("noResults")} &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
