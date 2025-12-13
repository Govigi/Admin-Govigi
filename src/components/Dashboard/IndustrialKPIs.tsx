import React from "react";

interface IndustrialKPIsProps {
    orders: any[];
    customersCount: number;
    driversCount: number;
}

export default function IndustrialKPIs({ orders, customersCount, driversCount }: IndustrialKPIsProps) {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => ["pending", "processing"].includes((o.status || "").toLowerCase())).length;

    // Calculate Today's Revenue for comparison (mock logic for trend)
    const today = new Date().toDateString();
    const todayRevenue = orders
        .filter(o => new Date(o.createdAt).toDateString() === today)
        .reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const stats = [
        { label: "TOTAL REVENUE", value: `₹${totalRevenue.toLocaleString("en-IN")}`, sub: `₹${todayRevenue.toLocaleString("en-IN")} Today` },
        { label: "PENDING ORDERS", value: pendingOrders, sub: "Requires Action", highlight: pendingOrders > 0 },
        { label: "ACTIVE CUSTOMERS", value: customersCount, sub: "Total Registered" },
        { label: "ACTIVE DRIVERS", value: driversCount, sub: "On Duty" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-mono">
            {stats.map((stat, idx) => (
                <div key={idx} className={`p-4 border border-gray-200 bg-white rounded-lg ${stat.highlight ? 'border-l-4 border-l-red-500' : ''}`}>
                    <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold text-gray-900 truncate">{stat.value}</div>
                    <div className={`text-xs mt-1 ${stat.highlight ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {stat.sub}
                    </div>
                </div>
            ))}
        </div>
    );
}
