"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { Navigation } from "../../components/layout/Navigation";
import WalletBalance from "../../components/wallet/WalletBalance";
import { useAuthStore } from "@/lib/stores/auth-store";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, user: authUser, _hasHydrated } = useAuthStore();

  useEffect(() => {
    const hasCookie = typeof document !== "undefined" &&
      document.cookie.split(';').some(c => c.trim().startsWith('auth-storage='));

    if (!_hasHydrated) {
      if (hasCookie) {
        return;
      } else {
        router.replace("/login");
        return;
      }
    }

    if (!hasCookie && (!isAuthenticated || !authUser)) {
      router.replace("/login");
      return;
    }

    if (authUser) {
      const userData: User = {
        id: authUser.id,
        firstName: authUser.firstName || authUser.name.split(" ")[0] || authUser.name,
        lastName: authUser.lastName || authUser.name.split(" ").slice(1).join(" ") || "",
        email: authUser.email,
        role: (authUser.role as string) || "ORG_ADMIN",
      };
      setUser(userData);
      setIsLoading(false);
    } else if (hasCookie) {
      setIsLoading(false);
    } else {
      router.replace("/login");
    }
  }, [router, isAuthenticated, authUser, _hasHydrated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5eead4]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col">
          <Navigation />
          <main className="flex-1 p-6">
            <div className="mb-8">
              <WalletBalance />
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
