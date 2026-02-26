"use client";

import { useEffect, useState } from "react";
import { getAuditLogs } from "@/services/adminService";
import { FileText } from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await getAuditLogs({ page, limit: 50, action: actionFilter || undefined, entity: entityFilter || undefined });
    if (res.success) {
      setLogs(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.totalPages ?? 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page, actionFilter, entityFilter]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Audit log</h1>
      <div className="mb-4 flex gap-2 flex-wrap">
        <input
          placeholder="Filtrar por acción"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2"
        />
        <input
          placeholder="Filtrar por entidad"
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2"
        />
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Fecha</th>
              <th className="p-4 font-medium text-gray-500">Usuario ID</th>
              <th className="p-4 font-medium text-gray-500">Acción</th>
              <th className="p-4 font-medium text-gray-500">Entidad</th>
              <th className="p-4 font-medium text-gray-500">ID entidad</th>
              <th className="p-4 font-medium text-gray-500">Detalles</th>
              <th className="p-4 font-medium text-gray-500">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-8 text-center text-gray-500">Cargando...</td></tr>}
            {!loading && logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-4">{log.userId ?? "—"}</td>
                <td className="p-4 font-medium">{log.action}</td>
                <td className="p-4">{log.entity}</td>
                <td className="p-4">{log.entityId ?? "—"}</td>
                <td className="p-4 max-w-xs truncate" title={log.details ?? ""}>{log.details ?? "—"}</td>
                <td className="p-4 text-gray-500">{log.ip ?? "—"}</td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No hay registros.</td></tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
            <span className="px-3 py-1">Página {page} de {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Siguiente</button>
          </div>
        )}
      </div>
    </div>
  );
}
