"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
    MagnifyingGlassIcon, 
    ArrowPathIcon, 
    StarIcon, 
    ChartBarIcon, 
    SparklesIcon, 
    CheckCircleIcon,
    ArrowDownIcon
} from "@heroicons/react/24/outline";
import DataTable from "react-data-table-component";
import { useRouter } from "next/navigation";
import { getVendorsPerformance } from "../../../libs/vendorService";

interface VendorPerformance {
    _id: string;
    businessName: string;
    vendorCode: string;
    contactPerson: string;
    phone: string;
    email: string;
    rating: number;
    joinedDate: string;
    supportedCategories: string[];
    performance: {
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
        rejectedOrders: number;
        totalEarnings: number;
        outstandingBalance: number;
        fulfillmentRate: number;
    };
    ratingDistribution?: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
        total: number;
    };
}

const customStyles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },
    },
    headRow: {
        style: {
            backgroundColor: "#f9fafb",
            borderBottomWidth: "1px",
            borderBottomColor: "#e5e7eb",
            minHeight: "40px",
        },
    },
    headCells: {
        style: {
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase" as const,
            letterSpacing: "0.05em",
            color: "#6b7280",
            paddingLeft: "16px",
            paddingRight: "16px",
        },
    },
    rows: {
        style: {
            fontSize: "12px",
            fontFamily: "var(--font-inter), sans-serif",
            minHeight: "56px",
            borderBottomColor: "#f3f4f6",
            "&:hover": {
                backgroundColor: "#f9fafb",
            },
            cursor: "pointer",
        },
    },
    cells: {
        style: {
            paddingLeft: "16px",
            paddingRight: "16px",
            color: "#111827",
        },
    },
    pagination: {
        style: {
            borderTopWidth: "1px",
            borderTopColor: "#e5e7eb",
            fontSize: "11px",
            fontFamily: "var(--font-inter), sans-serif",
            color: "#6b7280",
        },
    },
};

