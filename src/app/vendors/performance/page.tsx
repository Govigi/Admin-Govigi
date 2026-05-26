"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
    MagnifyingGlassIcon, 
    ArrowPathIcon, 
    StarIcon, 
    ChartBarIcon, 
    SparklesIcon, 
    CheckCircleIcon,
    ArrowDownIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import DataTable from "react-data-table-component";
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
    const [vendors, setVendors] = useState<VendorPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVendor, setSelectedVendor] = useState<VendorPerformance | null>(null);

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
            center: true,
        },
        {
            name: "Completed",
            selector: (row: VendorPerformance) => row.performance?.completedOrders || 0,
            sortable: true,
            cell: (row: VendorPerformance) => (
                <span className="font-mono font-bold text-emerald-600">{row.performance?.completedOrders || 0}</span>
            ),
            center: true,
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
            center: true,
        },
        {
            name: "Earnings",
            selector: (row: VendorPerformance) => row.performance?.totalEarnings || 0,
            sortable: true,
            cell: (row: VendorPerformance) => (
                <span className="font-mono font-bold text-gray-900">₹{(row.performance?.totalEarnings || 0).toLocaleString("en-IN")}</span>
            ),
            right: true,
        },
        {
            name: "Rating",
            selector: (row: VendorPerformance) => row.rating || 0,
            sortable: true,
            cell: (row: VendorPerformance) => (
                <div className="flex items-center gap-1 font-bold text-amber-500 font-mono">
                    <StarIcon className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{(row.rating || 4.5).toFixed(1)}</span>
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
                    onRowClicked={(row) => setSelectedVendor(row)}
                    sortIcon={<ArrowDownIcon className="ml-1 w-3 h-3 text-gray-400" />}
                />
            </div>

            {/* Performance Detail Modal */}
            {selectedVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b-2 border-black flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-gray-500">Partner Details</h3>
                                <h2 className="text-xl font-black uppercase text-gray-900">{selectedVendor.businessName}</h2>
                            </div>
                            <button onClick={() => setSelectedVendor(null)} className="p-1 text-gray-400 hover:text-black">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs text-gray-600">
                            
                            {/* Grid of Profile Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-200 pb-6">
                                <div className="p-3 bg-gray-50 border border-gray-200">
                                    <span className="text-gray-400 block uppercase text-[10px]">Vendor Code</span>
                                    <span className="text-sm font-bold text-gray-900 uppercase">{selectedVendor.vendorCode || "N/A"}</span>
                                </div>
                                <div className="p-3 bg-gray-50 border border-gray-200">
                                    <span className="text-gray-400 block uppercase text-[10px]">Joined Date</span>
                                    <span className="text-sm font-bold text-gray-900">{new Date(selectedVendor.joinedDate || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <div className="p-3 bg-gray-50 border border-gray-200">
                                    <span className="text-gray-400 block uppercase text-[10px]">Overall Rating</span>
                                    <span className="text-sm font-bold text-amber-500">{(selectedVendor.rating || 4.5).toFixed(1)} ★</span>
                                </div>
                                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800">
                                    <span className="text-emerald-500 block uppercase text-[10px]">Sourced Earnings</span>
                                    <span className="text-sm font-bold">₹{selectedVendor.performance?.totalEarnings.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-2">
                                <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px] border-l-2 border-black pl-2">Contact details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border border-gray-100 bg-gray-50/50">
                                    <div><span className="text-gray-400 block uppercase text-[9px]">Contact Person</span><span className="font-bold uppercase text-gray-900">{selectedVendor.contactPerson}</span></div>
                                    <div><span className="text-gray-400 block uppercase text-[9px]">Phone number</span><span className="font-bold text-gray-900">{selectedVendor.phone}</span></div>
                                    <div className="md:col-span-2"><span className="text-gray-400 block uppercase text-[9px]">Email Address</span><span className="font-bold text-gray-900">{selectedVendor.email}</span></div>
                                </div>
                            </div>

                            {/* Detailed Order Summary */}
                            <div className="space-y-3">
                                <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px] border-l-2 border-black pl-2">Operational scorecard</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 border border-gray-100 text-center">
                                        <span className="text-lg font-bold text-gray-900">{selectedVendor.performance?.totalOrders || 0}</span>
                                        <span className="text-[9px] text-gray-400 block uppercase mt-1">Assigned Orders</span>
                                    </div>
                                    <div className="p-4 border border-gray-100 text-center">
                                        <span className="text-lg font-bold text-emerald-600">{selectedVendor.performance?.completedOrders || 0}</span>
                                        <span className="text-[9px] text-gray-400 block uppercase mt-1">Fulfilled Orders</span>
                                    </div>
                                    <div className="p-4 border border-gray-100 text-center">
                                        <span className="text-lg font-bold text-orange-500">{selectedVendor.performance?.pendingOrders || 0}</span>
                                        <span className="text-[9px] text-gray-400 block uppercase mt-1">Pending Orders</span>
                                    </div>
                                    <div className="p-4 border border-gray-100 text-center">
                                        <span className="text-lg font-bold text-red-500">{selectedVendor.performance?.rejectedOrders || 0}</span>
                                        <span className="text-[9px] text-gray-400 block uppercase mt-1">Rejected Orders</span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Categories */}
                            <div>
                                <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px] border-l-2 border-black pl-2 mb-2">Service Range</h4>
                                <div className="flex gap-1.5 flex-wrap">
                                    {selectedVendor.supportedCategories?.map((cat, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-[9px] font-bold border border-gray-200 rounded uppercase">
                                            {cat}
                                        </span>
                                    )) || <span className="text-gray-400 italic">No Categories registered</span>}
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50">
                            <button onClick={() => setSelectedVendor(null)} className="px-6 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-colors">
                                Close Scorecard
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
