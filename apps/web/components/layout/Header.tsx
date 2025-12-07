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
    logout();
    toast.success("Logged out successfully", {
      description: "You have been logged out.",
    });
    window.location.href = "/login";
  };

  return (
    <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            PayrollX-Solana
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <DarkModeToggle />
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-purple-700 !hover:!from-purple-700 !hover:!to-purple-800 !text-white !border-none !rounded-lg !shadow-lg" />
          {isAuthenticated && (
            <>
              <MpcWalletLink />
              <div className="flex items-center space-x-2">
                <span className="text-white/80 text-sm">{user?.name}</span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <DarkModeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10">
          <div className="flex flex-col space-y-4 pt-4">
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-purple-700 !hover:!from-purple-700 !hover:!to-purple-800 !text-white !border-none !rounded-lg !shadow-lg" />
            </div>
            {isAuthenticated && (
              <>
                <div className="flex justify-center">
                  <MpcWalletLink />
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-2">{user?.name}</p>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10"
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
