"use client";

import React, { useState, useEffect } from "react";
import DistributionStats from "../../components/OrderDistribution/DistributionStats";
import OrdersTable from "../../components/OrderDistribution/OrdersTable";
import { OrderSummaryUrl, VendorUrl } from "../../libs/utils/API/endpoints";

interface Order {
    id: string;
    orderRef: string;
    customer: string;
    location: string;
    categories: string[];
    moreCount: number;
    assignedCount: number;
    totalCount: number;
    vendorAvatars: { letter: string; color: string }[];
    categoryDetails: CategoryItem[];
}

interface CategoryItem {
    name: string;
    icon: string;
    items: string;
    vendor: string;
    vendorId: string;
    status: "assigned" | "in_progress" | "pending";
}

interface Vendor {
    _id: string;
    name: string;
    businessName: string;
    supportedCategories?: string[];
    address?: { formattedAddress: string };
}

const getCategoryIcon = (categoryName: string): string => {
    const icons: Record<string, string> = {
        "vegetables": "eco", "veggies": "eco",
        "fruits": "nutrition",
        "meat": "kebab_dining", "poultry": "kebab_dining",
        "dairy": "water_drop",
        "bakery": "bakery_dining",
        "beverages": "local_cafe",
        "snacks": "cookie",
        "groceries": "shopping_basket",
        "seafood": "set_meal",
    };
    const key = categoryName.toLowerCase();
    return icons[key] || "inventory_2";
};

export default function OrderDistributionPage() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingCategories: 0,
        fullyAssigned: 0,
        vendorLoad: 0,
        distEfficiency: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft({ hours, minutes, seconds });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            const [ordersRes, vendorsRes] = await Promise.all([
                fetch(OrderSummaryUrl.getOrderDetails, { headers }),
                fetch(VendorUrl.getAllVendors, { headers })
            ]);

            let ordersData: any[] = [];
            let vendorsData: Vendor[] = [];

            if (ordersRes.ok) ordersData = await ordersRes.json();
            if (vendorsRes.ok) {
                vendorsData = await vendorsRes.json();
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayOrders = ordersData.filter((order: any) => {
                const orderDate = new Date(order.scheduledDate || order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            });

            const categoryColors = ["bg-green-500", "bg-amber-500", "bg-red-500", "bg-blue-400"];

            const processedOrders: Order[] = todayOrders.map((order: any) => {
                const items = order.items || [];
                const categoryMap: Record<string, any[]> = {};

                items.forEach((item: any) => {
                    const catName = item.category || item.categoryName || "Other";
                    if (!categoryMap[catName]) categoryMap[catName] = [];
                    categoryMap[catName].push(item);
                });

                const categoryNames = Object.keys(categoryMap);
                const displayCategories = categoryNames.slice(0, 2).map(c => c.toUpperCase());
                const moreCount = categoryNames.length > 2 ? categoryNames.length - 2 : 0;

                // Determine assignment status from real data
                const isAssigned = (order.sourcingStatus && order.sourcingStatus !== "Pending") || !!order.vendorId;
                const assignedVendor = order.vendorId
                    ? vendorsData.find(v => v._id === order.vendorId)
                    : null;

                const categoryDetails: CategoryItem[] = categoryNames.map(catName => {
                    const catItems = categoryMap[catName];
                    const itemsText = catItems.map((i: any) =>
                        `${i.name || i.productName} (${i.quantityKg || i.quantity || 1}${i.unit || 'kg'})`
                    ).join(", ");

                    // Find a vendor that supports this category
                    const matchingVendor = vendorsData.find(v =>
                        v.supportedCategories?.some(c => c.toLowerCase() === catName.toLowerCase())
                    );

                    const vendorForCategory = assignedVendor || matchingVendor;

                    return {
                        name: catName,
                        icon: getCategoryIcon(catName),
                        items: itemsText,
                        vendor: vendorForCategory?.businessName || vendorForCategory?.name || "No vendor available",
                        vendorId: vendorForCategory?._id || "",
                        status: isAssigned ? "assigned" : "pending"
                    };
                });

                const assignedCount = isAssigned ? categoryNames.length : 0;

                const vendorAvatars = categoryNames.slice(0, 4).map((cat, idx) => ({
                    letter: cat.charAt(0).toUpperCase(),
                    color: categoryColors[idx % categoryColors.length]
                }));

                return {
                    id: order._id,
                    orderRef: `#ORD-${order._id?.slice(-4).toUpperCase() || "0000"}`,
                    customer: order.customerId?.customerName || order.name || "Customer",
                    location: order.deliveryAddress?.area || order.deliveryAddress?.city || "Location",
                    categories: displayCategories,
                    moreCount,
                    assignedCount,
                    totalCount: categoryNames.length,
                    vendorAvatars,
                    categoryDetails
                };
            });

            setOrders(processedOrders);

            let totalCategories = 0;
            processedOrders.forEach(o => totalCategories += o.totalCount);

            setStats({
                pendingCategories: processedOrders.filter(o => o.assignedCount < o.totalCount)
                    .reduce((sum, o) => sum + (o.totalCount - o.assignedCount), 0),
                fullyAssigned: processedOrders.filter(o => o.assignedCount === o.totalCount && o.totalCount > 0).length,
                vendorLoad: vendorsData.length > 0
                    ? Math.min(Math.round((processedOrders.length / vendorsData.length) * 20), 100)
                    : 0,
                distEfficiency: processedOrders.length > 0
                    ? Math.round((processedOrders.filter(o => o.assignedCount > 0).length / processedOrders.length) * 100)
                    : 0
            });

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (num: number) => String(num).padStart(2, "0");

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#FDFDFF]">
            <header className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-8 py-5 shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-[#111827] text-2xl font-extrabold tracking-tight">Order Distribution</h2>
                    <p className="text-[#6B7280] text-[11px] font-bold uppercase tracking-widest mt-0.5">Multi-Vendor Category Assignment</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 border border-[#E5E7EB] px-4 py-2 rounded-[10px] bg-gray-50/50">
                        <span className="text-[#6B7280] text-[10px] font-extrabold uppercase tracking-tighter">Midnight Cut-off:</span>
                        <div className="flex gap-1.5 items-center">
                            <span className="text-[#111827] font-mono font-bold text-lg">{formatTime(timeLeft.hours)}</span>
                            <span className="text-[#6B7280] font-mono">:</span>
                            <span className="text-[#111827] font-mono font-bold text-lg">{formatTime(timeLeft.minutes)}</span>
                            <span className="text-[#6B7280] font-mono">:</span>
                            <span className="text-[#0047FF] font-mono font-bold text-lg">{formatTime(timeLeft.seconds)}</span>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 border border-[#E5E7EB] hover:border-[#0047FF] text-[#111827] px-5 py-2.5 text-sm font-bold tracking-tight rounded-[10px] transition-all bg-white"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                        Refresh
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <DistributionStats stats={stats} />
                <OrdersTable orders={orders} loading={loading} onRefresh={fetchData} />
            </div>

            <footer className="px-8 py-4 bg-white border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Showing {orders.length} orders for today</p>
            </footer>
        </div>
    );
}
