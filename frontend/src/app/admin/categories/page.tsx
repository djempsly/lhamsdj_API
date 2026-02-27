"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getCategories, createCategory, deleteCategory, updateCategory } from "@/services/categoryService";
import { Trash2, Plus, Pencil, X, Check } from "lucide-react";

export default function AdminCategories() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await getCategories();
    if (res.success) setCategories(res.data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    setLoading(true);
    const body: { name: string; parentId?: number } = { name: newCatName };
    if (parentId !== "") body.parentId = parentId;
    const res = await createCategory(body);
    setLoading(false);

    if (res.success) {
      setNewCatName("");
      setParentId("");
      loadCategories();
      alert(t("categoryCreated"));
    } else {
      alert(tCommon("error") + ": " + res.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteCategoryConfirm"))) return;
    const res = await deleteCategory(id);
    if (res.success) loadCategories();
    else alert(res.message);
  };

  const startEdit = (cat: { id: number; name: string }) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSave = async () => {
    if (editingId === null || !editName.trim()) return;
    setLoading(true);
    const res = await updateCategory(editingId, { name: editName.trim() });
    setLoading(false);
    if (res.success) {
      setEditingId(null);
      setEditName("");
      loadCategories();
      alert(t("categoryUpdated"));
    } else {
      alert(tCommon("error") + ": " + res.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t("categoryManagement")}</h1>

      {/* Formulario Crear */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h2 className="text-lg font-semibold mb-4">{t("newCategory")}</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <input
            type="text"
            placeholder={t("categoryPlaceholder")}
            className="flex-1 min-w-[200px] p-2 border rounded-md"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          <select
            className="p-2 border rounded-md min-w-[180px] bg-white"
            value={parentId}
            onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">{t("parentCategoryNone")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-md font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={18} /> {tCommon("create")}
          </button>
        </form>
      </div>

      {/* Tabla Listado */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">{tCommon("id")}</th>
              <th className="p-4 font-medium text-gray-500">{tCommon("name")}</th>
              <th className="p-4 font-medium text-gray-500">{t("slug")}</th>
              <th className="p-4 font-medium text-gray-500 text-right">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-500">#{cat.id}</td>
                <td className="p-4">
                  {editingId === cat.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="p-2 border rounded-md w-full max-w-[200px]"
                      autoFocus
                    />
                  ) : (
                    <span className="font-semibold">{cat.name}</span>
                  )}
                </td>
                <td className="p-4 text-gray-500 font-mono text-sm">{cat.slug}</td>
                <td className="p-4 text-right">
                  {editingId === cat.id ? (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleSave}
                        disabled={loading || !editName.trim()}
                        className="text-green-600 hover:text-green-700 p-2 disabled:opacity-50"
                        title={tCommon("save")}
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-gray-700 p-2"
                        title={tCommon("cancel")}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-blue-600 hover:text-blue-700 p-2"
                        title={tCommon("edit")}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  {t("noCategories")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
