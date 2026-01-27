"use client";

import React, { useState, useEffect } from "react";
import KPIStats from "../../components/OrderSummary/KPIStats";
import SourcingPanel from "../../components/OrderSummary/SourcingPanel";
import OrdersPanel from "../../components/OrderSummary/OrdersPanel";
import { OrderSummaryUrl } from "../../libs/utils/API/endpoints";
import { PrinterIcon, CalendarIcon } from "@heroicons/react/24/outline";

export default function OrdersPage() {
    const [generatedDate, setGeneratedDate] = useState("");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getTodayDate = () => {
        // Use local date for default filter instead of UTC
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [dateFilter, setDateFilter] = useState(getTodayDate());

    useEffect(() => {
        setGeneratedDate(new Date().toLocaleString());
    }, []);

    // ... existing code ...

    useEffect(() => {
        fetchOrders();
    }, [dateFilter]);

    // ... existing code ...


    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            // Hardcoding URL for debugging purposes to bypass potential config/import issues
            const url = "http://localhost:8000/getAllOrders";
            // const url = OrderSummaryUrl.getOrderDetails; 

            console.log("Fetching orders from URL:", url);
            console.log("Using token:", token ? "Token present" : "No token");

            const res = await fetch(url, {
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
                        const filterDateStr = dateFilter;

                        return targetDateStr === filterDateStr;
                    })
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
                    }));

                console.log("normalized data:", normalized);
                setOrders(normalized);
            } else {
                console.error("Fetch failed with status:", res.status);
                setOrders([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch orders", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDateDisplay = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
        return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    };



    return (
        <div className="min-h-screen bg-white p-2 md:p-8 font-mono text-gray-900 overflow-x-hidden">
            <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest">Order Summary</h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Sourcing & Orders for {formatDateDisplay(dateFilter)}
                    </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="text-sm focus:outline-none bg-transparent"
                        />
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90 transition-colors"
                    >
                        <PrinterIcon className="w-4 h-4" />
                        Print
                    </button>
                </div>
            </div>

            <div className="hidden print:block mb-6">
                <h1 className="text-2xl font-bold uppercase border-b-2 border-primary pb-2">
                    Order Summary - {formatDateDisplay(dateFilter)}
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                    Generated: {generatedDate}
                </p>
            </div>

            <KPIStats orders={orders} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div className="lg:col-span-5 border border-gray-200 rounded-lg p-4 h-[calc(100vh-320px)] min-h-[400px]">
                    <SourcingPanel orders={orders} loading={loading} />
                </div>

                <div className="lg:col-span-7 border border-gray-200 rounded-lg p-4 h-[calc(100vh-320px)] min-h-[400px]">
                    <OrdersPanel
                        orders={orders}
                        loading={loading}
                        dateFilter={dateFilter}
                        onOrderUpdate={fetchOrders}
                    />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-center text-gray-300 print:hidden">
                Govigi Admin • Order Management System
            </div>
        </div>
    );
}