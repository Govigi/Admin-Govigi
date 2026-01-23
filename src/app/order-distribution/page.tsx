"use client";

import React, { useState, useEffect } from "react";
import DistributionStats from "../../components/OrderDistribution/DistributionStats";
import OrdersTable from "../../components/OrderDistribution/OrdersTable";
import { OrderSummaryUrl, VendorUrl, CategoryManagementUrl } from "../../libs/utils/API/endpoints";

interface Order {
    id: string;
    orderRef: string;
    customer: string;
    location: string;
    distance: string;
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
    distance: string;
    status: "assigned" | "in_progress" | "pending";
    reliability?: string;
}

interface Vendor {
    _id: string;
    name: string;
    distance?: number;
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

const getCategoryColor = (categoryName: string): string => {
    const colors: Record<string, string> = {
        "vegetables": "text-green-600", "veggies": "text-green-600",
        "fruits": "text-orange-500",
        "meat": "text-red-600", "poultry": "text-red-600",
        "dairy": "text-blue-400",
        "bakery": "text-amber-600",
        "beverages": "text-brown-500",
    };
    const key = categoryName.toLowerCase();
    return colors[key] || "text-gray-500";
};

export default function OrderDistributionPage() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [orders, setOrders] = useState<Order[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
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
                setVendors(vendorsData);
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

                const categoryDetails: CategoryItem[] = categoryNames.map(catName => {
                    const catItems = categoryMap[catName];
                    const itemsText = catItems.map((i: any) =>
                        `${i.name || i.productName} (${i.quantityKg || i.quantity || 1}${i.unit || 'kg'})`
                    ).join(", ");

                    const randomVendor = vendorsData.length > 0
                        ? vendorsData[Math.floor(Math.random() * vendorsData.length)]
                        : null;

                    return {
                        name: catName,
                        icon: getCategoryIcon(catName),
                        items: itemsText,
                        vendor: randomVendor?.name || "No vendor available",
                        distance: `${(Math.random() * 5 + 0.5).toFixed(1)}km away`,
                        status: "pending" as const,
                        reliability: Math.random() > 0.5 ? "High Reliability" : "Recommended"
                    };
                });

                const vendorAvatars = categoryNames.slice(0, 4).map((cat, idx) => ({
                    letter: cat.charAt(0).toUpperCase(),
                    color: categoryColors[idx % categoryColors.length]
                }));

                return {
                    id: order._id,
                    orderRef: `#ORD-${order._id?.slice(-4).toUpperCase() || "0000"}`,
                    customer: order.customerId?.customerName || order.name || "Customer",
                    location: order.deliveryAddress?.area || order.deliveryAddress?.city || "Location",
                    distance: `${(Math.random() * 10 + 1).toFixed(1)}km away`,
                    categories: displayCategories,
                    moreCount,
                    assignedCount: 0,
                    totalCount: categoryNames.length,
                    vendorAvatars,
                    categoryDetails
                };
            });

            setOrders(processedOrders);

            let totalCategories = 0;
            processedOrders.forEach(o => totalCategories += o.totalCount);

            setStats({
                pendingCategories: totalCategories,
                fullyAssigned: processedOrders.filter(o => o.assignedCount === o.totalCount && o.totalCount > 0).length,
                vendorLoad: vendorsData.length > 0 ? Math.min(Math.round((processedOrders.length / vendorsData.length) * 20), 100) : 0,
                distEfficiency: processedOrders.length > 0 ?
                    parseFloat((processedOrders.reduce((sum, o) => sum + parseFloat(o.distance), 0) / processedOrders.length).toFixed(1)) : 0
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
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 border border-[#E5E7EB] hover:border-[#0047FF] text-[#111827] px-5 py-2.5 text-sm font-bold tracking-tight rounded-[10px] transition-all bg-white">
                            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                            Smart Assign
                        </button>
                        <button className="flex items-center gap-2 bg-[#0047FF] text-white px-5 py-2.5 text-sm font-bold tracking-tight rounded-[10px] hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
                            <span className="material-symbols-outlined text-[20px]">done_all</span>
                            Confirm All
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <DistributionStats stats={stats} />
                <OrdersTable orders={orders} loading={loading} onRefresh={fetchData} />
            </div>

            <footer className="px-8 py-4 bg-white border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Showing 1-10 of {orders.length} orders</p>
                <div className="flex gap-1.5">
                    <button className="px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] text-xs font-bold rounded-[10px] transition-all">Previous</button>
                    <button className="px-3 py-1.5 bg-[#0047FF] text-white text-xs font-bold rounded-[10px] shadow-sm">1</button>
                    <button className="px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] text-xs font-bold rounded-[10px] transition-all">2</button>
                    <button className="px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] text-xs font-bold rounded-[10px] transition-all">3</button>
                    <button className="px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] text-xs font-bold rounded-[10px] transition-all">Next</button>
                </div>
            </footer>
        </div>
    );
}