export default function VendorPerformancePage() {
    const router = useRouter();
    const [vendors, setVendors] = useState<VendorPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchPerformanceData();
    }, []);

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            const data = await getVendorsPerformance();
            setVendors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch vendor performance", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVendors = useMemo(() => {
        return vendors.filter(v => 
            v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.vendorCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.phone?.includes(searchQuery)
        );
    }, [vendors, searchQuery]);

    const stats = useMemo(() => {
        const total = vendors.length;
        const totalSourced = vendors.reduce((acc, curr) => acc + (curr.performance?.totalEarnings || 0), 0);
        const avgRating = vendors.length > 0 ? (vendors.reduce((acc, curr) => acc + (curr.rating || 0), 0) / vendors.length).toFixed(1) : "0.0";
        const avgFulfillment = vendors.length > 0 ? (vendors.reduce((acc, curr) => acc + (curr.performance?.fulfillmentRate || 0), 0) / vendors.length).toFixed(1) : "0.0";

        return [
            { label: "Total Partners", value: total, icon: SparklesIcon, color: "text-blue-600 bg-blue-50 border-blue-100" },
            { label: "Sourced Volume", value: `₹${totalSourced.toLocaleString("en-IN")}`, icon: ChartBarIcon, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            { label: "Avg Fulfillment", value: `${avgFulfillment}%`, icon: CheckCircleIcon, color: "text-orange-600 bg-orange-50 border-orange-100" },
            { label: "Network Rating", value: `${avgRating} ★`, icon: StarIcon, color: "text-amber-600 bg-amber-50 border-amber-100" },
        ];
    }, [vendors]);

    const columns = [
        {
            name: "Vendor & Code",
            selector: (row: VendorPerformance) => row.businessName,
            sortable: true,
            cell: (row: VendorPerformance) => (
                <div className="flex flex-col py-2">
                    <span className="font-bold uppercase tracking-tight text-gray-900">{row.businessName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{row.vendorCode || "N/A"}</span>
                </div>
            ),
            width: "220px",
        },
        {
            name: "Contact / Owner",
            selector: (row: VendorPerformance) => row.contactPerson,
            sortable: true,
            cell: (row: VendorPerformance) => (
                <div className="flex flex-col">
                    <span className="font-bold uppercase text-[11px] text-gray-800">{row.contactPerson}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{row.phone}</span>
                </div>
            ),
            width: "160px",
        },
        {
            name: "Orders Sourced",
            selector: (row: VendorPerformance) => row.performance?.totalOrders || 0,
            sortable: true,
            cell: (row: VendorPerformance) => (
                <span className="font-mono font-bold text-gray-900">{row.performance?.totalOrders || 0}</span>
            ),
            center: "true" as any,
        },
        {
            name: "Completed",
            selector: (row: VendorPerformance) => row.performance?.completedOrders || 0,
            sortable: true,
            cell: (row: VendorPerformance) => (
                <span className="font-mono font-bold text-emerald-600">{row.performance?.completedOrders || 0}</span>
            ),
            center: "true" as any,
        },
        {
            name: "Fulfillment Rate",
            selector: (row: VendorPerformance) => row.performance?.fulfillmentRate || 0,
            sortable: true,
            cell: (row: VendorPerformance) => {
                const rate = row.performance?.fulfillmentRate || 0;
                return (
                    <span className={`px-2 py-0.5 font-bold font-mono text-[10px] border rounded-none
                        ${rate >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          rate >= 50 ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-red-50 text-red-600 border-red-100"}
                    `}>
                        {rate}%
                    </span>
                );
            },
            center: "true" as any,
        },
        {
            name: "Earnings",
            selector: (row: VendorPerformance) => row.performance?.totalEarnings || 0,
            sortable: true,
            cell: (row: VendorPerformance) => (
                <span className="font-mono font-bold text-gray-900">₹{(row.performance?.totalEarnings || 0).toLocaleString("en-IN")}</span>
            ),
            right: "true" as any,
        },
        {
            name: "Rating",
            selector: (row: VendorPerformance) => row.rating || 0,
            sortable: true,
            cell: (row: VendorPerformance) => (
                <div className="flex items-center gap-1 font-bold text-amber-500 font-mono">
                    <StarIcon className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{(row.rating || 0).toFixed(1)}</span>
                </div>
            ),
            width: "90px",
        }
    ];

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-inter text-gray-900 w-full overflow-x-hidden pb-24">
            
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981] border-l-4 border-[#10b981] pl-4">
                    Vendor Performance
                </h1>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider pl-5 font-mono">
                    Operation stats & performance scoring
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className={`p-4 border shadow-none flex flex-col justify-between ${stat.color} transition-all`}>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</span>
                                <Icon className="w-4 h-4 opacity-75" />
                            </div>
                            <span className="text-lg md:text-xl font-black mt-2 font-mono text-gray-900">{stat.value}</span>
                        </div>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-gray-200">
                <div className="relative group w-full md:w-80">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH BUSINESS, CODE, PHONES..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black uppercase placeholder-gray-300 rounded-none font-mono"
                    />
                </div>

                <button onClick={fetchPerformanceData} className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-none flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase">
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Table Area */}
            <div className="border border-gray-200 relative overflow-hidden bg-white w-full">
                <DataTable
                    columns={columns}
                    data={filteredVendors}
                    progressPending={loading}
                    progressComponent={
                        <div className="py-20 text-gray-400 text-xs uppercase tracking-widest animate-pulse flex flex-col items-center gap-3 font-mono">
                            <div className="w-5 h-5 border-2 border-gray-100 border-t-[#10b981] rounded-full animate-spin"></div>
                            Loading performance logs...
                        </div>
                    }
                    pagination
                    paginationPerPage={10}
                    highlightOnHover
                    pointerOnHover
                    responsive
                    customStyles={customStyles}
                    onRowClicked={(row) => router.push(`/vendors/performance/${row._id}`)}
                    sortIcon={<ArrowDownIcon className="ml-1 w-3 h-3 text-gray-400" />}
                />
            </div>

        </div>
    );
}
