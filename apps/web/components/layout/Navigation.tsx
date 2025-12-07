"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
// import {
//   LayoutDashboard,
//   Building2,
//   Users,
//   DollarSign,
//   Shield,
//   Settings,
// } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Organizations", href: "/organizations", icon: "🏢" },
  { name: "Employees", href: "/employees", icon: "👥" },
  { name: "Payroll", href: "/payroll", icon: "💰" },
  { name: "Compliance", href: "/compliance", icon: "🛡️" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b">
      <div className="px-6">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                    <span className="h-4 w-4 mr-2">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
