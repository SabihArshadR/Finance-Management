"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FiHome, FiUsers, FiDollarSign, FiCreditCard } from "react-icons/fi";
import { TbCategory } from "react-icons/tb";
import MobileSidebar from "../ui/MobileSidebar";
import Hamburger from "../ui/Hamburger";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", path: "/dashboard" },
    { icon: <FiUsers />, label: "Employees", path: "/employee" },
    { icon: <FiDollarSign />, label: "Transactions", path: "/expense" },
    { icon: <FiCreditCard />, label: "Loans", path: "/loan" },
    { icon: <TbCategory />, label: "Category", path: "/category" },
    { icon: <FiUsers />, label: "Partners", path: "/partner" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <div className="desktop:flex tablet:flex hidden w-64 bg-gray-900 text-white flex-col">
        <div className="p-6">
          <h2 className="text-lg">Finance Management</h2>
        </div>
        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <MobileSidebar
        isOpen={isMobileOpen}
        navItems={navItems}
        pathname={pathname}
        onClose={() => setIsMobileOpen(false)}
        onNavigate={(path) => router.push(path)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 bg-gray-900 text-white flex items-center tablet:hidden desktop:hidden mobile:hidden">
          <Hamburger isOpen={false} onToggle={() => setIsMobileOpen(true)} />
        </div>

        <main className="w-full h-full">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 h-full w-full overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
