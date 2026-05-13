"use client";

import React, { useState, useEffect } from "react";
import SourcingGrid from "@/src/components/Sourcing/SourcingGrid";
import { OrderSummaryUrl } from "@/src/libs/utils/API/endpoints";
import { TruckIcon } from "@heroicons/react/24/outline";

export default function SourcingPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getTomorrowDate = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [dateFilter, setDateFilter] = useState(getTomorrowDate());

    const [activeTab, setActiveTab] = useState<'pending' | 'assigned'>('pending');

    useEffect(() => {
        fetchOrders();
    }, [dateFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(OrderSummaryUrl.getOrderDetails || "/api/orders", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                const normalized = data
                    .filter((item: any) => {
                        const targetDate = item.scheduledDate || item.createdAt;
                        if (!targetDate) return false;
                        const targetDateStr = String(targetDate).split('T')[0];
                        return targetDateStr === dateFilter;
                    })
                    .map((item: any) => ({
                        id: item._id,
                        orderId: item._id ? item._id.slice(-6).toUpperCase() : "N/A",
                        customer: item.customerId?.customerName || item.name || "Unknown Customer",
                        customerPhone: item.customerId?.customerPhone || item.contact || "N/A",
                        products: (item.items || []).map((prod: any) => ({
                            ...prod,
                            quantity: prod.quantityKg || prod.quantity || 0,
                            name: prod.name || prod.productName,
                            category: prod.category || "General"
                        })),
                        totalAmount: item.totalAmount || 0,
                        status: item.status || "Pending",
                        sourcingStatus: item.sourcingStatus || "Pending",
                        deliverySlot: item.scheduledTimeSlot || "Unassigned",
                        vendor: item.vendorId ? {
                            name: item.vendorId.businessName,
                            contact: item.vendorId.phone || item.vendorId.contactPerson,
                            address: item.vendorId.address?.formattedAddress
                        } : null
                    }));
                setOrders(normalized);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(o =>
        activeTab === 'pending'
            ? o.sourcingStatus !== 'Assigned'
            : o.sourcingStatus === 'Assigned'
    );

    const isLocked = (() => {
        const now = new Date();
        const [y, m, d] = dateFilter.split('-').map(Number);
        const cutoff = new Date(y, m - 1, d, 0, 0, 0, 0);
        return now >= cutoff;
    })();

    return (
        <div className="h-[calc(100vh-64px)] bg-white font-mono text-gray-900 flex flex-col">
            <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100 shrink-0 bg-white z-20">
                <div className="flex items-center gap-4">
                    <h1 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <TruckIcon className="h-4 w-4" />
                        Sourcing
                    </h1>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400">
                        Supply for {dateFilter}
                    </span>
                    {isLocked && (
                        <span className="text-[10px] font-bold text-red-600 border border-red-200 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                            Lock Active
                        </span>
                    )}
                </div>
                <div>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="text-xs border-none bg-gray-50 rounded px-2 py-1 focus:outline-none hover:bg-gray-100 transition-colors cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white">
                <SourcingGrid
                    orders={filteredOrders}
                    loading={loading}
                    onRefresh={fetchOrders}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isLocked={isLocked}
                />
            </div>
        </div>
    );
}
