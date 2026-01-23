"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PrinterIcon, PhoneIcon, MapPinIcon, UserIcon, CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { OrderSummaryUrl } from "../../../libs/utils/API/endpoints";
import axios from "axios";

const ORDER_STEPS = ["Pending", "Confirmed", "Shipped", "Delivered"];
const CANCELLED_STEP = "Cancelled";

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [statusBuffer, setStatusBuffer] = useState({ status: "", paymentStatus: "" });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await axios.get(`${OrderSummaryUrl.getOrderById}/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.order) {
                const o = res.data.order;
                const oa = res.data.orderAddress;

                let addressDisplay = "Address not found";
                if (oa) {
                    if (oa.formattedAddress) {
                        addressDisplay = oa.formattedAddress;
                    } else if (oa.components) {
                        const { houseNumber, street, city, postalCode } = oa.components;
                        addressDisplay = [houseNumber, street, city, postalCode].filter(Boolean).join(", ");
                    } else if (oa.street) {
                        addressDisplay = [oa.street, oa.city].filter(Boolean).join(", ");
                    }
                }
                if ((addressDisplay === "Address not found" || addressDisplay === "N/A") && o.customerId?.customerAddress) {
                    const custAddr = o.customerId.customerAddress;
                    if (typeof custAddr === 'string' && custAddr.length > 10) {
                        addressDisplay = custAddr;
                    } else if (typeof custAddr === 'object') {
                        addressDisplay = custAddr.formattedAddress || `${custAddr.street || ''}, ${custAddr.city || ''}`;
                    }
                }

                // Normalize data
                const normalized = {
                    ...o,
                    id: o._id,
                    orderId: o.orderNumber || (o._id ? o._id.slice(-6).toUpperCase() : "N/A"),
                    customer: o.customerId?.customerName || o.name || "Unknown Customer",
                    customerPhone: o.customerId?.customerPhone || o.contact || "N/A",
                    contactPerson: o.customerId?.customerContactPerson || "N/A",
                    customerAddress: addressDisplay,
                    products: (o.items || []).map((prod: any) => ({
                        ...prod,
                        productId: prod.productId || prod._id,
                        name: prod.name || prod.productName || "Unknown",
                        image: prod.image || null,
                        quantity: prod.quantityKg || prod.quantity || prod.qty || 0,
                        unit: prod.unit || "kg"
                    })),
                    totalAmount: o.totalAmount || 0,
                    status: o.status || "Pending",
                    paymentStatus: o.paymentStatus || "Pending",
                    createdAt: o.createdAt
                };
                setOrder(normalized);
                setStatusBuffer({ status: normalized.status, paymentStatus: normalized.paymentStatus });
                setHasChanges(false);
            }
        } catch (error) {
            console.error("Failed to fetch order details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (key: 'status' | 'paymentStatus', value: string) => {
        setStatusBuffer(prev => {
            const next = { ...prev, [key]: value };
            setHasChanges(
                next.status !== order.status ||
                next.paymentStatus !== order.paymentStatus
            );
            return next;
        });
    };

    const handleSaveChanges = async () => {
        if (!order || !hasChanges) return;
        setUpdating(true);
        try {
            const token = localStorage.getItem("admin_token");

            // Update Order Status if changed
            if (statusBuffer.status !== order.status) {
                await axios.patch(OrderSummaryUrl.updateorderStatus(order.id),
                    { status: statusBuffer.status },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // Update Payment Status if changed
            if (statusBuffer.paymentStatus !== order.paymentStatus) {
                await axios.patch(OrderSummaryUrl.updatePaymentStatus(order.id),
                    { paymentStatus: statusBuffer.paymentStatus },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            await fetchOrderDetails();
            setHasChanges(false);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 font-mono text-xs tracking-widest text-gray-500">
                LOADING DATA...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-mono text-gray-500">
                <div className="mb-4 text-xs tracking-widest uppercase">Order Not Found</div>
                <button
                    onClick={() => router.back()}
                    className="underline hover:text-black text-xs"
                >
                    RETURN TO SUMMARY
                </button>
            </div>
        );
    }

    const currentStepIndex = ORDER_STEPS.indexOf(order.status);
    const isCancelled = order.status === CANCELLED_STEP;
    const isPaid = order.paymentStatus === "Paid";

    return (
        <>
            {/* PRINT-ONLY INVOICE LAYOUT */}
            <div className="hidden print:block font-mono p-8 text-black">
                <div className="flex justify-between items-start mb-12 border-b border-black pb-8">
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">GOVIGI</h1>
                        <p className="text-xs uppercase tracking-wider text-gray-600">Premium Grocery Supply</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold uppercase mb-1">Invoice / Receipt</h2>
                        <div className="text-sm">Order #{order.orderId}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex justify-between mb-16 gap-12">
                    <div className="flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Bill To / Ship To</h3>
                        <div className="text-sm font-bold uppercase">{order.customer}</div>
                        <div className="text-xs mt-1">{order.contactPerson}</div>
                        <div className="text-xs mt-1">{order.customerPhone}</div>
                        <div className="text-xs mt-2 text-gray-700 w-3/4">{order.customerAddress}</div>
                    </div>
                    <div className="flex-1 text-right">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Details</h3>
                        <div className="flex justify-end gap-2 text-xs mb-1">
                            <span className="text-gray-500">Payment Status:</span>
                            <span className={`font-bold uppercase ${isPaid ? "text-black" : "text-gray-600"}`}>{order.paymentStatus}</span>
                        </div>
                        <div className="flex justify-end gap-2 text-xs mb-1">
                            <span className="text-gray-500">Order Status:</span>
                            <span className="font-bold uppercase">{order.status}</span>
                        </div>
                    </div>
                </div>

                <table className="w-full mb-12 border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left text-xs font-bold uppercase py-2">Item</th>
                            <th className="text-right text-xs font-bold uppercase py-2">Price</th>
                            <th className="text-right text-xs font-bold uppercase py-2">Qty</th>
                            <th className="text-right text-xs font-bold uppercase py-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.products.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-200">
                                <td className="py-3 text-sm">
                                    <div className="font-bold">{item.name}</div>
                                </td>
                                <td className="py-3 text-right text-sm">₹{item.price}</td>
                                <td className="py-3 text-right text-sm">{item.quantity} {item.unit}</td>
                                <td className="py-3 text-right text-sm font-bold">₹{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-16">
                    <div className="w-1/2">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-xs font-bold uppercase">Subtotal</span>
                            <span className="text-sm">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-xs font-bold uppercase">Delivery</span>
                            <span className="text-sm">Free</span>
                        </div>
                        <div className="flex justify-between py-4 border-b-2 border-black mt-2">
                            <span className="text-base font-bold uppercase">Total</span>
                            <span className="text-xl font-bold">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center text-[10px] uppercase tracking-widest text-gray-400 mt-20 pt-8 border-t border-gray-100">
                    Thank you for your business - Govigi
                </div>
            </div>

            {/* SCREEN LAYOUT (Hidden on print) */}
            <div className="min-h-screen bg-gray-50 font-mono text-gray-900 pb-12 selection:bg-black selection:text-white print:hidden">
                {/* Top Navigation & Actions Bar */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:h-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => router.back()}
                                className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <h1 className="text-lg font-bold tracking-tight text-gray-900">
                                Order #{order.orderId}
                            </h1>
                        </div>

                        {/* Top Action Area: Status Selectors & Save */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 order-2 md:order-1">
                                <select
                                    value={statusBuffer.status}
                                    onChange={(e) => handleStatusChange('status', e.target.value)}
                                    className="bg-transparent text-xs font-bold uppercase tracking-wider py-2 md:py-1.5 pl-3 pr-8 rounded-md focus:ring-0 border-none cursor-pointer hover:bg-white transition-colors w-full md:w-auto"
                                >
                                    {ORDER_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                                    <option value={CANCELLED_STEP}>Cancelled</option>
                                </select>
                                <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                                <div className="md:hidden h-px w-full bg-gray-200"></div>
                                <select
                                    value={statusBuffer.paymentStatus}
                                    onChange={(e) => handleStatusChange('paymentStatus', e.target.value)}
                                    className={`bg-transparent text-xs font-bold uppercase tracking-wider py-2 md:py-1.5 pl-3 pr-8 rounded-md focus:ring-0 border-none cursor-pointer hover:bg-white transition-colors w-full md:w-auto ${statusBuffer.paymentStatus === "Paid" ? "text-green-700" : "text-gray-900"
                                        }`}
                                >
                                    <option value="Pending">Payment: Pending</option>
                                    <option value="Paid">Payment: Paid</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 order-1 md:order-2">
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={!hasChanges || updating}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${hasChanges
                                        ? "bg-black text-white hover:bg-gray-800 shadow-md transform active:scale-95"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    {updating ? "Saving..." : "Save Changes"}
                                </button>

                                <button
                                    onClick={handlePrint}
                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                    title="Print Order"
                                >
                                    <PrinterIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">

                    {/* Reference-Style Stepper */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
                        {isCancelled ? (
                            <div className="flex items-center justify-center gap-3 text-red-600 bg-red-50 py-4 rounded-lg border border-red-100">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                <span className="font-bold uppercase tracking-widest text-sm">Order Cancelled</span>
                            </div>
                        ) : (
                            <div className="relative flex items-center justify-between w-full px-4">
                                {/* Line Background */}
                                <div className="absolute left-0 top-1/2 w-full h-px bg-gray-200 -z-0"></div>

                                {ORDER_STEPS.map((step, idx) => {
                                    const isCompleted = currentStepIndex > idx;
                                    const isActive = currentStepIndex === idx;
                                    const isFuture = currentStepIndex < idx;

                                    return (
                                        <div key={step} className="relative z-10 flex flex-col items-center bg-white px-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                                ? "bg-green-500 border-green-500 text-white"
                                                : isActive
                                                    ? "bg-black border-black text-white"
                                                    : "bg-white border-gray-300 text-gray-400"
                                                }`}>
                                                {isCompleted ? (
                                                    <CheckIcon className="w-4 h-4 stroke-[3]" />
                                                ) : (
                                                    <span className="text-xs font-bold">{idx + 1}</span>
                                                )}
                                            </div>
                                            <span className={`absolute top-10 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                                                }`}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Products (Main Content) - col-span-8 */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                        Product List
                                    </h3>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">{order.products.length} Items</span>
                                </div>

                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-50">
                                            {order.products.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                                                {item.image ? (
                                                                    <img src={item.image} alt="" className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-[9px] text-gray-400">IMG</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                                    {typeof item.productId === 'string'
                                                                        ? item.productId.slice(-6)
                                                                        : (item.productId?._id ? item.productId._id.slice(-6) : 'N/A')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 font-mono">
                                                        ₹{item.price}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-bold font-mono">
                                                        {item.quantity} {item.unit}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-bold font-mono">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Customer & Summary - col-span-4 */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Summary Card */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Payment Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-mono text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Tax (0%)</span>
                                        <span className="font-mono text-gray-900">₹0</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Delivery</span>
                                        <span className="font-mono text-green-600">Free</span>
                                    </div>
                                    <div className="h-px w-full bg-gray-100 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-bold text-gray-900 uppercase tracking-tight">Total Price</span>
                                        <span className="text-xl font-bold font-mono text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className={`mt-6 p-3 rounded-lg flex items-center justify-center gap-2 border ${isPaid ? "bg-green-50 border-green-100 text-green-700" : "bg-yellow-50 border-yellow-100 text-yellow-700"
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${isPaid ? "bg-green-500" : "bg-yellow-500"}`}></div>
                                    <span className="text-xs font-bold uppercase tracking-widest">
                                        {isPaid ? "Payment Verified" : "Payment Pending"}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-fit">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                        <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Customer Info</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Contact Person</label>
                                        <div className="text-sm font-bold text-gray-900 mt-1">{order.customer}</div>
                                        <div className="text-xs text-gray-500">{order.contactPerson}</div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Phone Number</label>
                                        <div className="mt-1">
                                            <a href={`tel:${order.customerPhone}`} className="text-sm font-medium text-gray-900 hover:underline">
                                                {order.customerPhone}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-start gap-3">
                                            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-1">Shipping Address</label>
                                                <div className="text-sm text-gray-700 leading-relaxed font-medium">
                                                    {order.customerAddress}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
