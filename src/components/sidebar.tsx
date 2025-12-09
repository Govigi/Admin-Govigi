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
      ],
    },
    {
      name: "Settings",
      icon: Cog6ToothIcon,
      path: "/settings",
    },
    {
      name: "Scheduling",
      icon: Squares2X2Icon, // Reusing icon or pick a better one like CalendarIcon if available, but staying safe with imported ones
      path: "/scheduling",
    },
  ];

  return (
    <aside className="w-64 h-screen bg-white fixed top-0 left-0 shadow-md border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <Image src={Logo} alt="GoVigi Logo" width={100} height={40} priority />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {menuItems.map((menu) => {
          const isActive =
            pathname === menu.path ||
            menu?.subModules?.some((sub) => sub.path === pathname);

          const Icon = menu.icon;

          return (
            <div key={menu.name}>
              <div
                onClick={() =>
                  menu.subModules
                    ? toggleMenu(menu.name)
                    : menu.path && router.push(menu.path)
                }
                className={`flex items-center justify-between w-full px-3 py-2 rounded-sm cursor-pointer transition-all duration-200
                  ${isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-green-600" : "text-gray-500"
                      }`}
                  />
                  <span>{menu.name}</span>
                </div>
                {menu.subModules && (
                  <>
                    {openMenus[menu.name] ? (
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </>
                )}
              </div>

              {menu.subModules && openMenus[menu.name] && (
                <div className="ml-8 mt-1 space-y-1 transition-all duration-200">
                  {menu.subModules.map((sub) => {
                    const subActive = pathname === sub.path;
                    return (
                      <div
                        key={sub.name}
                        onClick={() => router.push(sub.path)}
                        className={`px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all duration-200
                          ${subActive
                            ? "bg-green-50 text-green-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {sub.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Section (optional) */}
      <div className="border-t border-gray-200 py-3 text-center text-sm text-gray-500">
        © 2025 GoVigi
      </div>
    </aside>
  );
}
