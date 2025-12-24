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

import Providers from "../components/Providers";

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
        <Providers>
            <LoadingProvider>
                <UIProvider>
                    <GlobalLoader />
                    <GlobalModal />
                    <GlobalToast />
                    <SidePanelProvider>
                        <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible">
                            {/* Sidebar Wrapper: 'contents' keeps it as Flex child on screen, 'print:hidden' removes it on print */}
                            <div className="contents print:hidden">
                                {isClient && showLayout && pathname !== "/login" && <Sidebar />}
                            </div>

                            <div className={`flex-1 flex flex-col ${pathname !== "/login" ? "ml-0 md:ml-64 print:ml-0" : ""}`}>
                                {isClient && showLayout && pathname !== "/login" && (
                                    <div className="fixed top-0 left-0 md:left-64 right-0 z-20 print:hidden">
                                        <TopBar />
                                    </div>
                                )}
                                <main className={`flex-1 overflow-y-auto print:overflow-visible print:h-auto ${pathname !== "/login" ? "mt-16 print:mt-0" : ""}`}>{children}</main>
                            </div>

                            {/* Global side panel - hidden on print */}
                            <div className="print:hidden">
                                <SidePanel />
                            </div>
                        </div>
                    </SidePanelProvider>
                </UIProvider>
            </LoadingProvider>
        </Providers>
    );
}