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
        ["pending", "processing", "order placed"].includes(o.status?.toLowerCase())
    ).length;

    const readyForDispatch = orders.filter((o) =>
        ["packed", "ready", "delivered", "completed", "shipped", "out for delivery"].includes(o.status?.toLowerCase())
    ).length;

    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const stats = [
        { label: "ORDERS PLACED", value: totalOrders },
        { label: "TOTAL ITEMS", value: totalItems },
        { label: "PENDING ORDERS", value: pendingPacking },
        { label: "COMPLETED/ACTIVE", value: readyForDispatch },
        { label: "TOTAL REVENUE", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
    ];

    return (
        <div className="flex items-center gap-8 py-4 border-b border-gray-200 mb-8 overflow-x-auto font-mono">
            {stats.map((stat, index) => (
                <div key={index} className="flex-shrink-0">
                    <div className="text-xs text-gray-400 tracking-widest uppercase font-bold">
                        {stat.label}
                    </div>
                    <div className="text-xl font-bold text-gray-900 mt-0.5">
                        {stat.value}
                    </div>
                </div>
            ))}
        </div>
    );
}
