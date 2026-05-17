"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import KPIStats from "../../components/OrderSummary/KPIStats";
import DataTable from "react-data-table-component";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { OrderSummaryUrl } from "@/src/libs/utils/API/endpoints";
import DateRangePicker from "../../components/Global/DateRangePicker";

// High-performance static memory cache for product images
const imageCache = new Map<string, string>();

function CachedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    const [cachedSrc, setCachedSrc] = useState<string | null>(imageCache.get(src) || null);

    useEffect(() => {
        if (cachedSrc) return;

        const img = new Image();
        img.src = src;
        img.onload = () => {
            imageCache.set(src, src);
            setCachedSrc(src);
        };
    }, [src, cachedSrc]);

    if (!cachedSrc) {
        return <div className="h-full w-full bg-gray-100 animate-pulse border border-gray-200" />;
    }

    return <img src={cachedSrc} alt={alt} className={className} loading="lazy" />;
}

const customStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f9fafb", // gray-50
      borderBottomWidth: "1px",
      borderBottomColor: "#e5e7eb", // gray-200
      minHeight: "40px",
    },
  },
  headCells: {
    style: {
      fontFamily: "monospace",
      fontSize: "11px",
      fontWeight: "bold",
      textTransform: "uppercase" as "uppercase",
      letterSpacing: "0.05em",
      color: "#6b7280",
      paddingLeft: "12px",
      paddingRight: "12px",
    },
  },
  rows: {
    style: {
      fontSize: "12px",
      fontFamily: "monospace",
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
      paddingLeft: "12px",
      paddingRight: "12px",
      color: "#111827",
    },
  },
  pagination: {
    style: {
      borderTopWidth: "1px",
      borderTopColor: "#e5e7eb",
      fontSize: "11px",
      fontFamily: "monospace",
      color: "#6b7280",
    },
  },
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Reusable Date Range State
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [dateFilterType, setDateFilterType] = useState<"orderDate" | "deliveryDate">("orderDate");

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const url = OrderSummaryUrl.getOrderDetails;

            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                const normalized = data.map((item: any) => ({
                    id: item._id,
                    orderId: item._id ? item._id.slice(-6).toUpperCase() : "N/A",
                    customer: item.customerId?.customerName || item.name || "Unknown Customer",
                    customerPhone: item.customerId?.customerPhone || item.contact || "N/A",
                    contactPerson: item.customerId?.customerContactPerson || "N/A",
                    products: (item.items || []).map((prod: any) => ({
                        ...prod,
                        productId: prod.productId || prod._id,
                        name: prod.name || prod.productName || "Unknown",
                        image: prod.image || null,
                        quantity: prod.quantityKg || prod.quantity || prod.qty || 0,
                        unit: prod.unit || "kg"
                    })),
                    totalAmount: item.totalAmount || 0,
                    status: item.status || "Pending",
                    paymentStatus: item.paymentStatus || "Pending",
                    date: item.createdAt,
                    deliveryDate: item.scheduledDate || item.createdAt || null,
                    deliverySlot: item.scheduledTimeSlot || item.deliverySlot || item.slot || "Unassigned",
                    vendorId: item.vendorId || null,
                }));

                setOrders(normalized);
            } else {
                setOrders([]);
            }
        } catch (error: any) {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Client side filtering for Orders including Date Range
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = 
                (order.customer?.toLowerCase() || "").includes(searchLower) ||
                (order.orderId?.toLowerCase() || "").includes(searchLower) ||
                (order.customerPhone?.toLowerCase() || "").includes(searchLower);

            let matchesStatus = true;
            if (statusFilter !== "all") {
                matchesStatus = order.status?.toLowerCase() === statusFilter.toLowerCase();
            }

            let matchesDateRange = true;
            if (startDate && endDate) {
                const targetDate = dateFilterType === "orderDate" ? order.date : order.deliveryDate;
                if (!targetDate) {
                    matchesDateRange = false;
                } else {
                    const targetDateStr = String(targetDate).split('T')[0];
                    matchesDateRange = targetDateStr >= startDate && targetDateStr <= endDate;
                }
            } else if (startDate) {
                const targetDate = dateFilterType === "orderDate" ? order.date : order.deliveryDate;
                if (!targetDate) {
                    matchesDateRange = false;
                } else {
                    const targetDateStr = String(targetDate).split('T')[0];
                    matchesDateRange = targetDateStr === startDate;
                }
            }

            return matchesSearch && matchesStatus && matchesDateRange;
        });
    }, [orders, searchQuery, statusFilter, startDate, endDate, dateFilterType]);

    // DataTable columns definition for Orders
    const orderColumns = useMemo(() => [
        {
            name: "Order ID",
            selector: (row: any) => row.orderId,
            sortable: true,
            cell: (row: any) => (
                <span className="font-bold text-gray-950 uppercase font-mono">
                    #{row.orderId}
                </span>
            ),
            width: "90px",
        },
        {
            name: "Customer",
            selector: (row: any) => row.customer,
            sortable: true,
            cell: (row: any) => (
                <div className="flex flex-col py-2 font-mono">
                    <span className="font-bold uppercase text-gray-950 leading-tight truncate max-w-[140px]">{row.customer}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{row.customerPhone}</span>
                </div>
            ),
            width: "160px",
        },
        {
            name: "Products / Items",
            selector: (row: any) => row.products?.length || 0,
            sortable: true,
            cell: (row: any) => {
                const products = row.products || [];
                return (
                    <div className="flex flex-col py-2 font-mono min-w-0 w-full">
                        <div className="flex items-center gap-1 overflow-hidden">
                            {products.slice(0, 4).map((p: any, idx: number) => {
                                const imageUrl = p.image?.url || p.image;
                                return (
                                    <div key={idx} className="inline-block h-6 w-6 border border-gray-200 bg-gray-50 overflow-hidden shrink-0 shadow-sm" title={p.name}>
                                        {imageUrl ? (
                                            <CachedImage src={imageUrl} alt={p.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-[8px] font-bold text-gray-400">
                                                {p.name?.slice(0, 2).toUpperCase() || "IT"}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {products.length > 4 && (
                                <div className="flex items-center justify-center h-6 w-6 border border-gray-200 bg-gray-950 text-[8px] font-bold text-white shrink-0 shadow-sm">
                                    +{products.length - 4}
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
            width: "200px",
        },
        {
            name: "Schedule Slot",
            selector: (row: any) => row.deliverySlot,
            sortable: true,
            cell: (row: any) => (
                <span className="font-bold text-gray-950 font-mono text-[10px] uppercase truncate max-w-[110px]">
                    {row.deliverySlot}
                </span>
            ),
            width: "125px",
        },
        {
            name: "Total Price",
            selector: (row: any) => row.totalAmount,
            sortable: true,
            cell: (row: any) => (
                <span className="font-bold text-gray-950 font-mono">
                    ₹{row.totalAmount?.toLocaleString("en-IN")}
                </span>
            ),
            width: "110px",
        },
        {
            name: "Order Status",
            selector: (row: any) => row.status,
            sortable: true,
            cell: (row: any) => (
                <span className={`border py-0.5 px-2 text-[9px] uppercase font-mono tracking-widest ${
                    ["delivered", "completed"].includes(row.status?.toLowerCase())
                        ? "border-green-200 text-green-700 bg-green-50"
                        : ["cancelled", "rejected"].includes(row.status?.toLowerCase())
                            ? "border-red-200 text-red-700 bg-red-50"
                            : ["shipped", "out for delivery"].includes(row.status?.toLowerCase())
                                ? "border-indigo-200 text-indigo-700 bg-indigo-50"
                                : "border-yellow-200 text-yellow-700 bg-yellow-50"
                }`}>
                    {row.status || "Pending"}
                </span>
            ),
            width: "140px",
        },
        {
            name: "Payment Status",
            selector: (row: any) => row.paymentStatus,
            sortable: true,
            cell: (row: any) => (
                <span className={`border py-0.5 px-2 text-[9px] uppercase font-mono tracking-widest ${
                    row.paymentStatus === "Paid"
                        ? "border-green-200 text-green-700 bg-green-50"
                        : "border-gray-200 text-gray-500 bg-gray-50"
                }`}>
                    {row.paymentStatus || "Pending"}
                </span>
            ),
            width: "120px",
        },
        {
            name: "Assigned Vendor",
            selector: (row: any) => row.vendorId?.businessName,
            sortable: true,
            cell: (row: any) => (
                <span className="text-[10px] font-bold text-gray-650 uppercase font-mono truncate max-w-[130px]" title={row.vendorId?.businessName}>
                    {row.vendorId?.businessName || "Unassigned"}
                </span>
            ),
            width: "140px",
        },
    ], []);

    const handleRowClick = (row: any) => {
        router.push(`/Ordersummary/${row.id}`);
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-mono text-gray-900 overflow-x-hidden selection:bg-black selection:text-white">
            {/* Header Toolbar */}
            <div className="print:hidden flex flex-col xl:flex-row justify-between items-start xl:items-end mb-4 pb-4 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">
                        Orders Dashboard
                    </h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">
                        Manage and track customer order pipelines
                    </p>
                </div>

                {/* Reusable Date Range Picker */}
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                    dateFilterType={dateFilterType}
                    onFilterTypeChange={setDateFilterType}
                />
            </div>

            {/* KPI Section */}
            <KPIStats orders={filteredOrders} />

            {/* Sub toolbar with active total, search, and status filtering */}
            <div className="print:hidden mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="pb-2.5 px-0 text-xs font-bold uppercase tracking-widest text-black border-b-2 border-black shrink-0">
                    Active Orders ({filteredOrders.length})
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    {/* Search Bar */}
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH ORDERS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full md:w-64 focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300 font-mono"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full md:w-44 focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer font-mono"
                        >
                            <option value="all">Status: All</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out for delivery">Out For Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List Data Table */}
            <div className="w-full overflow-x-auto border border-gray-200 rounded-none p-0">
                <div className="min-w-[1000px] w-full">
                    <DataTable
                        columns={orderColumns}
                        data={filteredOrders}
                        pagination
                        highlightOnHover
                        pointerOnHover
                        responsive
                        onRowClicked={handleRowClick}
                        paginationPerPage={10}
                        customStyles={customStyles}
                        progressPending={loading}
                        progressComponent={
                            <div className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest font-mono animate-pulse">
                                LOADING ORDERS LIST...
                            </div>
                        }
                    />
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 text-[10px] uppercase tracking-widest text-center text-gray-400 print:hidden font-bold">
                Govigi Admin • Secure Order Management System
            </div>
        </div>
    );
}