"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LogOut, Menu, X } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface SidebarProps {
  user: User;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Organizations", href: "/organizations", icon: "🏢" },
  { name: "Employees", href: "/employees", icon: "👥" },
  { name: "Payroll", href: "/payroll", icon: "💰" },
  { name: "Compliance", href: "/compliance", icon: "🛡️" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export function Sidebar({ user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="p-2 border border-[#27272a] rounded-md hover:bg-[#18181b] text-[#fafafa]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#18181b] border-r border-[#27272a] transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b border-[#27272a]">
            <h1 className="text-xl font-bold text-[#fafafa]">PayrollX</h1>
          </div>

          <div className="px-4 py-4 border-b border-[#27272a]">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#5eead4] rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-[#09090b]">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#fafafa]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-[#71717a]">{user.email}</p>
                <p className="text-xs text-[#71717a] capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive
                      ? "bg-[#5eead4]/20 text-[#5eead4] border border-[#5eead4]/30"
                      : "text-[#71717a] hover:bg-[#27272a] hover:text-[#fafafa]"
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="h-5 w-5 mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-[#27272a]">
            <button
              className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md border border-[#27272a] hover:bg-[#27272a] text-[#71717a] hover:text-[#fafafa] transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
