"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ProductRequestUrl } from "@/src/libs/utils/API/endpoints";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function ProductRequestsTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const { data: requests = [], isLoading, isError } = useQuery({
        queryKey: ["productRequests"],
        queryFn: async () => {
            const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
            const { data } = await axios.get(ProductRequestUrl.getAllProductRequests, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return data;
        },
    });

    const filteredRequests = requests.filter((req: any) => {
        const matchesSearch =
            req.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.customerId?.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || req.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-white p-2 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden pb-24">

            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col gap-4">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981] break-words">
                        Product Requests
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Review items requested by customers</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search Bar */}
                    <div className="relative group flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH REQUESTS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative md:w-48">
                        <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer"
                        >
                            <option value="all">Status: All</option>
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Fulfilled">Fulfilled</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 uppercase tracking-wider border-b border-gray-200 font-medium text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Product Name</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading requests...</td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No requests found.</td>
                                </tr>
                            ) : (
                                filteredRequests.map((req: any) => (
                                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 uppercase">
                                            {req.productName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {req.customerId?.customerName || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {req.customerId?.customerPhone || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide
                            ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    req.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                                                        req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
