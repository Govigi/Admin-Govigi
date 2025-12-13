import React, { useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { FireIcon } from "@heroicons/react/24/solid";

export default function DashboardChart({ orders }: { orders: any[] }) {

    // 1. Process Data for Hourly Chart
    const chartData = useMemo(() => {
        // Initialize 24 hour buckets
        const hours = Array(24).fill(0).map((_, i) => ({ 
            hour: i, 
            label: `${i % 12 || 12}${i < 12 ? 'AM' : 'PM'}`, 
            orders: 0 
        }));

        orders.forEach(order => {
            if (order.createdAt) {
                const date = new Date(order.createdAt);
                // Simple filter: Only count orders from "Today" to make the chart meaningful for a daily view
                // OR count all if dataset is small. Let's do all for now to ensure data shows up.
                const h = date.getHours();
                if (hours[h]) hours[h].orders += 1;
            }
        });

        // Filter to only show relevant range (e.g. 6AM to 10PM) or just the whole day
        // Let's simplified to 6am - 9pm for better visual density
        return hours.slice(6, 22);
    }, [orders]);

    // 2. Recent Transactions / Best Selling (Mock logic for best selling)
    // We can count product occurrences
    const topProducts = useMemo(() => {
        const productCounts: Record<string, number> = {};
        orders.forEach(o => {
            (o.items || []).forEach((i: any) => {
                const name = i.name || i.productName || "Unknown";
                productCounts[name] = (productCounts[name] || 0) + (i.quantity || 1);
            });
        });
        return Object.entries(productCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([name, count]) => ({ name, count }));
    }, [orders]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Scale Area Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Sales Overview</h3>
                        <p className="text-gray-400 text-xs mt-1">Hourly order distribution</p>
                    </div>
                    
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="orders"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorOrders)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products / Sidebar */}
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <FireIcon className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-gray-800 text-lg">Top Selling</h3>
                </div>

                <div className="flex-1 space-y-6">
                    {topProducts.length > 0 ? topProducts.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-bold flex items-center justify-center text-sm group-hover:bg-[#10b981] group-hover:text-white transition-colors duration-300">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 group-hover:text-[#10b981] transition-colors">{item.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">High demand</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{item.count}</p>
                                <span className="text-[10px] text-gray-400">Sold</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-400 text-sm mt-10">
                            No sales data yet.
                        </div>
                    )}
                </div>

                <button className="mt-auto w-full py-3 rounded-xl bg-gray-50 text-gray-600 text-sm font-bold hover:bg-[#10b981] hover:text-white transition-colors">
                    View All Products
                </button>
            </div>

        </div>
    );
}
