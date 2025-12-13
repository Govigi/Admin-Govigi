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
import { UIProvider } from "@/src/libs/Hooks/UIContext";
import GlobalModal from "../components/Global/GlobalModal";
import GlobalToast from "../components/Global/GlobalToast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          <UIProvider>
            <GlobalLoader />
            <GlobalModal />
            <GlobalToast />
            <SidePanelProvider>
              <div className="flex h-screen bg-gray-50 overflow-hidden">
                {isClient && showLayout && pathname !== "/login" && <Sidebar />}
                <div className={`flex-1 flex flex-col ${pathname !== "/login" ? "ml-0 md:ml-64" : ""}`}>
                  {isClient && showLayout && pathname !== "/login" && (
                    <div className="fixed top-0 left-0 md:left-64 right-0 z-20">
                      <TopBar />
                    </div>
                  )}
                  <main className={`flex-1 overflow-y-auto ${pathname !== "/login" ? "mt-16" : ""}`}>{children}</main>
                </div>
                {/* Global side panel */}
                <SidePanel />
              </div>
            </SidePanelProvider>
          </UIProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
