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
            <div className="h-full flex items-center justify-center font-sans">
                <div className="text-gray-400 text-xs animate-pulse tracking-widest uppercase">
                    LOADING ORDERS...
                </div>
            </div>
        );
    }

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    return (
        <div className="h-full flex flex-col font-sans">
            {/* Header / Summary info */}
            <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Orders Count
                    </h3>
                    <div className="text-2xl font-bold text-gray-950 mt-1">
                        {filteredOrders.length}
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Total Pipeline Revenue
                    </h3>
                    <div className="text-xl font-bold text-gray-950 mt-1">
                        ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {filteredOrders.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <span className="text-xl mb-2">—</span>
                        <span>NO ORDERS FOUND</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                        {filteredOrders.map((order) => {
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => handleOrderClick(order)}
                                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gray-950 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                #{order.orderId}
                                            </span>
                                            <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider rounded ${getStatusStyle(order.status)}`}>
                                                {order.status || "Pending"}
                                            </span>
                                        </div>

                                        {/* Customer details */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-bold text-gray-950 line-clamp-1 mb-1">
                                                {order.customer}
                                            </h4>
                                            <div className="text-[11px] text-gray-500 flex flex-col gap-0.5">
                                                <span>Phone: {order.customerPhone}</span>
                                                {order.contactPerson && order.contactPerson !== "N/A" && (
                                                    <span>Contact: {order.contactPerson}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {/* Items / Slots info */}
                                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {order.products?.length || 0} Item{order.products?.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className="text-[10px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                {order.deliverySlot}
                                            </span>
                                        </div>

                                        {order.sourcingStatus && order.sourcingStatus !== "Pending" && (
                                            <div className="mt-2 text-left">
                                                <span className="text-[8px] font-bold uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 border border-blue-200/60 rounded">
                                                    Sourcing: {order.sourcingStatus}
                                                </span>
                                            </div>
                                        )}

                                        {/* Total Amount Footer */}
                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total Amount</span>
                                            <span className="text-base font-bold text-gray-950">
                                                ₹{order.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
