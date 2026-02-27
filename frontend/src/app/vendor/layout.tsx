"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import VendorSidebar from "@/components/vendor/VendorSidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!data?.success || !data?.user) {
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
      <VendorSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
