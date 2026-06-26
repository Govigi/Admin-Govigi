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
  MapIcon,
  MegaphoneIcon,
  PhotoIcon,
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
      { name: "Pending Orders", path: "/orders/pending" },
      { name: "Delivered Orders", path: "/orders/delivered" },
    ],
  },
  {
    name: "Products",
    path: "/product-management",
    icon: CubeIcon,
    subItems: [
      { name: "Manage Products", path: "/product-management" },
      { name: "Categories", path: "/Categories" },
      { name: "Subcategories", path: "/Subcategories" },
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
      { name: "Vendor Performance", path: "/vendors/performance" },
    ],
  },
  {
    name: "Users",
    path: "/customers-dashboard",
    icon: UsersIcon,
    subItems: [
      { name: "Manage Users", path: "/customers-dashboard" },
      { name: "Customer Segments", path: "/customers-dashboard/segments" },
    ],
  },
  { name: "Delivery Partners", path: "/drivers", icon: TruckIcon },
  {
    name: "Operations",
    path: "/scheduling",
    icon: ArrowsRightLeftIcon,
    subItems: [
      { name: "Delivery Slots", path: "/scheduling" },
      { name: "Geofencing", path: "/geofencing" },
    ],
  },
  {
    name: "Payments",
    path: "/finance/payments",
    icon: BanknotesIcon,
    subItems: [
      { name: "Order Payments", path: "/finance/payments" },
      { name: "Vendor Settlements", path: "/finance/settlements" },
    ],
  },
  {
    name: "Marketing",
    path: "/marketing/banners",
    icon: MegaphoneIcon,
    subItems: [
      { name: "App Banners", path: "/marketing/banners" },
      { name: "Push Broadcasts", path: "/marketing/notifications" },
    ],
  },
  { name: "Media Gallery", path: "/media/gallery", icon: PhotoIcon },
  { name: "Reports", path: "/Ordersummary/stockReport", icon: DocumentTextIcon },
  {
    name: "Settings",
    path: "/settings",
    icon: Cog6ToothIcon,
    subItems: [
      { name: "General Settings", path: "/settings" },
      { name: "Payment Settings", path: "/settings/payment" },
      { name: "Delivery Settings", path: "/settings/delivery"},
    ],
  },
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
        <div className={`flex h-16 items-center border-b border-gray-100 px-5 ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <Image src={Logo} alt="Govigi" width={42} height={42} className="h-10 w-10 object-contain" priority />
          {!isSidebarCollapsed && (
            <div className="min-w-0 font-mono">
              <p className="text-xl font-bold leading-7 uppercase tracking-wider text-gray-950">Govigi</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#10b981]">Admin Panel</p>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
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
                    className={`group flex h-11 w-full items-center rounded-md border px-3 transition-all ${
                      isSidebarCollapsed ? "justify-center" : "justify-between"
                    } ${
                      isParentActive || pathname === item.path
                        ? "bg-[#10b981] border-[#10b981] text-white font-bold"
                        : "border-transparent text-gray-700 hover:bg-gray-100 hover:border-gray-200 hover:text-gray-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 shrink-0 transition-colors ${isParentActive || pathname === item.path ? "text-white" : "text-gray-500 group-hover:text-gray-900"}`} />
                      {!isSidebarCollapsed && (
                        <span className="text-[12px] font-semibold tracking-wider font-mono flex items-center gap-2">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {!isSidebarCollapsed && hasSubItems && (
                      <ChevronDownIcon className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 ${isOpen ? "rotate-180" : ""}`} />
                    )}
                  </button>

                  {/* SUBMENU ITEMS */}
                  {!isSidebarCollapsed && hasSubItems && isOpen && (
                    <div className="mt-1 ml-5 border-l border-gray-200 pl-4 space-y-1 bg-emerald-50/60 rounded-md">
                      {item.subItems!.map((sub) => {
                        const isSubActive = pathname === sub.path;
                        return (
                          <button
                            key={sub.name}
                            onClick={() => goTo(sub.path)}
                            className={`block w-full p-3 text-left text-[11px] font-semibold tracking-wider rounded-md transition-colors ${
                              isSubActive
                                ? "text-white bg-emerald-600 font-bold"
                                : "text-gray-600 hover:text-gray-950"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {sub.name}
                            </span>
                          </button>
                        );
                      })}
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