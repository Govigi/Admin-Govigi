"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cog6ToothIcon,
  BellIcon,
  InformationCircleIcon,
  UserIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

import Breadcrumbs from "./Global/Breadcrumbs";
import { useUI } from "../libs/Hooks/UIContext";

export default function TopBar() {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<any>(null);
  const router = useRouter();

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
    <header className="relative h-16 border-b border-gray-200 bg-white px-4 md:px-6 py-4 text-gray-800 flex items-center justify-between">
      {/* Left Side: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-0 overflow-hidden">
        {/* Hamburger Menu (Mobile Only) */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-1 text-gray-500 hover:text-gray-700"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="overflow-hidden">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right Side: Icons */}
      <div className="flex items-center justify-end gap-3 md:gap-7 md:mr-12 shrink-0">
        <button
          aria-label="Settings"
          className="hover:text-blue-600 transition-colors hidden md:block" // Hidden on small mobile to save space if needed, or keep
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </button>

        <button
          aria-label="Notifications"
          className="hover:text-blue-600 transition-colors"
        >
          <BellIcon className="h-6 w-6" />
        </button>

        <button
          aria-label="Information"
          className="hover:text-blue-600 transition-colors hidden md:block"
        >
          <InformationCircleIcon className="h-6 w-6" />
        </button>

        <div className="relative" ref={popupRef}>
          <button
            aria-label="User menu"
            className="cursor-pointer text-green-600 hover:text-green-700 transition-colors"
            onClick={() => setShowPopup((v) => !v)}
          >
            <UserIcon className="h-6 w-6" />
          </button>

          {showPopup && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header >
  );
}
