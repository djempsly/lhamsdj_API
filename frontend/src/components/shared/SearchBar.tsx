"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SearchResult {
  id: number;
  name: string;
  price: string;
  slug: string;
  images: { url: string }[];
}

export default function SearchBar() {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
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
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
            >
              <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={product.images?.[0]?.url || "https://via.placeholder.com/40"} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-gray-500">${product.price}</p>
              </div>
            </Link>
          ))}
          <Link
            href={`/products?search=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="block text-center py-2.5 text-sm text-blue-600 font-medium border-t hover:bg-gray-50"
          >
            {t("viewAll")}
          </Link>
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 text-center text-sm text-gray-500">
          {t("noResults")} &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
