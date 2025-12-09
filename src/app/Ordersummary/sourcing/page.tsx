"use client";

import React, { useState, useEffect } from "react";
import { OrderSummaryUrl } from "../../../libs/utils/API/endpoints";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface SourcingItem {
    productId: string;
    productName: string;
    variantName?: string;
    totalQuantity: number;
    unit: string;
    orderCount: number;
    orders: {
        orderId: string;
        customerName: string;
        quantity: number;
    }[];
}

export default function SourcingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sourcingList, setSourcingList] = useState<SourcingItem[]>([]);

    // Filters
    const [dateFilter, setDateFilter] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    });

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

                // 1. Filter by Date first
                const filtered = data.filter((item: any) => {
                    const orderDate = item.deliveryDate || item.scheduledDate || item.date;
                    if (!orderDate) return false;
                    return new Date(orderDate).toISOString().split("T")[0] === dateFilter;
                });

                // 2. Aggregate Items
                const aggregated: { [key: string]: SourcingItem } = {};

                filtered.forEach((order: any) => {
                    if (order.status === "Cancelled") return;

                    const orderId = order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : "N/A");
                    const customerName = order.name || "Unknown";

                    order.items?.forEach((item: any) => {
                        // Create a unique key for product + variant
                        const key = `${item.productId}-${item.variant || 'base'}`;

                        if (!aggregated[key]) {
                            aggregated[key] = {
                                productId: item.productId,
                                productName: item.name, // Assuming item.name is product name
                                variantName: item.variant,
                                totalQuantity: 0,
                                unit: item.unit || "unit",
                                orderCount: 0,
                                orders: []
                            };
                        }

                        // Parse quantity (handle strings if necessary)
                        const qty = Number(item.quantity) || 0;

                        aggregated[key].totalQuantity += qty;
                        aggregated[key].orderCount += 1;
                        aggregated[key].orders.push({
                            orderId,
                            customerName,
                            quantity: qty
                        });
                    });
                });

                // Convert to array and sort by name
                const list = Object.values(aggregated).sort((a, b) =>
                    a.productName.localeCompare(b.productName)
                );

                setSourcingList(list);
            }
        } catch (error) {
            console.error("Failed to fetch orders for sourcing", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-white p-8 font-mono text-sm text-gray-800">
            {/* Header / No-Print */}
            <div className="print:hidden flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-widest">Global Sourcing Manifest</h1>
                        <p className="text-gray-500 text-xs mt-1">Aggregate demand for procurement</p>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-black"
                    />
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                    >
                        <PrinterIcon className="h-4 w-4" />
                        <span>Print Manifest</span>
                    </button>
                </div>
            </div>

            {/* Printable Content */}
            <div className="max-w-4xl mx-auto">
                <div className="hidden print:block mb-8">
                    <h1 className="text-2xl font-bold uppercase border-b-2 border-black pb-2 mb-2">Sourcing Manifest</h1>
                    <div className="flex justify-between text-xs">
                        <span>Date: {new Date(dateFilter).toLocaleDateString()}</span>
                        <span>Generated: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 animate-pulse">
                        Loading sourcing data...
                    </div>
                ) : sourcingList.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 border border-dashed border-gray-300 rounded-lg">
                        No orders found for this date.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black text-xs uppercase tracking-wider">
                                <th className="py-2 pl-2">Product</th>
                                <th className="py-2 text-right">Total Qty</th>
                                <th className="py-2 text-right text-gray-500">Orders</th>
                                <th className="py-2 pl-8 print:hidden">Distribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sourcingList.map((item) => (
                                <React.Fragment key={`${item.productId}-${item.variantName || 'base'}`}>
                                    <tr className="border-b border-gray-100 group hover:bg-gray-50 align-top">
                                        <td className="py-3 pl-2">
                                            <div className="font-bold">{item.productName}</div>
                                            {item.variantName && <div className="text-gray-500 text-xs">{item.variantName}</div>}
                                        </td>
                                        <td className="py-3 text-right font-bold text-base">
                                            {item.totalQuantity} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                                        </td>
                                        <td className="py-3 text-right text-gray-500">
                                            {item.orderCount}
                                        </td>
                                        {/* Details Column - Hidden in Print usually, or shown differently. 
                                            For "Industrial Standard", a consolidated list often doesn't need every order ID inline unless expanded.
                                            Let's show a summary here or allow expansion. 
                                            For this "Minimal UI", lets show it in a small, faint list.
                                        */}
                                        <td className="py-3 pl-8 print:hidden">
                                            <div className="text-xs text-gray-400 truncate max-w-xs">
                                                {item.orders.map(o => o.customerName).slice(0, 3).join(", ")}
                                                {item.orders.length > 3 && ` +${item.orders.length - 3} more`}
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Print-only details row (optional, if they want to use this list to PACK as well as SOURCE, they might need this. 
                                        But for SOURCING, usually just totals are needed. I'll omit detailed breakdown in print for now to keep it clean.) 
                                    */}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="mt-8 pt-8 border-t border-gray-200 text-xs text-center text-gray-400 print:block hidden">
                    Govigi Internal • Admin Sourcing Document
                </div>
            </div>
        </div>
    );
}
