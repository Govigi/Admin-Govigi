"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PrinterIcon, PhoneIcon, MapPinIcon, UserIcon, CheckIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { OrderSummaryUrl } from "../../../libs/utils/API/endpoints";
import axios from "axios";

const ORDER_STEPS = ["Pending", "Confirmed", "Shipped", "Delivered"];
const CANCELLED_STEP = "Cancelled";
const CUSTOMER_STEPS = ["Order Placed", "Out for Delivery", "Delivered"];

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

            if (statusBuffer.status !== order.status) {
                await axios.patch(OrderSummaryUrl.updateorderStatus(order.id),
                    { status: statusBuffer.status },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

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
            <div className="min-h-screen flex items-center justify-center bg-white font-mono text-xs tracking-widest text-gray-400 uppercase">
                LOADING ORDER DETAILS...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white font-mono text-gray-500">
                <div className="mb-4 text-xs tracking-widest uppercase font-bold">Order Not Found</div>
                <button
                    onClick={() => router.back()}
                    className="underline hover:text-black text-xs font-bold uppercase tracking-widest"
                >
                    RETURN TO SUMMARY
                </button>
            </div>
        );
    }

    const isCancelled = order.status === CANCELLED_STEP;
    const isPaid = order.paymentStatus === "Paid";

    const getStepStatus = (currentStatus: string, stepIndex: number) => {
        const statusLower = currentStatus?.toLowerCase() || "pending";
        
        let currentActiveIdx = 0;
        if (["shipped", "out for delivery", "out_for_delivery", "dispatched"].includes(statusLower)) {
            currentActiveIdx = 1;
        } else if (["delivered", "completed"].includes(statusLower)) {
            currentActiveIdx = 2;
        }
        
        if (stepIndex < currentActiveIdx) return "completed";
        if (stepIndex === currentActiveIdx) return "active";
        return "upcoming";
    };

    return (
        <>
            {/* PRINT-ONLY INVOICE LAYOUT */}
            <div className="hidden print:block font-mono p-8 text-black bg-white">
                <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2">GOVIGI</h1>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-550">Premium Grocery Supply</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold uppercase mb-1">Invoice / Receipt</h2>
                        <div className="text-xs font-bold">Order #{order.orderId}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex justify-between mb-16 gap-12">
                    <div className="flex-1">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Bill To / Ship To</h3>
                        <div className="text-xs font-bold uppercase">{order.customer}</div>
                        <div className="text-[10px] mt-1 font-bold">{order.contactPerson}</div>
                        <div className="text-[10px] mt-1 font-bold">{order.customerPhone}</div>
                        <div className="text-[10px] mt-2 text-gray-600 leading-relaxed w-3/4 font-bold">{order.customerAddress}</div>
                    </div>
                    <div className="flex-1 text-right">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Details</h3>
                        <div className="flex justify-end gap-2 text-[10px] mb-2 font-bold">
                            <span className="text-gray-400">Payment Status:</span>
                            <span className={`uppercase ${isPaid ? "text-green-700" : "text-amber-700"}`}>{order.paymentStatus}</span>
                        </div>
                        <div className="flex justify-end gap-2 text-[10px] mb-2 font-bold">
                            <span className="text-gray-400">Order Status:</span>
                            <span className="uppercase">{order.status}</span>
                        </div>
                    </div>
                </div>

                <table className="w-full mb-12 border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left text-[10px] font-bold uppercase py-3">Item</th>
                            <th className="text-right text-[10px] font-bold uppercase py-3">Price</th>
                            <th className="text-right text-[10px] font-bold uppercase py-3">Qty</th>
                            <th className="text-right text-[10px] font-bold uppercase py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.products.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-200">
                                <td className="py-4 text-xs">
                                    <div className="font-bold text-gray-950">{item.name.toUpperCase()}</div>
                                </td>
                                <td className="py-4 text-right text-xs font-bold">₹{item.price}</td>
                                <td className="py-4 text-right text-xs font-bold">{item.quantity} {item.unit.toUpperCase()}</td>
                                <td className="py-4 text-right text-xs font-bold text-gray-950">₹{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-16">
                    <div className="w-1/2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-[10px] font-bold uppercase text-gray-450">Subtotal</span>
                            <span className="text-xs font-bold">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-[10px] font-bold uppercase text-gray-450">Delivery</span>
                            <span className="text-xs font-bold text-green-700">Free</span>
                        </div>
                        <div className="flex justify-between py-4 border-b-2 border-black mt-2">
                            <span className="text-xs font-bold uppercase">Total</span>
                            <span className="text-sm font-bold">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center text-[9px] uppercase tracking-widest text-gray-450 mt-20 pt-8 border-t border-gray-100 font-bold">
                    Thank you for your business - Govigi
                </div>
            </div>

            {/* SCREEN LAYOUT (Hidden on print) */}
            <div className="min-h-screen bg-white font-mono text-gray-900 pb-12 selection:bg-black selection:text-white print:hidden">
                {/* Top Navigation & Actions Bar */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-50 border border-gray-100 rounded-none text-gray-500 transition-colors"
                            >
                                <ArrowLeftIcon className="w-4 h-4" />
                            </button>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <h1 className="text-sm font-bold uppercase tracking-widest text-gray-950">
                                Order #{order.orderId}
                            </h1>
                        </div>

                        {/* Top Action Area: Status Selectors & Save */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:w-auto w-full">
                            <div className="flex bg-gray-50 p-1 border border-gray-200 shadow-sm">
                                <select
                                    value={statusBuffer.status}
                                    onChange={(e) => handleStatusChange('status', e.target.value)}
                                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest py-1.5 pl-3 pr-8 focus:ring-0 border-none cursor-pointer hover:bg-white rounded-none transition-colors font-mono"
                                >
                                    {ORDER_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                                    <option value={CANCELLED_STEP}>Cancelled</option>
                                </select>
                                <div className="w-px h-5 bg-gray-300 self-center mx-1"></div>
                                <select
                                    value={statusBuffer.paymentStatus}
                                    onChange={(e) => handleStatusChange('paymentStatus', e.target.value)}
                                    className={`bg-transparent text-[10px] font-bold uppercase tracking-widest py-1.5 pl-3 pr-8 focus:ring-0 border-none cursor-pointer hover:bg-white rounded-none transition-colors font-mono ${
                                        statusBuffer.paymentStatus === "Paid" ? "text-green-700" : "text-gray-950"
                                    }`}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={!hasChanges || updating}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        hasChanges
                                            ? "bg-gray-950 text-white hover:bg-gray-800 shadow-sm"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                    }`}
                                >
                                    {updating ? "Saving..." : "Save Changes"}
                                </button>

                                <button
                                    onClick={handlePrint}
                                    className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-100 border border-gray-200 bg-white rounded-none transition-colors"
                                    title="Print Order"
                                >
                                    <PrinterIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT COLUMN: Products & Vendor info (Main Content) - col-span-8 */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Product List Card */}
                            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        Ordered Items
                                    </h3>
                                    <span className="bg-gray-150 text-gray-700 px-3 py-1 border border-gray-200 text-[9px] font-bold uppercase tracking-widest">
                                        {order.products.length} Item{order.products.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                                <th className="px-6 py-3 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                                                <th className="px-6 py-3 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                                                <th className="px-6 py-3 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {order.products.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-55/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                                {item.image ? (
                                                                    <img src={item.image} alt="" className="h-full w-full object-contain" />
                                                                ) : (
                                                                    <PhotoIcon className="w-5 h-5 text-gray-300" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-gray-950 uppercase leading-snug">{item.name}</div>
                                                                {item.vendorId && (
                                                                    <div className="text-[8px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-none w-fit mt-1 font-bold uppercase tracking-widest">
                                                                        Vendor: {item.vendorId.businessName || "Assigned"}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-600 font-bold">
                                                        ₹{item.price}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-950 font-bold">
                                                        {item.quantity} {item.unit.toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-950 font-bold">
                                                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Assigned Vendor Details Card (Clearly Displayed) */}
                            {order.vendorId && (
                                <div className="bg-white border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-6 h-6 bg-gray-50 flex items-center justify-center border border-gray-200">
                                            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Assigned Vendor</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Business Name</label>
                                            <div className="text-xs font-bold text-gray-950 mt-1 uppercase">{order.vendorId.businessName || "N/A"}</div>
                                        </div>
                                        {order.vendorId.contactPerson && (
                                            <div>
                                                <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Contact Person</label>
                                                <div className="text-xs text-gray-700 font-bold mt-1 uppercase">{order.vendorId.contactPerson}</div>
                                            </div>
                                        )}
                                        {order.vendorId.phone && (
                                            <div>
                                                <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Phone Number</label>
                                                <div className="text-xs font-bold mt-1">
                                                    <a href={`tel:${order.vendorId.phone}`} className="hover:underline text-blue-700">
                                                        {order.vendorId.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {order.vendorId.address && (
                                            <div className="md:col-span-2">
                                                <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Vendor Address</label>
                                                <div className="text-xs text-gray-600 leading-relaxed font-bold mt-1 uppercase">{order.vendorId.address}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Stepper, Customer, Payment - col-span-4 */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Vertical Stepper Timeline (Properly Placed Side Stepper mapped to customer status) */}
                            <div className="bg-white border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
                                    Order Status Progress
                                </h3>
                                {isCancelled ? (
                                    <div className="flex items-center gap-3 text-red-700 bg-red-50 border border-red-200 p-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse"></div>
                                        <span className="font-bold uppercase tracking-widest text-[10px]">Order Cancelled</span>
                                    </div>
                                ) : (
                                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-8 ml-3">
                                        {CUSTOMER_STEPS.map((step, idx) => {
                                            const status = getStepStatus(order.status, idx);
                                            const isCompleted = status === "completed";
                                            const isActive = status === "active";
                                            
                                            return (
                                                <div key={step} className="relative">
                                                    {/* Stepper Dot */}
                                                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-none border-2 flex items-center justify-center transition-all duration-300 ${
                                                        isCompleted
                                                            ? "bg-black border-black text-white"
                                                            : isActive
                                                                ? "bg-black border-black text-white"
                                                                : "bg-white border-gray-300 text-gray-400"
                                                    }`}>
                                                        {isCompleted && (
                                                            <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
                                                        )}
                                                    </div>
                                                    {/* Stepper Info */}
                                                    <div>
                                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${
                                                            isActive || isCompleted ? "text-gray-950" : "text-gray-400"
                                                        }`}>
                                                            {step}
                                                        </p>
                                                        {isActive && (
                                                            <p className="text-[9px] text-gray-400 mt-0.5 font-bold uppercase tracking-wider">
                                                                Current Stage
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Payment Summary Card */}
                            <div className="bg-white border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Payment Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="text-gray-950">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold uppercase">
                                        <span className="text-gray-400">Delivery</span>
                                        <span className="text-green-700">Free</span>
                                    </div>
                                    <div className="h-px w-full bg-gray-200 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Total Price</span>
                                        <span className="text-lg font-bold text-gray-950">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                <div className={`mt-6 py-2 px-4 border flex items-center justify-center gap-2 ${
                                    isPaid ? "bg-green-50 border-green-200 text-green-700" : "bg-yellow-50 border-yellow-200 text-yellow-700"
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-green-600" : "bg-yellow-600"}`}></div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest">
                                        {isPaid ? "Payment Verified" : "Payment Pending"}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Info Card */}
                            <div className="bg-white border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-6 h-6 bg-gray-50 flex items-center justify-center border border-gray-200">
                                        <UserIcon className="w-3.5 h-3.5 text-gray-600" />
                                    </div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer Info</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Contact Name</label>
                                        <div className="text-xs font-bold text-gray-950 mt-1 uppercase">{order.customer}</div>
                                        {order.contactPerson && <div className="text-[10px] text-gray-500 font-bold mt-0.5 uppercase">{order.contactPerson}</div>}
                                    </div>

                                    <div>
                                        <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Phone Number</label>
                                        <div className="mt-1">
                                            <a href={`tel:${order.customerPhone}`} className="text-xs font-bold text-blue-700 hover:underline">
                                                {order.customerPhone}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-start gap-3">
                                            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold block mb-1">Shipping Address</label>
                                                <div className="text-xs text-gray-600 leading-relaxed font-bold uppercase">
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
