"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BellIcon,
  UserIcon,
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { useUI } from "../libs/Hooks/UIContext";

export default function TopBar() {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchPlaceholder = pathname.startsWith("/product-management")
    ? "Search by product name, category, vendor..."
    : "Search anything...";

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (popupRef.current && !popupRef.current?.contains(event.target)) {
        setShowPopup(false);
      }
    }

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setShowPopup(false);
    router.push("/login");
  };

  const { toggleMobileMenu } = useUI();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white/95 px-4 text-gray-900 backdrop-blur md:px-8">
      <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-4">
        <button
          onClick={toggleMobileMenu}
          aria-label="Open navigation"
          className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="hidden md:block">
          <button
            aria-label="Toggle menu"
            className="rounded-md p-2 text-gray-900 transition hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        <label className="relative mx-auto hidden w-full max-w-[520px] sm:block">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50/70 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <div className="flex items-center justify-end gap-4">
          <button
            aria-label="Notifications"
            className="relative rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
          >
            <BellIcon className="h-6 w-6" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

        <div className="relative" ref={popupRef}>
          <button
            aria-label="User menu"
              className="flex items-center gap-3 rounded-lg px-1 py-1 transition hover:bg-gray-50"
            onClick={() => setShowPopup((v) => !v)}
          >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-emerald-50 text-emerald-700">
                <UserIcon className="h-5 w-5" />
              </span>
              <span className="hidden text-left md:block">
                <span className="block text-sm font-semibold leading-5 text-gray-900">Admin</span>
                <span className="block text-xs text-gray-500">Super Admin</span>
              </span>
              <ChevronDownIcon className="hidden h-4 w-4 text-gray-500 md:block" />
          </button>

          {showPopup && (
              <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
              <button
                onClick={handleLogout}
                  className="block w-full rounded-md px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
