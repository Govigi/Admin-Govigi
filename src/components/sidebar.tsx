"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowsRightLeftIcon,
  BanknotesIcon,
  BellIcon,
  ChartBarIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  CubeIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  TruckIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Logo from "../../public/GoVigiLogo.png";
import { useUI } from "../libs/Hooks/UIContext";

type SubItem = {
  name: string;
  path: string;
};

type NavItem = {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  match?: string[];
  subItems?: SubItem[];
};

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/Dashboard", icon: Squares2X2Icon },
  {
    name: "Orders",
    path: "/Ordersummary",
    icon: ShoppingBagIcon,
    subItems: [
      { name: "Order Summary", path: "/Ordersummary" },
      { name: "Order Assignment", path: "/order-assignment" },
    ],
  },
  {
    name: "Products",
    path: "/product-management",
    icon: CubeIcon,
    subItems: [
      { name: "Manage Products", path: "/product-management" },
      { name: "Categories", path: "/Categories" },
      { name: "Product Requests", path: "/product-requests" },
    ],
  },
  {
    name: "Vendors",
    path: "/vendors",
    icon: UserGroupIcon,
    subItems: [
      { name: "Manage Vendors", path: "/vendors" },
      { name: "Vendor Submissions", path: "/vendor-requests" },
    ],
  },
  { name: "Users", path: "/customers-dashboard", icon: UsersIcon },
  { name: "Delivery Partners", path: "/drivers", icon: TruckIcon },
  { name: "Payments", path: "/finance/payments", icon: BanknotesIcon },
  { name: "Reports", path: "/Ordersummary/stockReport", icon: DocumentTextIcon },
  { name: "Notifications", path: "/inventory-alerts", icon: BellIcon },
  { name: "Settings", path: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileMenuOpen, closeMobileMenu, isSidebarCollapsed } = useUI();
  
  // Track which submenus are open
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Auto-expand menu if a child is active on page load
  useEffect(() => {
    const activeParent = navItems.find(item => 
      item.subItems?.some(sub => pathname === sub.path || pathname.startsWith(`${sub.path}/`))
    );
    if (activeParent) {
      setOpenMenus(prev => ({ ...prev, [activeParent.name]: true }));
    }
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const isActive = (item: NavItem | SubItem) => {
    if ("subItems" in item && item.subItems) {
      return item.subItems.some((sub) => pathname === sub.path || pathname.startsWith(`${sub.path}/`));
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  const goTo = (path: string) => {
    router.push(path);
    closeMobileMenu();
  };

  return (
    <>
      {isMobileMenuOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-gray-950/40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 md:translate-x-0 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* LOGO SECTION */}
        <div className={`flex h-20 items-center border-b border-gray-100 px-5 ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <Image src={Logo} alt="Govigi" width={42} height={42} className="h-10 w-10 object-contain" priority />
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-7 tracking-tight text-gray-950">Govigi</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Admin Panel</p>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isParentActive = isActive(item);
              const isOpen = openMenus[item.name];

              return (
                <div key={item.name} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasSubItems && !isSidebarCollapsed) {
                        toggleMenu(item.name);
                      } else {
                        goTo(item.path);
                      }
                    }}
                    className={`group flex h-11 w-full items-center rounded-lg px-3 transition-all ${
                      isSidebarCollapsed ? "justify-center" : "justify-between"
                    } ${
                      isParentActive || pathname === item.path
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 shrink-0 ${isParentActive || pathname === item.path ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                      {!isSidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                    </div>

                    {!isSidebarCollapsed && hasSubItems && (
                      <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    )}
                  </button>

                  {/* SUBMENU ITEMS */}
                  {!isSidebarCollapsed && hasSubItems && isOpen && (
                    <div className="mt-1 ml-4 border-l border-gray-100 pl-4 space-y-1">
                      {item.subItems!.map((sub) => (
                        <button
                          key={sub.name}
                          onClick={() => goTo(sub.path)}
                          className={`block w-full rounded-md py-2 px-3 text-left text-sm transition-colors ${
                            pathname === sub.path
                              ? "font-semibold text-emerald-600"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}