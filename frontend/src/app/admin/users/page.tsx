"use client";

import { useEffect, useState } from "react";
import { getAllUsers, toggleUserStatus } from "@/services/adminService";
import { UserCheck, UserX, Shield } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const res = await getAllUsers();
    if (res.success) setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const res = await toggleUserStatus(id, !currentStatus);
    if (res.success) loadUsers();
  };

  if (loading) return <div className="p-8">Cargando usuarios...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Usuarios Registrados</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Usuario</th>
              <th className="p-4 font-medium text-gray-500">Rol</th>
              <th className="p-4 font-medium text-gray-500">Estado</th>
              <th className="p-4 font-medium text-gray-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </td>
                <td className="p-4">
                  {user.role === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                      <Shield size={12} /> ADMIN
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600">Cliente</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {user.role !== 'ADMIN' && (
                    <button
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      className={`p-2 rounded-md transition ${
                        user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'
                      }`}
                      title={user.isActive ? "Desactivar cuenta" : "Activar cuenta"}
                    >
                      {user.isActive ? <UserX size={20} /> : <UserCheck size={20} />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}