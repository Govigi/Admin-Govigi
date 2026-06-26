import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface LiveFeedProps {
    orders: any[];
}

export default function LiveFeed({ orders }: LiveFeedProps) {
    return (
        <div className="border border-gray-200 rounded-lg bg-white h-full flex flex-col font-sans">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600">Recent Transactions</h3>
                <button className="text-[10px] text-primary hover:underline">VIEW ALL</button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="p-3 pl-4">ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.slice(0, 8).map(order => (
                            <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 pl-4 font-bold text-gray-900">
                                    {order.orderId || order._id?.slice(-6).toUpperCase()}
                                    <div className="text-[10px] text-gray-400 font-normal">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="truncate max-w-[120px] font-medium text-gray-700">
                                        {order.customer?.name || order.customerName || "Guest"}
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                        {(order.items || []).length} Items
                                    </div>
                                </td>
                                <td className="p-3 text-right font-bold text-gray-900">
                                    ₹{Number(order.totalAmount || 0).toFixed(2)}
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold
                                        ${(order.status || '').toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                                            (order.status || '').toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-50 text-blue-700'}
                                    `}>
                                        {order.status || 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
