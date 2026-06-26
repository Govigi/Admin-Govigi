import React from "react";
import { ExclamationTriangleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface ActionRequiredProps {
    orders: any[];
    lowStockProducts: any[];
}

export default function ActionRequired({ orders, lowStockProducts }: ActionRequiredProps) {
    // 1. Filter Orders needing attention (Pending/Processing)
    const attentionOrders = orders
        .filter(o => ["pending", "processing"].includes((o.status || "").toLowerCase()))
        .slice(0, 5); // Top 5

    return (
        <div className="border border-gray-200 rounded-lg bg-white h-full flex flex-col font-sans">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600">Action Required</h3>
                <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {attentionOrders.length + lowStockProducts.length} Alerts
                </span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-6">

                {/* Pending Orders Section */}
                <div>
                    <h4 className="text-[10px] uppercase text-gray-400 font-bold mb-3 flex items-center gap-2">
                        <ClockIcon className="w-3 h-3" /> Pending Fulfillment
                    </h4>
                    <div className="space-y-2">
                        {attentionOrders.length > 0 ? attentionOrders.map(order => (
                            <div key={order._id} className="flex justify-between items-center p-3 border border-gray-100 rounded hover:border-black transition-colors bg-white">
                                <div>
                                    <div className="font-bold text-sm">#{order.orderId || order._id?.slice(-6).toUpperCase()}</div>
                                    <div className="text-xs text-gray-500">
                                        {(order.items || []).length} items • ₹{Number(order.totalAmount || 0).toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100 uppercase font-bold">
                                        {order.status}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-400 italic">No pending orders. Good job.</div>
                        )}
                    </div>
                </div>

                {/* Low Stock Section */}
                {lowStockProducts.length > 0 && (
                    <div>
                        <h4 className="text-[10px] uppercase text-red-400 font-bold mb-3 flex items-center gap-2 mt-2">
                            <ExclamationTriangleIcon className="w-3 h-3" /> Low Stock Warning
                        </h4>
                        <div className="space-y-2">
                            {lowStockProducts.slice(0, 5).map(prod => (
                                <div key={prod._id} className="flex justify-between items-center p-2 bg-red-50 border border-red-100 rounded text-red-900">
                                    <div className="text-xs font-bold truncate w-2/3">{prod.name}</div>
                                    <div className="text-xs font-mono font-bold">{prod.stock} Rem</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
