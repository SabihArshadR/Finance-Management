"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { TbCategory } from "react-icons/tb";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => (
  <li
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-white/10 hover:text-white"
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </li>
);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <div
        className="desktop:flex tablet:flex hidden w-64 bg-gray-900
       text-white flex-col"
      >
        <div className="p-6">
          <h2 className="text-lg">Finance Management</h2>
        </div>

        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={pathname === item.path}
                onClick={() => router.push(item.path)}
              />
            ))}
          </ul>
        </nav>

        <div className="">
          {/* <div
            onClick={handleLogout}
            className="flex items-center space-x-3 p-5 rounded-lg cursor-pointer
             text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <FiLogOut className="text-xl" />
            <span className="font-medium">Logout</span>
          </div> */}
        </div>
      </div>

      {/* Mobile Sidebar (Slide-in) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white 
          flex flex-col transform transition-transform duration-300 z-50 
          tablet:hidden desktop:hidden
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-lg">Finance Management</h2>
          <FiX
            className="text-2xl cursor-pointer"
            onClick={() => setIsMobileOpen(false)}
          />
        </div>

        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={pathname === item.path}
                onClick={() => {
                  router.push(item.path);
                  setIsMobileOpen(false);
                }}
              />
            ))}
          </ul>
        </nav>

        <div className="">
          {/* <div
            onClick={() => {
              handleLogout();
              setIsMobileOpen(false);
            }}
            className="flex items-center space-x-3 p-5 rounded-lg cursor-pointer
             text-red-400 hover:bg-red-500/10 hover:text-red-300 
             transition-colors"
          >
            <FiLogOut className="text-xl" />
            <span className="font-medium">Logout</span>
          </div> */}
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="p-3 bg-gray-900 text-white flex items-center tablet:hidden 
        desktop:hidden"
        >
          <FiMenu
            className="text-2xl cursor-pointer"
            onClick={() => setIsMobileOpen(true)}
          />
          <h2 className="ml-4 text-lg">Finance Management</h2>
          <div
            onClick={() => {
              handleLogout();
              setIsMobileOpen(false);
            }}
            className="rounded-lg cursor-pointer
             text-red-400 hover:bg-red-500/10 hover:text-red-300 
             transition-colors ml-36"
          >
            <FiLogOut className="text-xl" />
          </div>
        </div>

        <main className="h-full w-full">
          <div
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 
          h-full w-full overflow-auto"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
