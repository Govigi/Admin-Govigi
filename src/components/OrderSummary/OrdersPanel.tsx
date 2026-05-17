"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";

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
        case "order placed":
            return "bg-yellow-50 text-yellow-700 border-yellow-200/80";
        case "confirmed":
        case "processing":
        case "packed":
            return "bg-blue-50 text-blue-700 border-blue-200/80";
        case "shipped":
        case "out for delivery":
            return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
        case "delivered":
        case "completed":
            return "bg-green-50 text-green-700 border-green-200/80";
        case "cancelled":
        case "rejected":
            return "bg-red-50 text-red-700 border-red-200/80";
        default:
            return "bg-gray-50 text-gray-700 border-gray-200/80";
    }
};

export default function OrdersPanel({
    orders,
    loading,
    selectedOrders = [],
}: OrdersPanelProps) {
    const router = useRouter();

    const filteredOrders = useMemo(() => {
        return orders;
    }, [orders]);

    const handleOrderClick = (order: any) => {
        router.push(`/Ordersummary/${order.id}`);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center font-mono">
                <div className="text-gray-400 text-xs animate-pulse tracking-widest uppercase">
                    LOADING ORDERS...
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col font-mono">
            {/* Header / Summary info */}
            <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-end">
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Total Orders
                    </h3>
                    <div className="text-2xl font-bold text-gray-950 mt-1">
                        {filteredOrders.length}
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Total Revenue
                    </h3>
                    <div className="text-lg font-bold text-gray-950 mt-1">
                        ₹{filteredOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0).toLocaleString("en-IN")}
                    </div>
                </div>
            </div>

            {/* Orders list scroll area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
                {filteredOrders.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <span className="text-xl mb-2">—</span>
                        <span>NO ORDERS FOUND</span>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        return (
                            <div
                                key={order.id}
                                onClick={() => handleOrderClick(order)}
                                className="bg-white border border-gray-200 p-4 cursor-pointer transition-all hover:border-gray-950 hover:bg-gray-50/50"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-gray-950 truncate uppercase tracking-tight" title={order.customer}>
                                            {order.customer}
                                        </div>
                                        <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                            #{order.orderId}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs font-bold text-gray-950">
                                            ₹{order.totalAmount?.toLocaleString("en-IN")}
                                        </div>
                                        <span className={`inline-block mt-2 px-2 py-0.5 border text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                            {order.status || "Pending"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        {order.products?.length || 0} item{order.products?.length !== 1 ? 's' : ''}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {order.sourcingStatus && order.sourcingStatus !== "Pending" && (
                                            <span className="text-[9px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-200/60">
                                                {order.sourcingStatus}
                                            </span>
                                        )}
                                        {order.deliverySlot && (
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
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
