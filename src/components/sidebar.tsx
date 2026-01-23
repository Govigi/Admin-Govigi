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
  ChartBarIcon,
  MegaphoneIcon,
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  LinkIcon,
  BellIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import Logo from "../../public/GoVigiLogo.png";
import { useUI } from "../libs/Hooks/UIContext";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  type: "link" | "menu" | "section";
  name: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path?: string;
  subItems?: { name: string; path: string; badge?: string }[];
  badge?: string; // For things like "Pro" or counts
  badgeColor?: string;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Orders: true,
  });
  const { isMobileMenuOpen, closeMobileMenu, isSidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUI();
  const isCollapsed = isSidebarCollapsed;

  const toggleMenu = (name: string) => {
    // If collapsed, expand the sidebar first
    if (isSidebarCollapsed) {
      setSidebarCollapsed(false);
      setOpenMenus((prev) => ({ ...prev, [name]: true }));
      return;
    }
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navItems: NavItem[] = [
    {
      type: "link",
      name: "Dashboard",
      icon: Squares2X2Icon,
      path: "/Dashboard",
    },
    {
      type: "menu",
      name: "Orders",
      icon: ShoppingBagIcon,
      subItems: [
        { name: "Orders", path: "/orders" },
        { name: "Order Summary", path: "/Ordersummary" },
        { name: "Pending Orders", path: "/orders/pending" },
        { name: "Delivered Orders", path: "/orders/delivered" },
      ],
    },
    {
      type: "menu",
      name: "Products",
      icon: ShoppingBagIcon,
      subItems: [
        { name: "Product Management", path: "/product-management" },
        { name: "Product Requests", path: "/product-requests" },
        { name: "Stock Report", path: "/Ordersummary/stockReport" },
        { name: "Categories", path: "/Categories" },
      ],
    },
    {
      type: "link",
      name: "Customers",
      icon: UserGroupIcon,
      path: "/customers-dashboard",
    },
    {
      type: "menu",
      name: "Analytics",
      icon: ChartBarIcon,
      subItems: [
        { name: "Sales Overview", path: "/analytics/sales" },
        { name: "Revenue Reports", path: "/analytics/revenue" },
      ],
    },
    {
      type: "menu",
      name: "Drivers",
      icon: TruckIcon,
      subItems: [
        { name: "All Drivers", path: "/drivers" },
      ],
    },
    {
      type: "menu",
      name: "Sourcing",
      icon: ClipboardDocumentCheckIcon,
      subItems: [
        { name: "Sourcing Dashboard", path: "/sourcing" },
      ],
    },
    {
      type: "menu",
      name: "Vendors",
      icon: UserGroupIcon,
      subItems: [
        { name: "All Vendors", path: "/vendors" },
      ],
    },
    {
      type: "menu",
      name: "Marketing",
      icon: MegaphoneIcon,
      subItems: [
        { name: "Mobile App Banners", path: "/marketing/banners" },
      ],
    },
    {
      type: "section",
      name: "OPERATIONS",
    },
    {
      type: "link",
      name: "Inventory Alerts",
      icon: BellIcon,
      path: "/inventory-alerts",
      badge: "06",
      badgeColor: "bg-red-500",
    },
    {
      type: "link",
      name: "User Roles & Permissions",
      icon: ShieldCheckIcon,
      path: "/settings/roles",
    },
    {
      type: "link",
      name: "Integrations",
      icon: LinkIcon,
      path: "/settings/integrations",
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      type: "link",
      name: "Add New Product",
      icon: PlusCircleIcon,
      path: "/product-management/new",
    },
    {
      type: "menu",
      name: "Settings",
      icon: Cog6ToothIcon,
      subItems: [
        { name: "General", path: "/settings" },
        { name: "Mobile App", path: "/settings/mobile-app" },
      ],
    },
    {
      type: "link",
      name: "Logout",
      icon: ArrowRightOnRectangleIcon,
      path: "/logout",
    },
  ];

  const renderMenuItem = (item: NavItem) => {
    if (item.type === "section") {
      if (isCollapsed) return <div key={item.name} className="h-4" />; // Spacer when collapsed
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={item.name} className="px-5 py-3 mt-4 mb-1">
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest whitespace-nowrap overflow-hidden">
            {item.name}
          </h3>
        </motion.div>
      );
    }

    const isActive =
      item.type === "link"
        ? pathname === item.path
        : item.subItems?.some((sub) => sub.path === pathname);

    const Icon = item.icon!;

    return (
      <div key={item.name} className="px-3 mb-1">
        <div
          onClick={() => {
            if (item.type === "menu") {
              toggleMenu(item.name);
            } else if (item.path) {
              router.push(item.path);
              closeMobileMenu();
            }
          }}
          className={`group flex items-center w-full px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 select-none
            ${isActive && item.type === "link"
              ? "bg-gray-100 text-gray-900 font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <div className={`flex items-center gap-3 flex-1 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
            <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`} strokeWidth={1.5} />

            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[13px] font-medium truncate"
              >
                {item.name}
              </motion.span>
            )}

            {!isCollapsed && item.badge && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`px-1.5 py-0.5 text-[10px] font-semibold text-white rounded ml-auto ${item.badgeColor || 'bg-gray-500'}`}>
                {item.badge}
              </motion.span>
            )}
          </div>

          {!isCollapsed && item.type === "menu" && (
            <motion.div
              animate={{ rotate: openMenus[item.name] ? 180 : 0 }}
              className="text-gray-400 ml-2">
              <ChevronDownIcon className="h-3 w-3" strokeWidth={2.5} />
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {!isCollapsed && item.type === "menu" && openMenus[item.name] && item.subItems && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-0.5">
                {item.subItems.map((sub) => {
                  const paddingLeft = "pl-11";
                  const subActive = pathname === sub.path;
                  return (
                    <motion.div
                      key={sub.name}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        router.push(sub.path);
                        closeMobileMenu();
                      }}
                      className={`${paddingLeft} pr-3 py-2 cursor-pointer rounded-lg text-[13px] transition-colors
                        ${subActive
                          ? "text-emerald-700 font-medium bg-emerald-50"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{sub.name}</span>
                        {sub.badge && <span className="bg-gray-200 text-gray-600 rounded-full px-1.5 text-[10px]">{sub.badge}</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-white fixed top-0 left-0 border-r border-gray-200 flex flex-col z-50 h-screen font-sans shadow-sm
        md:translate-x-0 transition-transform duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:transform-none"}`}
      >
        <div className={`flex items-center h-16 border-b border-gray-100 shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Image src={Logo} alt="GoVigi Logo" width={32} height={32} className="object-contain shrink-0" priority />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-lg tracking-tight text-gray-900 whitespace-nowrap">
                GoVigi
              </motion.span>
            )}
          </div>

          {!isCollapsed && (
            <div onClick={toggleSidebar} className="cursor-pointer text-gray-400 hover:text-gray-600">
              <ChevronLeftIcon className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Collapse toggle when collapsed */}
        {isCollapsed && (
          <div
            onClick={toggleSidebar}
            className="w-full flex justify-center py-2 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-b border-gray-100">
            <ChevronRightIcon className="h-4 w-4" />
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-0 scrollbar-thin scrollbar-thumb-gray-200 overflow-x-hidden">
          {navItems.map(renderMenuItem)}

          <div className="mt-6 mb-4 px-3 border-t border-gray-100 pt-4">
            {bottomNavItems.map(renderMenuItem)}
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className={`border-t border-gray-100 bg-gray-50/50 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="h-9 w-9 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 shrink-0">
              <span className="text-xs font-semibold text-gray-600">AD</span>
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@govigi.com</p>
              </motion.div>
            )}
            {!isCollapsed && <ChevronDownIcon className="h-4 w-4 text-gray-400 shrink-0" />}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
