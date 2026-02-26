"use client";

import { useEffect, useState } from "react";
import { getSuppliers } from "@/services/adminService";
import { Package } from "lucide-react";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await getSuppliers();
    if (res.success) setSuppliers(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Proveedores (dropshipping)</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">ID</th>
              <th className="p-4 font-medium text-gray-500">Nombre</th>
              <th className="p-4 font-medium text-gray-500">Tipo</th>
              <th className="p-4 font-medium text-gray-500">Estado</th>
              <th className="p-4 font-medium text-gray-500">Productos vinculados</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando...</td></tr>}
            {!loading && suppliers.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono">{s.id}</td>
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4">{s.apiType ?? "—"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${s.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-4">{s._count?.products ?? 0}</td>
              </tr>
            ))}
            {!loading && suppliers.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No hay proveedores. Crea uno desde la API (POST /suppliers).</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
