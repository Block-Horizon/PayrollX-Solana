"use client";
import { WalletMultiButton } from "@/components/wallet/SolanaProvider";
import MpcWalletLink from "../wallet/MpcWalletLink";
import { DarkModeToggle } from "../DarkModeToggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import Link from "next/link";
import { Zap, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";
    }
    logout();
    toast.success("Logged out successfully", {
      description: "You have been logged out.",
    });
    window.location.href = "/login";
  };

  return (
    <header className="bg-[#09090b]/90 backdrop-blur-md border-b border-[#27272a] px-6 py-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-[#5eead4] rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-[#09090b]" />
          </div>
          <span className="text-2xl font-bold text-[#fafafa]">
            PayrollX
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          <DarkModeToggle />
          <WalletMultiButton className="!bg-[#5eead4] !hover:!bg-[#5eead4]/90 !text-[#09090b] !border-none !rounded-lg !shadow-lg" />
          {isAuthenticated && (
            <>
              <MpcWalletLink />
              <div className="flex items-center space-x-2">
                <span className="text-[#71717a] text-sm">{user?.name}</span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b]"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-2">
          <DarkModeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b]"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-[#27272a]">
          <div className="flex flex-col space-y-4 pt-4">
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-[#5eead4] !hover:!bg-[#5eead4]/90 !text-[#09090b] !border-none !rounded-lg !shadow-lg" />
            </div>
            {isAuthenticated && (
              <>
                <div className="flex justify-center">
                  <MpcWalletLink />
                </div>
                <div className="text-center">
                  <p className="text-[#71717a] text-sm mb-2">{user?.name}</p>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
