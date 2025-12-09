import React from "react";
import { MagnifyingGlassIcon, CalendarIcon, EllipsisVerticalIcon, PencilSquareIcon, TrashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function DashboardTable({ orders }: { orders: any[] }) {
    // Take top 5 for "Latest" view
    const latestOrders = orders.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="font-bold text-gray-900 text-lg">Latest Transactions</h3>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                        <span className="sr-only">Refresh</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>

                    <div className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                        />
                    </div>

                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <CalendarIcon className="w-4 h-4" />
                        Today
                        <ChevronDownIcon className="w-4 h-4 ml-1" />
                    </button>

                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 mb-4 px-4">
                <div className="col-span-2">Transaction ID</div>
                <div className="col-span-5">Product / Items</div>
                <div className="col-span-2 text-left">Amount</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1"></div>
            </div>

            {/* Table Body */}
            <div className="space-y-2">
                {latestOrders.length > 0 ? latestOrders.map((order: any) => (
                    <div key={order._id || order.orderId} className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">

                        {/* ID */}
                        <div className="col-span-2 text-sm font-bold text-gray-900 flex items-center gap-3">
                            <input type="checkbox" className="rounded border-gray-300 text-[#10b981] focus:ring-[#10b981]" />
                            {order.orderId || order._id?.slice(-6).toUpperCase()}
                        </div>

                        {/* Product */}
                        <div className="col-span-5 flex items-center gap-3">
                            {/* Fallback image or first product image */}
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 overflow-hidden">
                                {order.items && order.items[0]?.image ? (
                                    <img src={order.items[0].image} alt="Product" className="w-full h-full object-cover" />
                                ) : "IMG"}
                            </div>
                            <div className="truncate pr-2">
                                <p className="font-semibold text-gray-900 text-sm truncate">
                                    {order.items?.map((i: any) => i.name || i.productName).join(", ") || "No Items"}
                                </p>
                                <p className="text-xs text-gray-400">{order.items?.length || 0} items</p>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="col-span-2 text-sm font-bold text-gray-900">₹{order.totalAmount || 0}</div>

                        {/* Status */}
                        <div className="col-span-2 flex justify-center">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                   ${(order.status || "").toLowerCase() === 'delivered' ? 'bg-emerald-50 text-[#10b981] border-emerald-100' :
                                    (order.status || "").toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                        'bg-blue-50 text-blue-600 border-blue-100'} 
                `}>
                                <span className={`w-1.5 h-1.5 rounded-full ${(order.status || "").toLowerCase() === 'delivered' ? 'bg-[#10b981]' : (order.status || "").toLowerCase() === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                {order.status || "Pending"}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex justify-end gap-2 text-gray-400">
                            <button className="hover:text-[#10b981]"><PencilSquareIcon className="w-5 h-5" /></button>
                            <button className="hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                        </div>

                    </div>
                )) : (
                    <div className="col-span-12 text-center py-8 text-gray-500 text-sm">
                        No recent transactions found.
                    </div>
                )}
            </div>
        </div>
    );
}
