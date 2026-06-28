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
import { GooeyToaster, gooeyToast } from "goey-toast";
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

import axios from "axios";

// Helper to validate JWT token expiration client-side
const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return false;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(window.atob(base64));
        const now = Math.floor(Date.now() / 1000);
        return !!(decoded.exp && decoded.exp > now);
    } catch (e) {
        return false;
    }
};

// ponytail: Decode role and permissions from JWT payload
const getRoleDetails = (token: string | null) => {
    if (!token) return { role: "", permissions: [] };
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return { role: "", permissions: [] };
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(window.atob(base64));
        return {
            role: decoded.role || "",
            permissions: decoded.permissions || []
        };
    } catch (e) {
        return { role: "", permissions: [] };
    }
};

// ponytail: Map route prefixes to module keys and verify 'read' action
const hasPermissionForPath = (pathname: string, role: string, permissions: string[]): boolean => {
    if (role === 'superadmin') return true;
    if (pathname === '/login' || pathname === '/login/') return true;

    const path = pathname.toLowerCase();
    let module = "";

    if (path.startsWith("/dashboard")) module = "dashboard";
    else if (path.startsWith("/ordersummary") || path.startsWith("/order-assignment") || path.startsWith("/orders")) module = "orders";
    else if (path.startsWith("/product-management") || path.startsWith("/categories") || path.startsWith("/subcategories") || path.startsWith("/product-requests")) module = "products";
    else if (path.startsWith("/vendors") || path.startsWith("/vendor-requests")) module = "vendors";
    else if (path.startsWith("/customers-dashboard")) module = "users";
    else if (path.startsWith("/drivers")) module = "drivers";
    else if (path.startsWith("/scheduling") || path.startsWith("/geofencing")) module = "operations";
    else if (path.startsWith("/finance")) module = "payments";
    else if (path.startsWith("/marketing")) module = "marketing";
    else if (path.startsWith("/media")) module = "media";
    else if (path.startsWith("/settings")) module = "settings";

    if (!module) return true; // fallback for unmapped custom screens

    return permissions.includes(`${module}:read`);
};

// ponytail: Resolve default route safely based on granted permissions to prevent redirect loops
const getDefaultPathForUser = (role: string, permissions: string[]): string => {
    if (role === 'superadmin' || permissions.includes('orders:read')) return "/Ordersummary";
    
    if (permissions.includes('dashboard:read')) return "/Dashboard";
    if (permissions.includes('vendors:read')) return "/vendors";
    if (permissions.includes('products:read')) return "/product-management";
    if (permissions.includes('users:read')) return "/customers-dashboard";
    if (permissions.includes('drivers:read')) return "/drivers";
    if (permissions.includes('operations:read')) return "/scheduling";
    if (permissions.includes('payments:read')) return "/finance/payments";
    if (permissions.includes('marketing:read')) return "/marketing/banners";
    if (permissions.includes('media:read')) return "/media/gallery";
    if (permissions.includes('reports:read')) return "/Ordersummary/stockReport";
    if (permissions.includes('settings:read')) return "/settings";
    
    return "/login"; // logout fallback
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);
    const [showLayout, setShowLayout] = useState(true);

    // 1. Axios 401 & Request Interceptor + Periodic Expiry Check
    useEffect(() => {
        setIsClient(true);

        // Global Axios interceptor to add authorization header
        const reqInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("admin_token");
                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Global Axios interceptor to catch backend 401 responses
        const resInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("admin_token");
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }
        );

        // Periodic check every 10 minutes to catch idle expiration
        const interval = setInterval(() => {
            const token = localStorage.getItem("admin_token");
            if (token && !isTokenValid(token)) {
                localStorage.removeItem("admin_token");
                router.push("/login");
            }
        }, 600000);

        return () => {
            axios.interceptors.request.eject(reqInterceptor);
            axios.interceptors.response.eject(resInterceptor);
            clearInterval(interval);
        };
    }, [router]);

    // 2. Navigation & Page Load Expiry Check & RBAC Guard
    useEffect(() => {
        if (!isClient) return;

        const token = localStorage.getItem("admin_token");
        const hasValidToken = isTokenValid(token);

        if (!hasValidToken && token) {
            localStorage.removeItem("admin_token");
        }

        if (!hasValidToken && pathname !== "/login") {
            setShowLayout(false);
            router.push("/login");
        } else if (hasValidToken) {
            const { role, permissions } = getRoleDetails(token);
            
            if (pathname === "/login") {
                setShowLayout(false);
                router.push(getDefaultPathForUser(role, permissions));
            } else if (!hasPermissionForPath(pathname, role, permissions)) {
                gooeyToast.error("Access Denied: You do not have permission to view this page.");
                router.push(getDefaultPathForUser(role, permissions));
            } else {
                setShowLayout(true);
            }
        } else {
            setShowLayout(true);
        }
    }, [pathname, router, isClient]);

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
