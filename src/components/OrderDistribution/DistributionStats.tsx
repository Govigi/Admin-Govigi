import React from "react";

interface StatsProps {
    stats: {
        pendingCategories: number;
        fullyAssigned: number;
        vendorLoad: number;
        distEfficiency: number;
    };
}

export default function DistributionStats({ stats }: StatsProps) {
    return (
        <div className="grid grid-cols-4 gap-6">
            <div className="p-5 border border-[#E5E7EB] rounded-[10px] shadow-sm bg-white">
                <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Pending Categories</p>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-[#111827] text-3xl font-extrabold">{stats.pendingCategories}</p>
                    <span className="material-symbols-outlined text-amber-500 text-3xl">hourglass_empty</span>
                </div>
            </div>

            <div className="p-5 border border-[#E5E7EB] rounded-[10px] shadow-sm bg-white">
                <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Fully Assigned</p>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-[#111827] text-3xl font-extrabold">{stats.fullyAssigned}</p>
                    <span className="material-symbols-outlined text-green-500 text-3xl">verified</span>
                </div>
            </div>

            <div className="p-5 border border-[#E5E7EB] rounded-[10px] shadow-sm bg-white">
                <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Vendor Load</p>
                <div className="flex flex-col mt-2">
                    <p className="text-[#111827] text-3xl font-extrabold">{stats.vendorLoad}%</p>
                    <div className="w-full bg-gray-100 h-1.5 mt-2 rounded-full overflow-hidden">
                        <div
                            className="bg-[#0047FF] h-full rounded-full transition-all duration-500"
                            style={{ width: `${stats.vendorLoad}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="p-5 border border-[#E5E7EB] rounded-[10px] shadow-sm bg-white">
                <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Dist. Efficiency</p>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-[#111827] text-3xl font-extrabold">{stats.distEfficiency}km</p>
                    <span className="material-symbols-outlined text-blue-500 text-3xl">route</span>
                </div>
            </div>
        </div>
    );
}
