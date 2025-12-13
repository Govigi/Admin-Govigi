import React from "react";

interface KPIStatsProps {
    orders: any[];
}

export default function KPIStats({ orders }: KPIStatsProps) {
    const totalOrders = orders.length;
    const totalItems = orders.reduce((acc, order) => {
        const items = order.products || order.items || [];
        return acc + items.reduce((sum: number, item: any) => sum + (item.quantity || item.qty || 1), 0);
    }, 0);

    const pendingPacking = orders.filter((o) =>
        ["pending", "processing"].includes(o.status?.toLowerCase())
    ).length;

    const readyForDispatch = orders.filter((o) =>
        ["packed", "ready", "delivered"].includes(o.status?.toLowerCase())
    ).length;

    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const stats = [
        { label: "ORDERS", value: totalOrders },
        { label: "ITEMS", value: totalItems },
        { label: "PENDING", value: pendingPacking },
        { label: "COMPLETED", value: readyForDispatch },
        { label: "REVENUE", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
    ];

    return (
        <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8 py-4 border-b border-gray-200 mb-6 font-mono">
            {stats.map((stat, index) => (
                <div key={index} className="flex-shrink-0 p-2 md:p-0 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none border md:border-none border-gray-100">
                    <div className="text-[10px] md:text-xs text-gray-400 tracking-widest uppercase">{stat.label}</div>
                    <div className="text-lg md:text-xl font-bold text-gray-900 mt-0.5 truncate">{stat.value}</div>
                </div>
            ))}
        </div>
    );
}
