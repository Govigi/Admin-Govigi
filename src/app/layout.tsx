"use client";

import React from "react";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "../components/Topbar";
import Sidebar from "../components/sidebar";
import { SidePanelProvider } from "../libs/Hooks/sidePanelContext";
import SidePanel from "../components/Global/SidePanel";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GlobalLoader from "../components/Global/GlobalLoader";
import { LoadingProvider } from "@/src/libs/Hooks/LoadingContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [showLayout, setShowLayout] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("admin_token");
    if (!token && pathname !== "/login") {
      setShowLayout(false);
      router.push("/login");
    } else if (token && pathname === "/login") {
      setShowLayout(false);
      router.push("/Ordersummary");
    } else {
      setShowLayout(true);
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body className={`${inter.className} ${geistMono.variable} antialiased`}>
        <LoadingProvider>
          <GlobalLoader />
          <SidePanelProvider>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
              {isClient && showLayout && pathname !== "/login" && <Sidebar />}
              <div className="flex-1 flex flex-col ml-64">
                {isClient && showLayout && pathname !== "/login" && (
                  <div className="fixed top-0 left-64 right-0 z-20">
                    <TopBar />
                  </div>
                )}
                <main className="flex-1 mt-16 overflow-y-auto">{children}</main>
              </div>
              {/* Global side panel */}
              <SidePanel />
            </div>
          </SidePanelProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
