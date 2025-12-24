"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  ShoppingBagIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import Logo from "../../public/GoVigiLogo.png";
import { useUI } from "../libs/Hooks/UIContext";

interface SubModule {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  subModules?: SubModule[];
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: Squares2X2Icon,
      path: "/Dashboard",
    },
    {
      name: "Drivers",
      icon: TruckIcon,
      path: "/drivers",
    },
    {
      name: "Orders",
      icon: ShoppingBagIcon,
      subModules: [
        { name: "Order Summary", path: "/Ordersummary" },
        { name: "Pending Orders", path: "/orders/pending" },
        { name: "Delivered Orders", path: "/orders/delivered" },
      ],
    },
    {
      name: "Sourcing",
      icon: TruckIcon,
      path: "/sourcing",
    },
    {
      name: "Vendors",
      icon: UserGroupIcon, // Reusing UserGroupIcon or similar
      path: "/vendors",
    },
    {
      name: "Customers",
      icon: UserGroupIcon,
      subModules: [
        { name: "Dashboard", path: "/customers-dashboard" },
        { name: "Approvals", path: "/customers-dashboard/approvals" },
        { name: "Segments", path: "/customers-dashboard/segments" },
      ],
    },
    {
      name: "Products",
      icon: ShoppingBagIcon,
      subModules: [
        { name: "Product Management", path: "/product-management" },
        { name: "Stock Report", path: "/Ordersummary/stockReport" },
        { name: "Categories", path: "/Categories" },
      ],
    },
    {
      name: "Finance",
      icon: BanknotesIcon,
      subModules: [
        { name: "Transactions", path: "/finance/transactions" },
        { name: "Order Payments", path: "/finance/payments" },
      ],
    },
    {
      name: "Marketing",
      icon: Cog6ToothIcon,
      subModules: [
        { name: "Mobile App Banners", path: "/marketing/banners" },
      ],
    },
    {
      name: "Settings",
      icon: Cog6ToothIcon,
      subModules: [
        { name: "General", path: "/settings" },
        { name: "Mobile App", path: "/settings/mobile-app" },
      ],
    },
    {
      name: "Scheduling",
      icon: Squares2X2Icon, // Reusing icon or pick a better one like CalendarIcon if available, but staying safe with imported ones
      path: "/scheduling",
    },
  ];

  const { isMobileMenuOpen, closeMobileMenu } = useUI();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`w-64 h-screen bg-white fixed top-0 left-0 shadow-md border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200 shrink-0">
          <Image src={Logo} alt="GoVigi Logo" width={100} height={40} priority />
        </div>

        <nav className="flex-1 overflow-y-auto py-0 px-0 space-y-0">
          {menuItems.map((menu) => {
            const isActive =
              pathname === menu.path ||
              menu?.subModules?.some((sub) => sub.path === pathname);

            const Icon = menu.icon;

            return (
              <div key={menu.name}>
                <div
                  onClick={() => {
                    if (menu.subModules) {
                      toggleMenu(menu.name);
                    } else if (menu.path) {
                      router.push(menu.path);
                      closeMobileMenu(); // Close on navigation
                    }
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-none cursor-pointer transition-colors duration-200 font-mono text-xs uppercase tracking-widest group
                  ${isActive
                      ? "bg-[#10b981] text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#10b981]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-400 group-hover:text-[#10b981]"
                        }`}
                    />
                    <span>{menu.name}</span>
                  </div>
                  {menu.subModules && (
                    <>
                      {openMenus[menu.name] ? (
                        <ChevronDownIcon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      ) : (
                        <ChevronRightIcon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </>
                  )}
                </div>

                {
                  menu.subModules && openMenus[menu.name] && (
                    <div className="ml-0 border-l border-gray-200 pl-0 space-y-0 transition-all duration-200 bg-gray-50">
                      {menu.subModules.map((sub) => {
                        const subActive = pathname === sub.path;
                        return (
                          <div
                            key={sub.name}
                            onClick={() => {
                              router.push(sub.path);
                              closeMobileMenu(); // Close on navigation
                            }}
                            className={`pl-11 pr-4 py-2 text-[10px] uppercase tracking-wider cursor-pointer font-mono border-b border-gray-100 last:border-0 transition-colors
                          ${subActive
                                ? "bg-gray-100 text-[#10b981] font-bold"
                                : "text-gray-500 hover:bg-gray-50 hover:text-[#10b981]"
                              }`}
                          >
                            {sub.name}
                          </div>
                        );
                      })}
                    </div>
                  )
                }
              </div>
            );
          })}
        </nav>

        {/* Footer Section (optional) */}
        <div className="border-t border-gray-200 py-3 text-center text-[10px] font-mono uppercase tracking-widest text-gray-400 shrink-0">
          © 2025 GoVigi
        </div>
      </aside >
    </>
  );
}
