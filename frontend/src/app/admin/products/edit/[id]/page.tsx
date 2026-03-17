"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getProductById, updateProduct, getProductAnalytics, getProductPriceHistory,
  reorderProductImages, setProductTags as setProductTagsApi, searchTags, createTag,
} from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { uploadImages } from "@/services/uploadService";
import { apiFetch } from "@/lib/apiFetch";
import {
  ArrowLeft, Save, Loader2, ImagePlus, X, Eye, GripVertical, Plus, Trash2,
  TrendingUp, BarChart3, ShoppingCart, Star, ArrowUpRight, ArrowDownRight, RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { showToast } from "@/components/shared/Toast";
import type { Tag, PriceHistoryEntry, ProductAnalytics, ProductVariant } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CARD_COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#22c55e", "#ef4444"];

type TabId = "general" | "variants" | "seo" | "analytics";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const productId = Number(params?.id);

  /* ═══ State ═══ */
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Product form
  const [formData, setFormData] = useState({ name: "", description: "", price: "", stock: "", categoryId: "", metaTitle: "", metaDescription: "" });
  const [uploadedImages, setUploadedImages] = useState<{ id?: number; url: string; position: number }[]>([]);
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState({ color: "", size: "", sku: "", price: "", stock: "" });

  // Tags
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [tagResults, setTagResults] = useState<Tag[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Analytics + Price History
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);

  // Drag state for images
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  /* ═══ Load data ═══ */
  useEffect(() => {
    if (!productId || isNaN(productId)) return;
    const load = async () => {
      try {
        const [productData, catRes] = await Promise.all([getProductById(productId), getCategories()]);
        if (catRes.success) setCategories(catRes.data);
        if (productData) {
          setFormData({
            name: productData.name || "", description: productData.description || "",
            price: productData.price || "", stock: String(productData.stock ?? ""),
            categoryId: String(productData.categoryId ?? ""),
            metaTitle: productData.metaTitle || "", metaDescription: productData.metaDescription || "",
          });
          setSlug(productData.slug || "");
          setIsActive(productData.isActive !== false);
          if (productData.images?.length > 0) {
            setUploadedImages(productData.images.map((img: any, i: number) => ({ id: img.id, url: img.url, position: img.position ?? i })).sort((a: any, b: any) => a.position - b.position));
          }
          if (productData.variants?.length > 0) setVariants(productData.variants);
          // Load tags
          try {
            const tagRes = await apiFetch(`${API_URL}/products/${productId}/tags`);
            // Tags come from product include; if not available, fetch separately
          } catch {}
        } else {
          router.push("/admin/products");
        }
      } catch {
        router.push("/admin/products");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [productId, router]);

  // Load analytics and price history when switching to analytics tab
  useEffect(() => {
    if (activeTab === "analytics" && productId) {
      getProductAnalytics(productId).then(r => { if (r.success) setAnalytics(r.data); });
      getProductPriceHistory(productId).then(r => { if (r.success) setPriceHistory(r.data || []); });
    }
  }, [activeTab, productId]);

  /* ═══ Image handlers ═══ */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const res = await uploadImages(files);
      if (res.success) {
        const newImgs = res.data.map((img: any, i: number) => ({ url: img.url, position: uploadedImages.length + i }));
        setUploadedImages(prev => [...prev, ...newImgs]);
      }
    } catch {} finally { setUploading(false); e.target.value = ""; }
  };

  const removeImage = (idx: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, position: i })));
  };

  // Drag & drop for image reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setUploadedImages(prev => {
      const arr = [...prev];
      const [dragged] = arr.splice(dragIdx, 1);
      arr.splice(idx, 0, dragged);
      setDragIdx(idx);
      return arr.map((img, i) => ({ ...img, position: i }));
    });
  };
  const handleDragEnd = () => setDragIdx(null);

  /* ═══ Tag handlers ═══ */
  const handleTagSearch = useCallback(async (q: string) => {
    setTagSearch(q);
    if (q.length < 1) { setTagResults([]); setShowTagDropdown(false); return; }
    const res = await searchTags(q);
    const existing = new Set(tags.map(t => t.id));
    setTagResults((res.data || []).filter((t: Tag) => !existing.has(t.id)));
    setShowTagDropdown(true);
  }, [tags]);

  const addTag = (tag: Tag) => {
    setTags(prev => [...prev, tag]);
    setTagSearch("");
    setShowTagDropdown(false);
  };

  const removeTag = (tagId: number) => setTags(prev => prev.filter(t => t.id !== tagId));

  const handleCreateTag = async () => {
    if (!tagSearch.trim()) return;
    const res = await createTag(tagSearch.trim());
    if (res.success && res.data) addTag(res.data);
  };

  /* ═══ Variant handlers ═══ */
  const addVariant = async () => {
    if (!newVariant.sku) return;
    try {
      const res = await apiFetch(`${API_URL}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          sku: newVariant.sku,
          color: newVariant.color || undefined,
          size: newVariant.size || undefined,
          price: Number(newVariant.price) || Number(formData.price),
          stock: Number(newVariant.stock) || 0,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVariants(prev => [...prev, json.data]);
        setNewVariant({ color: "", size: "", sku: "", price: "", stock: "" });
        showToast("Variant added", "success");
      } else {
        showToast(json.message || "Error", "error");
      }
    } catch { showToast("Error", "error"); }
  };

  const deleteVariant = async (variantId: number) => {
    try {
      const res = await apiFetch(`${API_URL}/variants/${variantId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) setVariants(prev => prev.filter(v => v.id !== variantId));
    } catch {}
  };

  /* ═══ Save product ═══ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) return showToast(t("minOneImage"), "warning");
    setSaving(true);

    const payload: any = {
      name: formData.name, description: formData.description,
      price: parseFloat(formData.price), stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      metaTitle: formData.metaTitle || null,
      metaDescription: formData.metaDescription || null,
      images: uploadedImages.map(img => img.url),
    };

    const res = await updateProduct(productId, payload);
    if (res.success) {
      // Reorder images if we have IDs
      const idsToReorder = uploadedImages.filter(img => img.id).map(img => img.id!);
      if (idsToReorder.length > 0) await reorderProductImages(productId, idsToReorder);
      // Save tags
      if (tags.length > 0) await setProductTagsApi(productId, tags.map(t => t.id));
      showToast(t("productUpdated"), "success");
      router.push("/admin/products");
    } else {
      showToast(res.message || "Error", "error");
    }
    setSaving(false);
  };

  /* ═══ SEO helpers ═══ */
  const charBar = (len: number, green: number, amber: number) => {
    const pct = Math.min(len / amber, 1) * 100;
    const color = len <= green ? "#22c55e" : len <= amber ? "#f59e0b" : "#ef4444";
    return { width: `${pct}%`, background: color };
  };

  const generateSlugFromName = () => {
    const s = formData.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
    setSlug(s);
  };

  /* ═══ Tabs ═══ */
  const TABS: { id: TabId; label: string }[] = [
    { id: "general", label: tCommon("description") },
    { id: "variants", label: t("variantOptions") },
    { id: "seo", label: t("seo") },
    { id: "analytics", label: t("productAnalytics") },
  ];

  if (loadingData) return <div className="p-10 text-center text-gray-400">{t("loadingData")}</div>;

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold">{t("editProduct", { id: productId })}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/product/${slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderRadius: 10, borderColor: "#8b5cf6", color: "#8b5cf6" }}
          >
            <Eye size={16} /> {t("previewProduct")}
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
            style={{ borderRadius: 10, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", boxShadow: "0 4px 14px rgba(139,92,246,0.25)" }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {t("saveChanges")}
          </button>
        </div>
      </div>

      {/* Tab bar - segmented control */}
      <div className="inline-flex p-1 mb-6 bg-gray-100" style={{ borderRadius: 10 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 text-sm font-medium transition-all"
            style={{
              borderRadius: 8,
              background: activeTab === tab.id ? "white" : "transparent",
              color: activeTab === tab.id ? "#8b5cf6" : "#6b7280",
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ═══ GENERAL TAB ═══ */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Images with drag & drop */}
            <div className="bg-white border p-6" style={{ borderRadius: 12 }}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t("productImages")}</label>
              <p className="text-xs text-gray-400 mb-3">{t("dragToReorder")}</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={`${img.url}-${idx}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className="relative group aspect-square border overflow-hidden cursor-grab active:cursor-grabbing"
                    style={{ borderRadius: 10, opacity: dragIdx === idx ? 0.5 : 1, border: idx === 0 ? "2px solid #8b5cf6" : "1px solid #e5e7eb" }}
                  >
                    <Image src={img.url} alt={`Image ${idx}`} fill className="object-cover" />
                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition">
                      <GripVertical size={16} className="text-white drop-shadow" />
                    </div>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white px-1.5 py-0.5" style={{ borderRadius: 6, background: "#8b5cf6" }}>Main</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed bg-gray-50 hover:bg-gray-100 transition cursor-pointer" style={{ borderRadius: 10 }}>
                  {uploading ? <Loader2 className="animate-spin text-gray-400" /> : (
                    <>
                      <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">{t("addPhotos")}</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Form fields */}
            <div className="bg-white border p-6 space-y-5" style={{ borderRadius: 12 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("name")}</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 border text-sm outline-none transition-colors focus:border-purple-400" style={{ borderRadius: 8 }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("category")}</label>
                  <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-3 py-2.5 border text-sm bg-white outline-none transition-colors focus:border-purple-400" style={{ borderRadius: 8 }}>
                    <option value="">{t("selectCategory")}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("price")}</label>
                  <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2.5 border text-sm outline-none transition-colors focus:border-purple-400" style={{ borderRadius: 8 }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("stock")}</label>
                  <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full px-3 py-2.5 border text-sm outline-none transition-colors focus:border-purple-400" style={{ borderRadius: 8 }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("description")}</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2.5 border text-sm outline-none transition-colors focus:border-purple-400 h-28" style={{ borderRadius: 8 }} />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white border p-6" style={{ borderRadius: 12 }}>
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t("tags")}</label>
              {/* Selected tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, i) => (
                    <span key={tag.id} className="inline-flex items-center gap-1.5 text-xs font-medium py-1 px-3" style={{ borderRadius: 20, background: `${CARD_COLORS[i % 6]}14`, color: CARD_COLORS[i % 6], border: `1px solid ${CARD_COLORS[i % 6]}33` }}>
                      {tag.name}
                      <button type="button" onClick={() => removeTag(tag.id)} className="hover:opacity-70"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
              {/* Search input */}
              <div className="relative">
                <input
                  type="text" value={tagSearch} onChange={e => handleTagSearch(e.target.value)}
                  onFocus={() => tagSearch && setShowTagDropdown(true)}
                  placeholder={t("searchTags")}
                  className="w-full px-3 py-2 border text-sm outline-none transition-colors focus:border-purple-400"
                  style={{ borderRadius: 8 }}
                />
                {showTagDropdown && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border shadow-lg max-h-40 overflow-y-auto" style={{ borderRadius: 8 }}>
                    {tagResults.map(tag => (
                      <button key={tag.id} type="button" onClick={() => addTag(tag)} className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 transition">{tag.name}</button>
                    ))}
                    {tagSearch.trim() && !tagResults.find(t => t.name.toLowerCase() === tagSearch.toLowerCase()) && (
                      <button type="button" onClick={handleCreateTag} className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 font-medium transition">
                        + {t("createTagOption", { name: tagSearch })}
                      </button>
                    )}
                    {tagResults.length === 0 && !tagSearch.trim() && <div className="px-3 py-2 text-sm text-gray-400">—</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ VARIANTS TAB ═══ */}
        {activeTab === "variants" && (
          <div className="space-y-6">
            {/* Add variant */}
            <div className="bg-white border p-6" style={{ borderRadius: 12 }}>
              <h3 className="text-sm font-semibold mb-4">{t("addVariant")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <input placeholder="Color" value={newVariant.color} onChange={e => setNewVariant({ ...newVariant, color: e.target.value })} className="px-3 py-2 border text-sm outline-none focus:border-purple-400" style={{ borderRadius: 8 }} />
                <input placeholder="Size" value={newVariant.size} onChange={e => setNewVariant({ ...newVariant, size: e.target.value })} className="px-3 py-2 border text-sm outline-none focus:border-purple-400" style={{ borderRadius: 8 }} />
                <input placeholder={t("variantSku")} value={newVariant.sku} onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })} className="px-3 py-2 border text-sm outline-none focus:border-purple-400" style={{ borderRadius: 8 }} />
                <input placeholder={t("variantPrice")} type="number" value={newVariant.price} onChange={e => setNewVariant({ ...newVariant, price: e.target.value })} className="px-3 py-2 border text-sm outline-none focus:border-purple-400" style={{ borderRadius: 8 }} />
                <div className="flex gap-2">
                  <input placeholder={t("variantStock")} type="number" value={newVariant.stock} onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })} className="px-3 py-2 border text-sm outline-none focus:border-purple-400 flex-1" style={{ borderRadius: 8 }} />
                  <button type="button" onClick={addVariant} className="px-3 py-2 text-white flex-shrink-0" style={{ borderRadius: 8, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Variants table */}
            <div className="bg-white border overflow-hidden" style={{ borderRadius: 12 }}>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-medium text-gray-500">Color</th>
                    <th className="p-4 font-medium text-gray-500">Size</th>
                    <th className="p-4 font-medium text-gray-500">{t("variantSku")}</th>
                    <th className="p-4 font-medium text-gray-500">{t("variantPrice")}</th>
                    <th className="p-4 font-medium text-gray-500">{t("variantStock")}</th>
                    <th className="p-4 font-medium text-gray-500 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map(v => (
                    <tr key={v.id} className="border-b hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {v.color && <div className="w-4 h-4 rounded-full border" style={{ background: v.color.toLowerCase() }} />}
                          {v.color || "—"}
                        </div>
                      </td>
                      <td className="p-4">{v.size || "—"}</td>
                      <td className="p-4 font-mono text-xs">{v.sku}</td>
                      <td className="p-4">${v.price}</td>
                      <td className="p-4">{v.stock}</td>
                      <td className="p-4 text-right">
                        <button type="button" onClick={() => deleteVariant(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {variants.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">{t("noVariants")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ SEO TAB ═══ */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div className="bg-white border p-6 space-y-5" style={{ borderRadius: 12 }}>
              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("metaTitle")}</label>
                <input value={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} maxLength={70} className="w-full px-3 py-2.5 border text-sm outline-none transition-colors focus:border-purple-400" style={{ borderRadius: 8 }} />
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-gray-100 overflow-hidden" style={{ borderRadius: 4 }}>
                    <div className="h-full transition-all" style={charBar(formData.metaTitle.length, 50, 60)} />
                  </div>
                  <span className="text-xs text-gray-400">{formData.metaTitle.length}/60</span>
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("metaDescription")}</label>
                <textarea value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} maxLength={170} className="w-full px-3 py-2.5 border text-sm outline-none transition-colors focus:border-purple-400 h-20" style={{ borderRadius: 8 }} />
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-gray-100 overflow-hidden" style={{ borderRadius: 4 }}>
                    <div className="h-full transition-all" style={charBar(formData.metaDescription.length, 140, 160)} />
                  </div>
                  <span className="text-xs text-gray-400">{formData.metaDescription.length}/160</span>
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center px-3 py-2.5 border bg-gray-50 text-sm text-gray-500 overflow-hidden" style={{ borderRadius: 8 }}>
                    <span className="truncate">yourdomain.com/product/<span className="font-medium text-gray-800">{slug}</span></span>
                  </div>
                  <button type="button" onClick={generateSlugFromName} className="p-2.5 border hover:bg-gray-50 transition" style={{ borderRadius: 8 }} title="Regenerate from name">
                    <RefreshCw size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Google Preview */}
            <div className="bg-white border p-6" style={{ borderRadius: 12 }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{t("googlePreview")}</h3>
              <div className="border p-4" style={{ borderRadius: 8 }}>
                <p className="text-lg" style={{ color: "#1a0dab" }}>{formData.metaTitle || formData.name || "Product Title"}</p>
                <p className="text-sm mt-0.5" style={{ color: "#006621" }}>yourdomain.com/product/{slug}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{formData.metaDescription || formData.description || "Product description..."}</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ANALYTICS TAB ═══ */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Metric cards */}
            {analytics ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={<Eye size={20} />} label={t("totalViews")} value={analytics.views} color="#8b5cf6" />
                <MetricCard icon={<TrendingUp size={20} />} label={t("totalRevenue")} value={`$${analytics.revenue.toLocaleString()}`} color="#22c55e" />
                <MetricCard icon={<ShoppingCart size={20} />} label={t("unitsSold")} value={analytics.unitsSold} color="#06b6d4" />
                <MetricCard icon={<BarChart3 size={20} />} label={t("conversionRate")} value={`${analytics.conversionRate}%`} color="#f59e0b" />
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">{t("loadingData")}</div>
            )}

            {/* Price History */}
            <div className="bg-white border p-6" style={{ borderRadius: 12 }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">{t("priceHistory")}</h3>
              {priceHistory.length === 0 ? (
                <p className="text-sm text-gray-400">{t("noPriceHistory")}</p>
              ) : (
                <div className="space-y-3">
                  {priceHistory.map((entry, i) => {
                    const oldP = Number(entry.oldPrice);
                    const newP = Number(entry.newPrice);
                    const isUp = newP > oldP;
                    return (
                      <div key={entry.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: isUp ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)" }}>
                          {isUp ? <ArrowUpRight size={16} className="text-red-500" /> : <ArrowDownRight size={16} className="text-green-500" />}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm">
                            <span className="text-gray-400 line-through">${oldP.toFixed(2)}</span>
                            <span className="mx-2">→</span>
                            <span className="font-semibold" style={{ color: isUp ? "#ef4444" : "#22c55e" }}>${newP.toFixed(2)}</span>
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(entry.changedAt).toLocaleDateString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white border p-5 flex items-center gap-4" style={{ borderRadius: 12, borderLeft: `3px solid ${color}` }}>
      <div className="p-2.5 rounded-full" style={{ background: `${color}14`, color }}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}
