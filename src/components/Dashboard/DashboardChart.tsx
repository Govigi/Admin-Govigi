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

interface DashboardChartProps {
    orders: any[];
    timeframe: "today" | "7days" | "month" | "6months" | "year" | "all";
}

export default function DashboardChart({ orders, timeframe }: DashboardChartProps) {
    // Process Data based on timeframe
    const chartData = useMemo(() => {
        const now = new Date();
        const data = [];

        if (timeframe === "today") {
            const hours = Array(24).fill(0).map((_, i) => ({ 
                hour: i, 
                label: `${i % 12 || 12}${i < 12 ? 'AM' : 'PM'}`, 
                revenue: 0 
            }));
            const todayStr = now.toDateString();

            orders.forEach(order => {
                if (order.createdAt && new Date(order.createdAt).toDateString() === todayStr) {
                    const h = new Date(order.createdAt).getHours();
                    if (hours[h]) {
                        hours[h].revenue += Number(order.totalAmount || 0);
                    }
                }
            });
            // Return daytime hours (6AM to 10PM)
            return hours.slice(6, 22);
        } else if (timeframe === "7days") {
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                const dateStr = d.toDateString();

                const dayOrders = orders.filter(
                    o => o.createdAt && new Date(o.createdAt).toDateString() === dateStr
                );
                const revenue = dayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                data.push({ label, revenue });
            }
        } else if (timeframe === "month") {
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                const dateStr = d.toDateString();

                const dayOrders = orders.filter(
                    o => o.createdAt && new Date(o.createdAt).toDateString() === dateStr
                );
                const revenue = dayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                data.push({ label, revenue });
            }
        } else if (timeframe === "6months") {
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(now.getMonth() - i);
                const label = d.toLocaleDateString("en-IN", { month: "short" });
                const monthVal = d.getMonth();
                const yearVal = d.getFullYear();

                const monthOrders = orders.filter(o => {
                    if (!o.createdAt) return false;
                    const od = new Date(o.createdAt);
                    return od.getMonth() === monthVal && od.getFullYear() === yearVal;
                });
                const revenue = monthOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                data.push({ label, revenue });
            }
        } else if (timeframe === "year") {
            const currentYear = now.getFullYear();
            for (let m = 0; m <= now.getMonth(); m++) {
                const d = new Date(currentYear, m, 1);
                const label = d.toLocaleDateString("en-IN", { month: "short" });
                
                const monthOrders = orders.filter(o => {
                    if (!o.createdAt) return false;
                    const od = new Date(o.createdAt);
                    return od.getMonth() === m && od.getFullYear() === currentYear;
                });
                const revenue = monthOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                data.push({ label, revenue });
            }
        } else {
            // All Time - group by month
            const monthsMap: Record<string, number> = {};
            orders.forEach(o => {
                if (o.createdAt) {
                    const d = new Date(o.createdAt);
                    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
                    monthsMap[label] = (monthsMap[label] || 0) + (Number(o.totalAmount) || 0);
                }
            });
            const parsed = Object.entries(monthsMap).map(([label, revenue]) => ({ label, revenue }));
            if (parsed.length > 0) {
                return parsed.sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
            }
            // Fallback mock data
            return [
                { label: "Jan", revenue: 50000 },
                { label: "Feb", revenue: 80000 },
                { label: "Mar", revenue: 120000 },
                { label: "Apr", revenue: 150000 },
                { label: "May", revenue: 200000 },
                { label: "Jun", revenue: 220000 }
            ];
        }

        return data;
    }, [orders, timeframe]);

    const chartTitleSuffix = 
        timeframe === "today" ? "Today" :
        timeframe === "7days" ? "Last 7 Days" :
        timeframe === "month" ? "Last 30 Days" :
        timeframe === "6months" ? "Last 6 Months" :
        timeframe === "year" ? "YTD" : "All Time";

    return (
        <div className="w-full flex flex-col gap-4 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Sales Trend ({chartTitleSuffix})
                </span>
            </div>

            {/* Full-width Area Chart */}
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
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
                            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, "Sales"]}
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
                            type="linear"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
