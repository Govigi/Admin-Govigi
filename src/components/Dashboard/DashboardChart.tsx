import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function DashboardChart({ orders }: { orders: any[] }) {

    // 1. Process Data for Chart (Mock Hourly Distribution)
    // Since we likely don't have enough hourly resolution data in the test db, we'll keep the shape
    // but we could try to scale the 'value' based on totalOrders/10 or something to make it look responsive.
    const chartData = [
        { time: "10.00 AM", value: 10 },
        { time: "11.00 AM", value: 30 },
        { time: "12.00 PM", value: 45 },
        { time: "01.00 PM", value: 35 },
        { time: "02.00 PM", value: 55 },
        { time: "03.00 PM", value: 40 },
    ];

    // 2. Process Data for History (Latest 3 Orders)
    const historyData = orders.slice(0, 3).map(order => ({
        id: order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : "N/A"),
        time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        amount: order.totalAmount ? `₹${order.totalAmount}` : "₹0",
        status: order.status || "Pending"
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Left: Today Transaction Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Today Transaction</h3>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981" // Emerald Green
                                strokeWidth={3}
                                dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right: Transaction History */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="font-bold text-gray-900 mb-6">Transaction History</h3>

                <div className="flex-1 space-y-6">
                    {historyData.length > 0 ? historyData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <CheckIcon className="w-4 h-4 text-[#10b981]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">Order {item.id}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{item.amount}</p>
                                <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium block mt-1 w-fit ml-auto">
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-400 text-center py-4">No recent transactions</p>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 text-center">
                    <button className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center gap-1 mx-auto">
                        View All Transaction
                        <ChevronDownIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </div>
    );
}
