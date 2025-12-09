import React from "react";
import {
    ShoppingBagIcon,
    ClockIcon,
    CheckCircleIcon,
    TagIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";

interface DashboardStatsProps {
    orders: any[];
    products: any[];
}

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: any;
    iconColor: string;
    iconBg: string;
}

const StatCard = ({ title, value, trend, trendUp, icon: Icon, iconColor, iconBg }: StatCardProps) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
        <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
            <div className={`p-2 rounded-lg ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center mt-2 gap-1 text-xs font-medium">
                {trendUp ? (
                    <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                ) : (
                    <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
                )}
                <span className={trendUp ? "text-green-500" : "text-red-500"}>{trend}</span>
                <span className="text-gray-400 font-normal">than yesterday</span>
            </div>
        </div>
    </div>
);

export default function DashboardStats({ orders, products }: DashboardStatsProps) {
    // 1. Calculate Dynamic Stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => ["pending", "processing"].includes((o.status || "").toLowerCase())).length;
    const completedOrders = orders.filter(o => ["delivered", "completed"].includes((o.status || "").toLowerCase())).length;
    const totalProducts = products.length;

    // 2. Trend Calculations (Mock for now, as historical data might be complex on frontend)
    // In production, backend would provide "growth" or "delta"

    const stats = [
        {
            title: "Total Order",
            value: totalOrders.toString(),
            trend: "0.1%",
            trendUp: true,
            icon: ShoppingBagIcon,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50"
        },
        {
            title: "Total Pending Order",
            value: pendingOrders.toString(),
            trend: "Needs Attention",
            trendUp: false,
            icon: ClockIcon,
            iconColor: "text-orange-600",
            iconBg: "bg-orange-50"
        },
        {
            title: "Total Completed Order",
            value: completedOrders.toString(),
            trend: "Great Job!",
            trendUp: true,
            icon: CheckCircleIcon,
            iconColor: "text-[#10b981]", // Emerald Green
            iconBg: "bg-emerald-50"
        },
        {
            title: "Total Product",
            value: totalProducts.toString(),
            trend: "active items",
            trendUp: true,
            icon: TagIcon,
            iconColor: "text-purple-600",
            iconBg: "bg-purple-50"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
            ))}
        </div>
    );
}
