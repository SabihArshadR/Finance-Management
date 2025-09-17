"use client";
import React from "react";
import {
  Navbar,
  NavbarContent,
  NavbarMenuToggle,
  NavbarMenu,
  Link as HeroLink,
  NavbarMenuItem,
} from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";

export default function Menu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Employees", path: "/employee" },
    { label: "Expenses", path: "/expense" },
    { label: "Loans", path: "/loan" },
    { label: "Category", path: "/category" },
    { label: "Partners", path: "/partner" },
  ];

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      className={`bg-skin relative ${
        isMenuOpen ? "bg-brown text-white" : "bg-skin"
      }`}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="rounded transition-colors"
        />
      </NavbarContent>

      <NavbarMenu
        className={`
          absolute 
          top-0 
          desktop:w-[400px] 
          max-h-[540px] 
          overflow-y-auto
          bg-black
          desktop:mx-auto
          mobile:w-full
        `}
      >
        <div className="flex justify-center mt-[60px]">
        </div>

        {navItems.map((item) => (
          <NavbarMenuItem key={item.path}>
            <HeroLink
              onClick={() => {
                router.push(item.path);
                setIsMenuOpen(false);
              }}
              className={`w-full flex justify-center font-poppins font-bold cursor-pointer mt-10 ${
                pathname === item.path
                  ? "text-blue underline underline-offset-4"
                  : "text-white hover:text-blue hover:underline underline-offset-4"
              }`}
            >
              {item.label}
            </HeroLink>
          </NavbarMenuItem>
        ))}

        <div className="flex justify-center gap-10 mt-10">
        </div>
      </NavbarMenu>
    </Navbar>
  );
}
