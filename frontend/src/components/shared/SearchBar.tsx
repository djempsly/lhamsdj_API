"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SearchResult {
  id: number;
  name: string;
  price: string;
  slug: string;
  images: { url: string }[];
  category?: { name: string };
}

export default function SearchBar() {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

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
      setResults([]);
      if (query.length === 0) setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}&limit=6`, { cache: "no-store" });
        const json = await res.json();
        setResults(json.data || []);
        setOpen(true);
      } catch {
        setResults([]);
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

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex">
        <div className={`relative flex-1 flex items-center border-2 rounded-xl bg-white transition-all ${focused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" : "border-gray-200 hover:border-gray-300"}`}>
          <Search className="absolute left-3 text-gray-400 pointer-events-none" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { setFocused(true); if (results.length > 0) setOpen(true); }}
            placeholder={t("placeholder")}
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-transparent outline-none text-sm rounded-xl"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
              className="absolute right-2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full touch-manipulation">
              <X size={15} />
            </button>
          )}
        </div>
        <button type="submit"
          className="ml-1.5 px-4 sm:px-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-medium text-sm touch-manipulation active:scale-95 hidden sm:flex items-center gap-1.5">
          <Search size={16} />
          <span className="hidden lg:inline">{t("searchButton") || "Search"}</span>
        </button>
      </form>

      {/* Results dropdown */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => { setOpen(false); setFocused(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition touch-manipulation group"
                >
                  <div className="relative w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={product.images?.[0]?.url || "https://via.placeholder.com/44"} alt={product.name} fill className="object-cover" sizes="44px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-blue-700 transition">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-orange-600">${product.price}</span>
                      {product.category && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{product.category.name}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                onClick={() => { setOpen(false); setFocused(false); }}
                className="flex items-center justify-center gap-1.5 py-3 text-sm text-blue-600 font-semibold border-t hover:bg-blue-50 transition touch-manipulation"
              >
                <Search size={14} />
                {t("viewAll")} &quot;{query}&quot;
              </Link>
            </>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
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
