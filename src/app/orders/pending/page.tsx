"use client";

import React, { useState, useEffect, useMemo } from "react";
import OrdersPanel from "../../../components/OrderSummary/OrdersPanel";
import { OrderSummaryUrl } from "../../../libs/utils/API/endpoints";
import { MagnifyingGlassIcon, FunnelIcon, CalendarIcon } from "@heroicons/react/24/outline";

export default function PendingOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(OrderSummaryUrl.getOrderDetails, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                const normalized = data
                    .map((item: any) => ({
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
                    }))
                    .filter((item: any) =>
                        ["pending", "processing", "confirmed"].includes(item.status?.toLowerCase())
                    );

                setOrders(normalized);
            } else {
                console.error("Fetch failed with status:", res.status);
            }
        } catch (error: any) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                order.orderId.toLowerCase().includes(searchLower) ||
                order.customer.toLowerCase().includes(searchLower) ||
                String(order.customerPhone).includes(searchLower);

            const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();

            const matchesDate = !dateFilter ||
                (new Date(order.deliveryDate || order.date).toDateString() === new Date(dateFilter).toDateString());

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [orders, searchQuery, statusFilter, dateFilter]);

    // KPI Summary counts
    const kpiSummary = useMemo(() => {
        const pendingCount = orders.filter(o => o.status.toLowerCase() === "pending").length;
        const processingCount = orders.filter(o => ["processing", "confirmed"].includes(o.status.toLowerCase())).length;
        const totalValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        return {
            pendingCount,
            processingCount,
            totalValue
        };
    }, [orders]);

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-gray-900">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-gray-950">Pending Orders</h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">
                        Manage active orders pipeline and deliveries
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border border-gray-200 bg-white rounded-lg">
                    <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">Pending Confirmation</div>
                    <div className="text-2xl font-bold text-yellow-600">{kpiSummary.pendingCount}</div>
                    <div className="text-xs mt-1 text-gray-400">Awaiting dispatch/approval</div>
                </div>
                <div className="p-4 border border-gray-200 bg-white rounded-lg">
                    <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">Confirmed / Processing</div>
                    <div className="text-2xl font-bold text-blue-600">{kpiSummary.processingCount}</div>
                    <div className="text-xs mt-1 text-gray-400">Currently being fulfilled</div>
                </div>
                <div className="p-4 border border-gray-200 bg-white rounded-lg">
                    <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">Pipeline Value</div>
                    <div className="text-2xl font-bold text-gray-900">₹{kpiSummary.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-xs mt-1 text-gray-400">Gross value of active orders</div>
                </div>
            </div>

            {/* Filter Controls Panel */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Search Bar */}
                    <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Search Order</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="SEARCH ORDER ID, NAME, PHONE..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 text-xs rounded focus:outline-none focus:ring-1 focus:ring-gray-950 uppercase placeholder-gray-300"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Filter Status</label>
                        <div className="relative">
                            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 text-xs rounded focus:outline-none focus:ring-1 focus:ring-gray-950 uppercase cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                            </select>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Delivery Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 text-xs rounded focus:outline-none focus:ring-1 focus:ring-gray-950 uppercase"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Panel Content */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-[500px]">
                <OrdersPanel
                    orders={filteredOrders}
                    loading={loading}
                    dateFilter={dateFilter}
                    onOrderUpdate={fetchOrders}
                />
            </div>
        </div>
    );
}
