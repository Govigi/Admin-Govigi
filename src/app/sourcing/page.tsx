"use client";

import React, { useState, useEffect } from "react";
import SourcingGrid from "@/src/components/Sourcing/SourcingGrid";
import VendorAssignmentModal from "@/src/components/Sourcing/VendorAssignmentModal";
import { OrderSummaryUrl } from "@/src/libs/utils/API/endpoints";
import { TruckIcon } from "@heroicons/react/24/outline";

export default function SourcingPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // Default to today, or maybe just show all pending sourcing?
    // Let's reuse date filter approach for consistency, or just show pending.
    // For MVP Sourcing, showing "Tomorrow" (since that's usually what we source for) makes sense.
    // Implementing same date filter logic as Ordersummary for safety.

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
                    // Filter for only orders that need sourcing (Optional, but user said "assign vendors")
                    // Maybe we show all, but highlight pending? 
                    // Let's show all for now so they can re-assign if needed.
                    .map((item: any) => ({
                        id: item._id,
                        orderId: item._id ? item._id.slice(-6).toUpperCase() : "N/A",
                        customer: item.customerId?.customerName || item.name || "Unknown Customer",
                        customerPhone: item.customerId?.customerPhone || item.contact || "N/A",
                        products: (item.items || []).map((prod: any) => ({
                            ...prod,
                            quantity: prod.quantityKg || prod.quantity || 0,
                            name: prod.name || prod.productName
                        })),
                        totalAmount: item.totalAmount || 0,
                        status: item.status || "Pending",
                        sourcingStatus: item.sourcingStatus || "Pending",
                        deliverySlot: item.scheduledTimeSlot || "Unassigned"
                    }));
                setOrders(normalized);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSuccess = () => {
        setSelectedOrders([]);
        fetchOrders();
    };

    return (
        <div className="h-[calc(100vh-64px)] bg-white font-mono text-gray-900 flex flex-col">
            <VendorAssignmentModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                selectedOrders={selectedOrders}
                onAssignSuccess={handleAssignSuccess}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b border-gray-200 shrink-0">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                        <TruckIcon className="h-6 w-6" />
                        Sourcing Dashboard
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Assign vendors for {dateFilter}
                    </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex-1 p-2 overflow-hidden">
                <SourcingGrid
                    orders={orders}
                    loading={loading}
                    onAssignVendor={(ordersToAssign) => {
                        setSelectedOrders(ordersToAssign);
                        setIsAssignModalOpen(true);
                    }}
                />
            </div>
        </div>
    );
}
