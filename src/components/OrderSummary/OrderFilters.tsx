import React from "react";
import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface OrderFiltersProps {
    filters: {
        date: string;
        status: string;
        slot: string;
        search: string;
    };
    setFilters: React.Dispatch<
        React.SetStateAction<{
            date: string;
            status: string;
            slot: string;
            search: string;
        }>
    >;
}

export default function OrderFilters({ filters, setFilters }: OrderFiltersProps) {
    const handleChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search order ID, customer..."
                    value={filters.search}
                    onChange={(e) => handleChange("search", e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm transition duration-150 ease-in-out"
                />
            </div>

            {/* Date Filter */}
            <div className="w-full md:w-auto">
                <input
                    type="date"
                    value={filters.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md border"
                />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-auto">
                <select
                    value={filters.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md border bg-white"
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Packed">Packed</option>
                    <option value="Ready for Dispatch">Ready for Dispatch</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div className="w-full md:w-auto">
                <select
                    value={filters.slot}
                    onChange={(e) => handleChange("slot", e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md border bg-white"
                >
                    <option value="All">All Slots</option>
                    <option value="Morning">Morning (8AM - 11AM)</option>
                    <option value="Afternoon">Afternoon (1PM - 4PM)</option>
                    <option value="Evening">Evening (5PM - 8PM)</option>
                </select>
            </div>
        </div>
    );
}
