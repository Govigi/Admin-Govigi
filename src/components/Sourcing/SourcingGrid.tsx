import React, { useState } from "react";
import { TruckIcon, UserIcon, CalendarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface SourcingGridProps {
    orders: any[];
    loading: boolean;
    onAssignVendor: (selectedOrders: any[]) => void;
}

export default function SourcingGrid({ orders, loading, onAssignVendor }: SourcingGridProps) {
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

    const handleSelectOrder = (orderId: string) => {
        if (selectedOrderIds.includes(orderId)) {
            setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
        } else {
            setSelectedOrderIds(prev => [...prev, orderId]);
        }
    };

    const handleAssignClick = () => {
        const selected = orders.filter(o => selectedOrderIds.includes(o.id));
        onAssignVendor(selected);
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="font-mono text-sm text-gray-400 animate-pulse">LOADING ORDERS...</div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="font-mono text-lg text-gray-300 mb-2">NO ORDERS TO SOURCE</div>
                    <div className="font-mono text-xs text-gray-400">All caught up!</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50/50 rounded-lg border border-gray-200 overflow-hidden">

            {/* Action Bar - Static Position for No Overlap */}
            {selectedOrderIds.length > 0 && (
                <div className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md animate-in slide-in-from-top-2 z-30 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981] text-xs font-bold text-white">
                            {selectedOrderIds.length}
                        </span>
                        <span className="font-mono text-xs font-bold uppercase tracking-widest">
                            Orders Selected
                        </span>
                    </div>
                    <button
                        onClick={handleAssignClick}
                        className="bg-white text-black px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center gap-2 rounded-sm"
                    >
                        <TruckIcon className="w-4 h-4" />
                        Assign Vendor
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Reduced density: Max 3 columns for "few boxes" feel */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {orders.map((order) => {
                        const isSelected = selectedOrderIds.includes(order.id);

                        return (
                            <div
                                key={order.id}
                                onClick={() => handleSelectOrder(order.id)}
                                className={`group relative bg-white border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${isSelected
                                    ? "border-[#10b981] ring-1 ring-[#10b981]"
                                    : "border-gray-200 hover:border-gray-400"
                                    }`}
                            >
                                {/* Header */}
                                <div className={`px-4 py-3 border-b flex justify-between items-start ${isSelected ? "bg-green-50/50 border-green-100" : "bg-gray-50/50 border-gray-100"}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${isSelected ? "bg-[#10b981] text-white" : "bg-gray-200 text-gray-500"}`}>
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-mono text-sm font-bold text-gray-900 leading-tight">
                                                {order.customer}
                                            </div>
                                            <div className="font-mono text-xs text-gray-400 mt-1">
                                                #{order.orderId}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-[#10b981] border-[#10b981]" : "border-gray-300 bg-white"}`}>
                                        {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                    </div>
                                </div>

                                {/* Items Area - Taller for handling large orders */}
                                <div className="p-4 h-[220px] overflow-y-auto custom-scrollbar bg-white">
                                    <div className="space-y-3">
                                        {(order.products || []).map((prod: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-start text-sm group/item">
                                                <div className="flex items-start gap-2 max-w-[70%]">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300 mt-1.5 group-hover/item:bg-[#10b981] transition-colors flex-shrink-0"></div>
                                                    <span className="text-gray-700 font-medium leading-tight">
                                                        {prod.name}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-gray-900 font-bold whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded text-xs">
                                                    {prod.quantity} {prod.unit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                    <div className="font-mono text-xs text-gray-500 font-medium">
                                        {(order.products || []).length} Items included
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${order.sourcingStatus === 'Assigned'
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : "bg-yellow-50 text-yellow-600 border-yellow-100"
                                        }`}>
                                        {order.sourcingStatus || "Pending"}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
