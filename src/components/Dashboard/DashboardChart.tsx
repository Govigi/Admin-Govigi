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
        const hours = Array(24).fill(0).map((_, i) => ({ 
            hour: i, 
            label: `${i % 12 || 12}${i < 12 ? 'AM' : 'PM'}`, 
            orders: 0 
        }));

        orders.forEach(order => {
            if (order.createdAt) {
                const date = new Date(order.createdAt);
                const h = date.getHours();
                if (hours[h]) hours[h].orders += 1;
            }
        });

        return hours.slice(6, 22);
    }, [orders]);

    // 2. Best Selling logic
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
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }, [orders]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">

            {/* Area Chart */}
            <div className="lg:col-span-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                            />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: '#fff',
                                    borderRadius: '4px', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: 'none',
                                    fontSize: '12px'
                                }}
                                cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="orders"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorOrders)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products */}
            <div className="border-l border-gray-100 pl-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <FireIcon className="w-3 h-3 text-orange-500" />
                    <h3 className="font-bold text-gray-500 text-[10px] uppercase tracking-widest">Trending Items</h3>
                </div>

                <div className="flex-1 space-y-4">
                    {topProducts.length > 0 ? topProducts.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="text-[10px] text-gray-400 font-bold w-4">
                                    0{idx + 1}
                                </div>
                                <div className="truncate max-w-[120px]">
                                    <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{item.count} units</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-10">
                            NO DATA
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
