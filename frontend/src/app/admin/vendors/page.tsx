"use client";

import { useEffect, useState } from "react";
import { getVendors, updateVendorStatus } from "@/services/adminService";
import { Store, Check, X, Clock } from "lucide-react";
import Link from "next/link";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = async () => {
    setLoading(true);
    const res = await getVendors({ status: statusFilter || undefined, limit: 100 });
    if (res.success) setVendors(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleStatus = async (id: number, status: string) => {
    if (!confirm(`¿Cambiar estado del vendedor a ${status}?`)) return;
    const res = await updateVendorStatus(id, { status });
    if (res.success) load();
    else alert(res.message || "Error");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Vendedores</h1>
      <div className="mb-4 flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendientes</option>
          <option value="ACTIVE">Activos</option>
          <option value="SUSPENDED">Suspendidos</option>
          <option value="REJECTED">Rechazados</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Tienda</th>
              <th className="p-4 font-medium text-gray-500">Slug</th>
              <th className="p-4 font-medium text-gray-500">País</th>
              <th className="p-4 font-medium text-gray-500">Comisión %</th>
              <th className="p-4 font-medium text-gray-500">Estado</th>
              <th className="p-4 font-medium text-gray-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando...</td></tr>
            )}
            {!loading && vendors.map((v) => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{v.businessName}</td>
                <td className="p-4">
                  <Link href={`/vendor/${v.slug}`} className="text-blue-600 hover:underline">{v.slug}</Link>
                </td>
                <td className="p-4">{v.country}</td>
                <td className="p-4">{v.commissionRate}%</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    v.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                    v.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    v.status === "SUSPENDED" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {v.status === "PENDING" && (
                    <>
                      <button onClick={() => handleStatus(v.id, "ACTIVE")} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Aprobar">
                        <Check size={18} />
                      </button>
                      <button onClick={() => handleStatus(v.id, "REJECTED")} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Rechazar">
                        <X size={18} />
                      </button>
                    </>
                  )}
                  {v.status === "ACTIVE" && (
                    <button onClick={() => handleStatus(v.id, "SUSPENDED")} className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Suspender">
                      <Clock size={18} />
                    </button>
                  )}
                  {v.status === "SUSPENDED" && (
                    <button onClick={() => handleStatus(v.id, "ACTIVE")} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Reactivar">
                      <Check size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && vendors.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay vendedores.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
