"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "../components/Topbar";
import Sidebar from "../components/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col h-screen">
          {/* Hide sidebar/topbar on login page */}
          {isClient && showLayout && pathname !== "/login" && <TopBar />}
          <div className="flex flex-1">
            {isClient && showLayout && pathname !== "/login" && (
              <div className="w-50">
                <Sidebar />
              </div>
            )}
            <main className="flex-1 p-6 overflow-auto bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
