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
  const { isAuthenticated, user: authUser } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the auth store instead of localStorage
        if (!isAuthenticated || !authUser) {
          router.push("/login");
          return;
        }

        // Convert auth user to dashboard user format
        const userData: User = {
          id: authUser.id,
          firstName: authUser.name.split(" ")[0] || authUser.name,
          lastName: authUser.name.split(" ").slice(1).join(" ") || "",
          email: authUser.email,
          role: "ORG_ADMIN", // Default role, could be from authUser.role
        };
        setUser(userData);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, isAuthenticated, authUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col">
          <Navigation />
          <main className="flex-1 p-6">
            {/* Wallet Balance Section */}
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
