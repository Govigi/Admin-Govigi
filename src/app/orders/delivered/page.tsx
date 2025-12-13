"use client";

import React, { useState, useEffect, useMemo } from "react";
import OrdersPanel from "../../../components/OrderSummary/OrdersPanel";
import { OrderSummaryUrl } from "../../../libs/utils/API/endpoints";
import { MagnifyingGlassIcon, FunnelIcon, CalendarIcon } from "@heroicons/react/24/outline";

export default function DeliveredOrdersPage() {
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
                        ["delivered", "completed"].includes(item.status?.toLowerCase())
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

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-mono text-gray-900">
            <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">Delivered Orders</h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Completed Order History
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    {/* Search Bar */}
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH ORDER ID, NAME, PHONE..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full md:w-64 focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full md:w-40 focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black uppercase bg-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 h-[calc(100vh-200px)]">
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
