"use client";

import Hamburger from "./Hamburger";

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

interface MobileSidebarProps {
  isOpen: boolean;
  navItems: {
    icon: React.ReactNode;
    label: string;
    path: string;
  }[];
  pathname: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export default function MobileSidebar({
  isOpen,
  navItems,
  pathname,
  onClose,
  onNavigate,
}: MobileSidebarProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white 
        flex flex-col transform transition-transform duration-300 z-50 
        tablet:hidden desktop:hidden
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-sm">Finance Management</h2>
        <Hamburger isOpen={true} onToggle={onClose} />
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
                onNavigate(item.path);
                onClose();
              }}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}
