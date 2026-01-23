import React, { useMemo } from "react";
import {
    XMarkIcon,
    MapPinIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    UserIcon,
    LockClosedIcon
} from "@heroicons/react/24/outline";

interface OrderDetailsPanelProps {
    order: any | null;
    onClose: () => void;
    onAssign: (orderId: string) => void;
    isLocked?: boolean;
}

export default function OrderDetailsPanel({ order, onClose, onAssign, isLocked = false }: OrderDetailsPanelProps) {

    // Helper to categorize items
    const detailCategories = useMemo(() => {
        if (!order || !order.products) return {};
        const grouped: any = {};
        order.products.forEach((p: any) => {
            const cat = p.category || "General";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(p);
        });
        return grouped;
    }, [order]);

    return (
        <div
            className={`flex flex-col border-l border-gray-200 bg-white transition-all duration-300 ease-in-out fixed top-0 right-0 h-screen shadow-2xl z-[60] ${order ? "w-full md:w-[500px] lg:w-[600px] translate-x-0" : "w-0 translate-x-full opacity-0"}`}
        >
            {order && (
                <div className="flex flex-col h-full w-full bg-gray-50/50">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Order #{order.orderId}</h2>
                                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${order.sourcingStatus === 'Assigned'
                                    ? "bg-green-50 text-green-700 border-green-100"
                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                    }`}>
                                    {order.sourcingStatus === 'Assigned' ? 'Assigned' : 'Pending'}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-2">
                                <span>{new Date().toLocaleDateString()}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>{order.customer}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Customer Card */}
                        <div className="bg-white rounded-md p-5 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-black/10 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <UserIcon className="w-24 h-24 text-gray-900 -rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Delivery Details</h3>
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                                        {order.customer?.charAt(0) || "C"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-bold text-gray-900 truncate">{order.customer}</p>
                                        <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                                            <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="leading-snug">{order.address?.formattedAddress || "No Address Provided"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                                    <span className="text-gray-500 font-medium">Delivery Slot</span>
                                    <span className="bg-gray-100 text-gray-900 font-bold px-2 py-1 rounded">{order.deliverySlot}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Ordered Items ({order.products?.length || 0})</h3>
                            <div className="space-y-4">
                                {Object.keys(detailCategories).map((cat) => (
                                    <div key={cat} className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                            <span className="font-bold text-xs text-gray-800 uppercase">{cat}</span>
                                            <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">{detailCategories[cat].length}</span>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {detailCategories[cat].map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                            #{idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                            <p className="text-xs text-gray-500 font-medium">{item.quantity} {item.unit}</p>
                                                        </div>
                                                    </div>
                                                    {/* Price or Status */}
                                                    <div className="text-right">
                                                        {item.sourcingStatus === 'Assigned' && (
                                                            <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto mb-1" />
                                                        )}
                                                        <span className="text-xs font-bold text-gray-900">
                                                            {item.price ? `₹${item.price}` : '₹0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-5 border-t border-gray-200 bg-white z-20">
                        <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="text-gray-500 font-medium">Total Value</span>
                            <span className="font-bold text-xl text-gray-900">
                                ₹{order.products?.reduce((acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 1), 0).toFixed(2) || "0.00"}
                            </span>
                        </div>
                        {order.sourcingStatus !== 'Assigned' ? (
                            isLocked ? (
                                <div className="w-full py-4 bg-gray-100 text-gray-500 text-sm font-bold uppercase tracking-widest rounded-xl flex justify-center items-center gap-2 cursor-not-allowed">
                                    <LockClosedIcon className="w-4 h-4" />
                                    <span>Assignment Locked</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onAssign(order.id)}
                                    className="w-full py-4 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all flex justify-center items-center gap-2"
                                >
                                    <span>Assign Vendor</span>
                                    <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            )
                        ) : (
                            <div className="w-full py-2 bg-green-50 text-green-700 text-sm font-bold uppercase tracking-widest rounded-md border border-green-200 flex justify-center items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span>Vendor Assigned</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
