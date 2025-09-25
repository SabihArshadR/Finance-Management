"use client";

import { FiMenu, FiX } from "react-icons/fi";

interface HamburgerProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function Hamburger({ isOpen, onToggle, className }: HamburgerProps) {
  return (
    <div className={className}>
      {isOpen ? (
        <FiX
          className="text-2xl cursor-pointer"
          onClick={onToggle}
        />
      ) : (
        <FiMenu
          className="text-2xl cursor-pointer"
          onClick={onToggle}
        />
      )}
    </div>
  );
}
