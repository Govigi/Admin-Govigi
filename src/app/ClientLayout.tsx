"use client";

import React from "react";
import { Inter, Geist_Mono } from "next/font/google";
import TopBar from "../components/Topbar";
import Sidebar from "../components/sidebar";
import { SidePanelProvider } from "../libs/Hooks/sidePanelContext";
import SidePanel from "../components/Global/SidePanel";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GlobalLoader from "../components/Global/GlobalLoader";
import { LoadingProvider } from "@/src/libs/Hooks/LoadingContext";
import { UIProvider, useUI } from "@/src/libs/Hooks/UIContext";
import GlobalModal from "../components/Global/GlobalModal";
import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";

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
                    <GooeyToaster position="top-right" />
                    <SidePanelProvider>
                        <LayoutContent isClient={isClient} showLayout={showLayout} pathname={pathname}>
                            {children}
                        </LayoutContent>
                    </SidePanelProvider>
                </UIProvider>
            </LoadingProvider>
        </Providers>
    );
}

function LayoutContent({ isClient, showLayout, pathname, children }: { isClient: boolean, showLayout: boolean, pathname: string, children: React.ReactNode }) {
    const { isSidebarCollapsed } = useUI();
    const shouldShowShell = isClient && showLayout && pathname !== "/login";

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible">
            <div className="contents print:hidden">
                {shouldShowShell && <Sidebar />}
            </div>

            <div className={`flex-1 flex flex-col transition-all duration-300 ${pathname !== "/login" ? (isSidebarCollapsed ? "ml-0 md:ml-20 print:ml-0" : "ml-0 md:ml-64 print:ml-0") : ""}`}>
                {shouldShowShell && <TopBar />}
                <main className={`flex-1 overflow-y-auto print:overflow-visible print:h-auto ${pathname !== "/login" ? "print:mt-0" : ""}`}>{children}</main>
            </div>
            <div className="print:hidden">
                <SidePanel />
            </div>
        </div>
    );
}
