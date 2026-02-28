"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";
import { apiFetch } from "@/lib/apiFetch";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: "GET",
          cache: "no-store",
        });
        const data = await res.json();
        if (!data?.success || data?.user?.role !== "ADMIN") {
          router.push("/auth/login");
          return;
        }
        setIsLoading(false);
      } catch {
        router.push("/auth/login");
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}