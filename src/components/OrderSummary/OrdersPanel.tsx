"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { OrderSummaryUrl } from "../../libs/utils/API/endpoints";
import axios from "axios";

interface OrdersPanelProps {
    orders: any[];
    loading: boolean;
    dateFilter: string;
    onOrderUpdate?: () => void;
    selectedOrders?: any[];
    onSelectionChange?: (selected: any[]) => void;
    selectionEnabled?: boolean;
}

const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "confirmed":
        case "processing":
        case "packed":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "shipped":
            return "bg-indigo-100 text-indigo-800 border-indigo-200";
        case "delivered":
            return "bg-green-100 text-green-800 border-green-200";
        case "cancelled":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

export default function OrdersPanel({
    orders,
    loading,
    dateFilter,
    onOrderUpdate,
    selectedOrders = [],
    onSelectionChange,
    selectionEnabled = false
}: OrdersPanelProps) {
    const router = useRouter();

    const filteredOrders = useMemo(() => {
        return orders;
    }, [orders]);

    const handleOrderClick = (order: any) => {
        router.push(`/Ordersummary/${order.id}`);
    };

    const toggleSelectAll = () => {
        if (!onSelectionChange) return;
        if (selectedOrders.length === filteredOrders.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange([...filteredOrders]);
        }
    };

    const toggleSelection = (e: React.MouseEvent, order: any) => {
        e.stopPropagation();
        if (!onSelectionChange) return;
        const isSelected = selectedOrders.some(o => o.id === order.id);
        if (isSelected) {
            onSelectionChange(selectedOrders.filter(o => o.id !== order.id));
        } else {
            onSelectionChange([...selectedOrders, order]);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center border-l border-gray-200">
                <div className="text-gray-400 font-mono text-sm animate-pulse">
                    LOADING ORDERS...
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-gray-200 pb-3 mb-4 flex justify-between items-end">
                <div className="flex items-center gap-2">
                    <div>
                        <h3 className="font-mono text-xs uppercase tracking-widest text-gray-500">
                            Orders
                        </h3>
                        <div className="font-mono text-2xl font-bold mt-1">
                            {filteredOrders.length}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-xs text-gray-400">REVENUE</div>
                    <div className="font-mono text-lg font-bold">
                        ₹{filteredOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {filteredOrders.length === 0 ? (
                    <div className="text-center text-gray-400 font-mono text-sm py-8">
                        NO ORDERS FOUND
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const isSelected = selectedOrders.some(o => o.id === order.id);
                        return (
                            <div
                                key={order.id}
                                onClick={() => handleOrderClick(order)}
                                className={`bg-white border rounded-lg p-3 cursor-pointer transition-colors group ${isSelected ? "border-black ring-1 ring-black" : "border-gray-200 hover:border-gray-400"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0 flex-1 overflow-hidden">
                                        <div className="min-w-0 flex-1">
                                            <div className="font-mono text-sm font-bold text-gray-900 truncate" title={order.customer}>
                                                {order.customer}
                                            </div>
                                            <div className="font-mono text-xs text-gray-500 mt-0.5 truncate">
                                                #{order.orderId}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-mono text-sm font-bold">
                                            ₹{order.totalAmount?.toLocaleString("en-IN")}
                                        </div>
                                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-mono rounded border ${getStatusStyle(order.status)}`}>
                                            {order.status?.toUpperCase() || "PENDING"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 ml-7">
                                    <div className="font-mono text-xs text-gray-400">
                                        {order.products?.length || 0} items
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {order.sourcingStatus && order.sourcingStatus !== "Pending" && (
                                            <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-1 border border-blue-200">
                                                {order.sourcingStatus}
                                            </span>
                                        )}
                                        {order.deliverySlot && (
                                            <div className="font-mono text-xs text-gray-400">
                                                {order.deliverySlot}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
