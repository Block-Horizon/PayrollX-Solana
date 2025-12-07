"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { Button } from "@payrollx/ui";
// import {
//   LayoutDashboard,
//   Building2,
//   Users,
//   DollarSign,
//   Shield,
//   Settings,
//   LogOut,
//   Menu,
//   X,
// } from "lucide-react";

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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <span className="h-4 w-4">✕</span> : <span className="h-4 w-4">☰</span>}
            </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">PayrollX</h1>
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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

          {/* Logout */}
              <div className="px-4 py-4 border-t">
                <button
                  className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <span className="h-4 w-4 mr-2">🚪</span>
                  Sign Out
                </button>
              </div>
        </div>
      </div>
    </>
  );
}
