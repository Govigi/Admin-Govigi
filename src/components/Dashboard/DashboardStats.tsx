import React from "react";
import {
    ShoppingBagIcon,
    ClockIcon,
    CheckCircleIcon,
    CurrencyRupeeIcon,
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
    color: string;
}

const StatCard = ({ title, value, trend, trendUp, icon: Icon, color }: StatCardProps) => (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300 border border-gray-50 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform"></div>
        
        <div className="flex justify-between items-start z-10">
            <div>
                <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2 tracking-tight">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>

        <div className="mt-4 flex items-center gap-2 z-10">
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {trendUp ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                {trend}
            </span>
            <span className="text-gray-400 text-xs">vs last week</span>
        </div>
    </div>
);

export default function DashboardStats({ orders, products }: DashboardStatsProps) {
    // 1. Calculate Dynamic Stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => ["pending", "processing"].includes((o.status || "").toLowerCase())).length;
    const completedOrders = orders.filter(o => ["delivered", "completed"].includes((o.status || "").toLowerCase())).length;
    
    // Calculate Revenue
    const totalRevenue = orders.reduce((acc, order) => acc + (Number(order.totalAmount) || 0), 0);
    const formattedRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue);

    // Dynamic Trend (Mock calculation vs "last week" logic if possible, else static positive)
    // For now, let's assume business is growing >:)

    const stats = [
        {
            title: "Total Revenue",
            value: formattedRevenue,
            trend: "12.5%",
            trendUp: true,
            icon: CurrencyRupeeIcon,
            color: "bg-[#10b981]", // Brand Green
        },
        {
            title: "Total Orders",
            value: totalOrders.toString(),
            trend: "8.2%",
            trendUp: true,
            icon: ShoppingBagIcon,
            color: "bg-blue-500",
        },
        {
            title: "Pending Orders",
            value: pendingOrders.toString(),
            trend: "2.1%",
            trendUp: false, // Pending increasing is 'bad' in some contexts, or 'good' demand. Let's say bad (needs action).
            icon: ClockIcon,
            color: "bg-orange-500",
        },
        {
            title: "Completed Orders",
            value: completedOrders.toString(),
            trend: "5.4%",
            trendUp: true,
            icon: CheckCircleIcon,
            color: "bg-purple-500",
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat}
                 />
            ))}
        </div>
    );
}
