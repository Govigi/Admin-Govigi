"use client";

import React, { useState } from "react";
import { OrderSummaryUrl } from "../../libs/utils/API/endpoints";
import { useRouter } from "next/navigation";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";
import { useUI } from "@/src/libs/Hooks/UIContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { showLoader, hideLoader } = useLoading();
  const { showToast } = useUI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoader("Authenticating...");

    try {
      const res = await fetch(OrderSummaryUrl.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.status === 200 && data.token) {
        localStorage.setItem("admin_token", data.token);
        showToast("Login successful. Redirecting...", "success");
        setTimeout(() => {
          router.push("/Ordersummary");
        }, 500);
      } else {
        showToast(data.message || "Invalid credentials", "error");
      }
    } catch (err) {
      console.error("Login Error:", err);
      showToast("Login failed. Please try again.", "error");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-mono text-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">Govigi</h1>
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Administration Console</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 md:p-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 border-black pl-3 mb-6">
              Authentication
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                className="block w-full border-b-2 border-gray-200 bg-transparent py-3 px-0 text-sm focus:border-black focus:outline-none transition-colors placeholder-gray-300 font-mono text-black"
                placeholder="ENTER EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">
                Password
              </label>
              <input
                type="password"
                className="block w-full border-b-2 border-gray-200 bg-transparent py-3 px-0 text-sm focus:border-black focus:outline-none transition-colors placeholder-gray-300 font-mono text-black"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-10 bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all active:translate-y-0.5 transform"
          >
            Access Dashboard
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase">
            Secure System • Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
