"use client";

import React, { useState } from "react";

interface CategoryItem {
    name: string;
    icon: string;
    items: string;
    vendor: string;
    vendorId: string;
    status: "assigned" | "in_progress" | "pending";
}

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

interface OrdersTableProps {
    orders: Order[];
    loading: boolean;
    onRefresh?: () => void;
}

const getCategoryIconColor = (iconName: string): string => {
    const colors: Record<string, string> = {
        "eco": "text-green-600",
        "nutrition": "text-orange-500",
        "kebab_dining": "text-red-600",
        "water_drop": "text-blue-400",
        "bakery_dining": "text-amber-600",
    };
    return colors[iconName] || "text-gray-500";
};

export default function OrdersTable({ orders, loading }: OrdersTableProps) {
    const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

    const toggleOrder = (orderId: string) => {
        setExpandedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const getStatusBadge = (status: CategoryItem["status"]) => {
        switch (status) {
            case "assigned":
                return <span className="text-[10px] font-bold text-green-600 px-2 py-1 bg-green-50 rounded">Assigned</span>;
            case "in_progress":
                return <span className="text-[10px] font-bold text-amber-600 px-2 py-1 bg-amber-50 rounded">In Progress</span>;
            default:
                return (
                    <button className="bg-[#0047FF] text-white text-[10px] font-bold px-4 py-1.5 rounded-[10px] hover:bg-blue-700 transition-all uppercase tracking-tight">
                        Assign
                    </button>
                );
        }
    };

    const getAssignmentStatus = (assigned: number, total: number) => {
        if (assigned === total && total > 0) {
            return { text: "Fully Assigned", color: "text-green-600" };
        }
        return { text: `${assigned} / ${total} Assigned`, color: assigned > 0 ? "text-amber-600" : "text-[#0047FF]" };
    };

    if (loading) {
        return (
            <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden bg-white shadow-sm p-12 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#0047FF] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[#6B7280] font-medium">Loading orders...</span>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden bg-white shadow-sm p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
                <p className="text-[#6B7280] font-medium">No orders found for today</p>
            </div>
        );
    }

    return (
        <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50/80 border-b border-[#E5E7EB]">
                        <th className="p-5 text-[#6B7280] text-[10px] font-extrabold uppercase tracking-wider">Order Reference</th>
                        <th className="p-5 text-[#6B7280] text-[10px] font-extrabold uppercase tracking-wider">Customer & Location</th>
                        <th className="p-5 text-[#6B7280] text-[10px] font-extrabold uppercase tracking-wider">Items Summary</th>
                        <th className="p-5 text-[#6B7280] text-[10px] font-extrabold uppercase tracking-wider">Assignment Status</th>
                        <th className="p-5 w-12"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                    {orders.map(order => {
                        const isExpanded = expandedOrders.includes(order.id);
                        const status = getAssignmentStatus(order.assignedCount, order.totalCount);

                        return (
                            <React.Fragment key={order.id}>
                                <tr
                                    className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${isExpanded ? 'border-l-4 border-l-[#0047FF] row-expanded' : ''}`}
                                    onClick={() => toggleOrder(order.id)}
                                >
                                    <td className="p-5 font-mono text-sm font-bold text-[#111827]">{order.orderRef}</td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#111827] tracking-tight">{order.customer}</span>
                                            <span className="text-[10px] font-semibold text-[#6B7280] uppercase">{order.location}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex gap-2 flex-wrap">
                                            {order.categories.map((cat, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded uppercase">{cat}</span>
                                            ))}
                                            {order.moreCount > 0 && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded uppercase">+{order.moreCount} More</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {order.vendorAvatars.map((avatar, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`size-6 rounded-full border-2 border-white ${avatar.color} flex items-center justify-center text-[10px] text-white font-bold`}
                                                    >
                                                        {avatar.letter}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className={`text-xs font-bold ${status.color}`}>{status.text}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <span className={`material-symbols-outlined ${isExpanded ? 'text-[#0047FF]' : 'text-[#6B7280]'}`}>
                                            {isExpanded ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </td>
                                </tr>

                                {isExpanded && (
                                    <tr className="bg-blue-50/20">
                                        <td colSpan={5} className="p-0">
                                            <div className="px-10 py-6 border-b border-[#E5E7EB]">
                                                <div className="bg-white border border-blue-100 rounded-[10px] shadow-sm overflow-hidden">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-gray-50 border-b border-blue-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider">Category</th>
                                                                <th className="px-6 py-3 text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider">Required Items</th>
                                                                <th className="px-6 py-3 text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider">Nearest Vendor Recommendation</th>
                                                                <th className="px-6 py-3 text-right"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-blue-50">
                                                            {order.categoryDetails.map((cat, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`material-symbols-outlined text-lg ${getCategoryIconColor(cat.icon)}`}>{cat.icon}</span>
                                                                            <span className="text-sm font-bold">{cat.name}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-xs font-medium max-w-xs truncate">{cat.items}</td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs font-bold text-[#111827]">{cat.vendor}</span>
                                                                            <span className={`text-[10px] font-bold uppercase tracking-tight ${cat.status === 'assigned' ? 'text-green-600' : cat.status === 'in_progress' ? 'text-amber-600' : 'text-[#6B7280]'}`}>
                                                                                {cat.status === 'assigned' ? 'Assigned' : cat.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            {getStatusBadge(cat.status)}
                                                                            {cat.status !== "pending" && (
                                                                                <button className="text-[#6B7280] hover:text-[#111827]">
                                                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
