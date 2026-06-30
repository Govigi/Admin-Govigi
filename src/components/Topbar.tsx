"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Modal Fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("ALL FIELDS ARE REQUIRED.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("NEW PASSWORDS DO NOT MATCH.");
      return;
    }

    if (newPassword.length < 5) {
      setErrorMsg("PASSWORD MUST BE AT LEAST 5 CHARACTERS.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      await axios.put(
        AdminUrl.changePassword,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert("Password updated successfully!");
      // Reset & close
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "FAILED TO CHANGE PASSWORD.");
    } finally {
      setSubmitting(false);
    }
  };

  const { toggleMobileMenu, toggleSidebar } = useUI();

  return (
    <>
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
              onClick={toggleSidebar}
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
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-1 shadow-lg font-mono">
                  <button
                    onClick={() => {
                      setShowPasswordModal(true);
                      setShowPopup(false);
                      setErrorMsg("");
                    }}
                    className="block w-full rounded-md px-4 py-2 text-left text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50 font-bold"
                  >
                    Change Password
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-md px-4 py-2 text-left text-xs uppercase tracking-wider text-red-600 hover:bg-red-50 font-bold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm p-4 font-mono">
          <div className="w-full max-w-md border-2 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#10b981]">Update Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-black text-xs font-bold font-mono"
              >
                [CLOSE]
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] p-3 uppercase font-bold tracking-wider">
                  Error: {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Current Password</label>
                <div className="flex items-center border-b border-gray-300 focus-within:border-black transition-colors">
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full bg-transparent py-2 px-0 text-sm focus:ring-0 focus:outline-none placeholder-gray-300 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="text-gray-400 hover:text-black text-[10px] font-bold tracking-widest px-2 uppercase font-mono"
                  >
                    {showCurrent ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">New Password</label>
                <div className="flex items-center border-b border-gray-300 focus-within:border-black transition-colors">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full bg-transparent py-2 px-0 text-sm focus:ring-0 focus:outline-none placeholder-gray-300 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="text-gray-400 hover:text-black text-[10px] font-bold tracking-widest px-2 uppercase font-mono"
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Confirm New Password</label>
                <div className="flex items-center border-b border-gray-300 focus-within:border-black transition-colors">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full bg-transparent py-2 px-0 text-sm focus:ring-0 focus:outline-none placeholder-gray-300 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-gray-400 hover:text-black text-[10px] font-bold tracking-widest px-2 uppercase font-mono"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="border border-gray-200 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-black transition-all text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-black text-white px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#10b981] disabled:opacity-50 transition-all shadow-[3px_3px_0px_0px_rgba(16,185,129,0.3)] hover:shadow-none"
                >
                  {submitting ? "SUBMITTING..." : "CONFIRM UPDATE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
