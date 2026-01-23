import React from "react";
import { ClockIcon, TruckIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface DashboardSummaryCardProps {
    dateFilter: string;
    totalOrders: number;
    assignedCount: number;
    unassignedCount: number;
}

export default function DashboardSummaryCard({
    dateFilter,
    totalOrders,
    assignedCount,
    unassignedCount
}: DashboardSummaryCardProps) {

    const formatDateDisplay = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return `Today (${date.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })})`;
        if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow (${date.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })})`;
        return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2">
                        <TruckIcon className="w-5 h-5 text-gray-500" />
                        Orders to Deliver: {formatDateDisplay(dateFilter)}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        Assignment Cut-off: <span className="font-bold text-red-600">12:00 AM (Midnight)</span>
                    </p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    {/* Unassigned Card */}
                    <div className="flex-1 md:w-48 bg-red-50 border border-red-100 rounded-lg p-3 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-bold uppercase text-red-500 tracking-widest">Unassigned</div>
                            <div className="text-2xl font-bold text-red-700 font-mono mt-1">{unassignedCount}</div>
                        </div>
                        <ExclamationCircleIcon className="w-8 h-8 text-red-200" />
                    </div>

                    {/* Assigned Card */}
                    <div className="flex-1 md:w-48 bg-green-50 border border-green-100 rounded-lg p-3 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-bold uppercase text-green-600 tracking-widest">Assigned</div>
                            <div className="text-2xl font-bold text-green-700 font-mono mt-1">{assignedCount}</div>
                        </div>
                        <CheckCircleIcon className="w-8 h-8 text-green-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}
