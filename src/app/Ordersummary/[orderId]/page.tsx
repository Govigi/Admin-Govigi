"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PrinterIcon, PhoneIcon, MapPinIcon, UserIcon, CheckIcon, PhotoIcon, ShoppingBagIcon, CreditCardIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { OrderSummaryUrl } from "../../../libs/utils/API/endpoints";
import axios from "axios";
import Breadcrumbs from "../../../components/Global/Breadcrumbs";

const ORDER_STEPS = ["Pending", "Confirmed", "Shipped", "Delivered"];
const CANCELLED_STEP = "Cancelled";
const CUSTOMER_STEPS = ["Order Placed", "Out for Delivery", "Delivered"];

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`border border-gray-200 bg-white ${className}`}>{children}</section>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-3">{children}</h2>;
}

interface FieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}

function Field({
  label,
  required,
  optional,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400 font-sans">
        {label} {required && <span className="text-red-500">*</span>} {optional && <span className="font-normal">(OPTIONAL)</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full p-2 text-xs border border-gray-200 bg-gray-50/30 font-sans uppercase font-bold text-gray-700 select-all outline-none";

const selectClass =
  "w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors bg-white font-sans uppercase font-bold text-gray-900 cursor-pointer";

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [statusBuffer, setStatusBuffer] = useState({ status: "", paymentStatus: "" });
    const [hasChanges, setHasChanges] = useState(false);
    const [cancellationCharge, setCancellationCharge] = useState("0");
    const [cancellationNote, setCancellationNote] = useState("");
    const [processingCancellation, setProcessingCancellation] = useState(false);

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
                setCancellationCharge(String(o.cancellationRequest?.cancellationCharge || 0));
                setCancellationNote(o.cancellationRequest?.adminNote || "");
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

    const handleCancellationDecision = async (decision: "approve" | "reject") => {
        if (!order) return;
        if (decision === "approve" && !window.confirm("Approve cancellation and initiate the calculated Razorpay refund?")) {
            return;
        }

        setProcessingCancellation(true);
        try {
            const token = localStorage.getItem("admin_token");
            const endpoint = decision === "approve"
                ? OrderSummaryUrl.approveCancellation(order.id)
                : OrderSummaryUrl.rejectCancellation(order.id);

            await axios.patch(endpoint, {
                cancellationCharge: Number(cancellationCharge || 0),
                adminNote: cancellationNote.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchOrderDetails();
        } catch (error: any) {
            console.error("Failed to process cancellation request", error);
            alert(error.response?.data?.message || "Failed to process cancellation request");
        } finally {
            setProcessingCancellation(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-sans text-xs tracking-widest text-gray-400 uppercase">
                LOADING ORDER DETAILS...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-gray-500">
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
            <div className="hidden print:block font-sans p-8 text-black bg-white">
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
                                <td className="py-4 text-right text-xs font-bold">₹{Number(item.price).toFixed(2)}</td>
                                <td className="py-4 text-right text-xs font-bold">{item.quantity} {item.unit.toUpperCase()}</td>
                                <td className="py-4 text-right text-xs font-bold text-gray-950">₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-16">
                    <div className="w-1/2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-[10px] font-bold uppercase text-gray-450">Subtotal</span>
                            <span className="text-xs font-bold">₹{order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-[10px] font-bold uppercase text-gray-450">Delivery</span>
                            <span className="text-xs font-bold text-green-700">Free</span>
                        </div>
                        <div className="flex justify-between py-4 border-b-2 border-black mt-2">
                            <span className="text-xs font-bold uppercase">Total</span>
                            <span className="text-sm font-bold">₹{order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center text-[9px] uppercase tracking-widest text-gray-450 mt-20 pt-8 border-t border-gray-100 font-bold">
                    Thank you for your business - Govigi
                </div>
            </div>

            {/* SCREEN LAYOUT (Hidden on print) */}
            <div className="h-full lg:h-full bg-gray-50/50 p-4 lg:p-6 lg:pb-4 font-sans text-gray-900 overflow-hidden flex flex-col print:hidden">
                <div className="max-w-7xl w-full mx-auto flex flex-col flex-1 min-h-0 overflow-hidden">
                    
                    {/* Page Breadcrumbs */}
                    <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 shrink-0">
                        <Breadcrumbs 
                            items={[
                                { label: "Dashboard", href: "/Dashboard" },
                                { label: "Orders", href: "/Ordersummary" },
                                { label: `Order #${order.orderId}` }
                            ]}
                        />

                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex h-7 items-center gap-2 border border-gray-200 bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all"
                        >
                            <ArrowLeftIcon className="h-3 w-3" />
                            Back
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 lg:overflow-hidden">
                        
                        {/* Left Column: Status Configuration & Stepper Progress */}
                        <div className="lg:col-span-1 lg:h-full lg:flex lg:flex-col lg:overflow-hidden">
                            <Panel className="p-5 lg:h-full lg:overflow-y-auto shadow-sm flex flex-col justify-between">
                                
                                <div className="space-y-6">
                                    <SectionTitle>Status & Progress</SectionTitle>

                                    {/* Status Progress Stepper */}
                                    <div className="mb-6">
                                        {isCancelled ? (
                                            <div className="flex items-center gap-3 text-red-700 bg-red-500/10 border border-red-500/50 p-4">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                <span className="font-bold uppercase tracking-wider text-[10px]">Order Cancelled</span>
                                            </div>
                                        ) : (
                                            <div className="relative pl-6 border-l border-gray-200 space-y-6 ml-3">
                                                {CUSTOMER_STEPS.map((step, idx) => {
                                                    const status = getStepStatus(order.status, idx);
                                                    const isCompleted = status === "completed";
                                                    const isActive = status === "active";
                                                    
                                                    return (
                                                        <div key={step} className="relative">
                                                            {/* Stepper Dot */}
                                                            <div className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                                                isCompleted
                                                                    ? "bg-black border-black text-white"
                                                                    : isActive
                                                                        ? "bg-[#10b981] border-[#10b981] text-white"
                                                                        : "bg-white border-gray-200 text-gray-450"
                                                            }`}>
                                                                {isCompleted && (
                                                                    <CheckIcon className="w-2 h-2 stroke-[3] text-white" />
                                                                )}
                                                                {isActive && (
                                                                    <div className="w-1 h-1 bg-white rounded-full" />
                                                                )}
                                                            </div>
                                                            {/* Stepper Info */}
                                                            <div>
                                                                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                                                                    isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                                                                }`}>
                                                                    {step.toUpperCase()}
                                                                </p>
                                                                {isActive && (
                                                                    <p className="text-[8px] text-[#10b981] mt-0.5 font-bold uppercase tracking-widest">
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

                                    {/* Status Toggles / Selectors */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <Field label="Order Status">
                                            <select
                                                value={statusBuffer.status}
                                                onChange={(e) => handleStatusChange('status', e.target.value)}
                                                className={selectClass}
                                            >
                                                {ORDER_STEPS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                                {!(order.paymentMethod === "Online" && order.paymentStatus === "Paid") && (
                                                    <option value={CANCELLED_STEP}>{CANCELLED_STEP.toUpperCase()}</option>
                                                )}
                                            </select>
                                        </Field>

                                        <Field label="Payment Status">
                                            <select
                                                value={statusBuffer.paymentStatus}
                                                onChange={(e) => handleStatusChange('paymentStatus', e.target.value)}
                                                className={selectClass}
                                            >
                                                <option value="Pending">PENDING</option>
                                                <option value="Paid">PAID</option>
                                                <option value="Refund Initiating">REFUND INITIATING</option>
                                                <option value="Refund Initiated">REFUND INITIATED</option>
                                                <option value="Refund Processing">REFUND PROCESSING</option>
                                                <option value="Refunded">REFUNDED</option>
                                                <option value="Refund Failed">REFUND FAILED</option>
                                            </select>
                                        </Field>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleSaveChanges}
                                        disabled={!hasChanges || updating}
                                        className="w-full bg-black py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {updating ? "SAVING..." : "COMMIT CHANGES"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className="w-full border border-gray-200 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black hover:border-black transition-colors flex items-center justify-center gap-2"
                                    >
                                        <PrinterIcon className="w-4 h-4" />
                                        PRINT INVOICE
                                    </button>
                                </div>

                            </Panel>
                        </div>

                        {/* Right Columns: Orders Details Grid */}
                        <div className="lg:col-span-2 lg:h-full lg:overflow-y-auto pr-2 space-y-6 scrollbar-thin">
                            {order.cancellationRequest?.status && order.cancellationRequest.status !== "None" && (
                                <Panel className="p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                                        <h2 className="text-sm font-bold uppercase text-[#059669]">Cancellation & Refund</h2>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1">
                                            {order.cancellationRequest.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                        <Field label="Customer Reason">
                                            <div className={inputClass}>{order.cancellationRequest.reasonCode || "N/A"}</div>
                                        </Field>
                                        <Field label="Requested At">
                                            <div className={inputClass}>
                                                {order.cancellationRequest.requestedAt ? new Date(order.cancellationRequest.requestedAt).toLocaleString() : "N/A"}
                                            </div>
                                        </Field>
                                        {order.cancellationRequest.reasonText && (
                                            <div className="md:col-span-2">
                                                <Field label="Customer Note">
                                                    <div className="w-full p-2 text-xs border border-gray-200 bg-gray-50/30 font-sans font-bold text-gray-700">
                                                        {order.cancellationRequest.reasonText}
                                                    </div>
                                                </Field>
                                            </div>
                                        )}
                                    </div>

                                    {order.cancellationRequest.status === "Pending Approval" ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <Field label="Cancellation Charge (INR)">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={Math.max(0, order.totalAmount - (order.walletAmountUsed || 0))}
                                                        value={cancellationCharge}
                                                        onChange={(event) => setCancellationCharge(event.target.value)}
                                                        className={inputClass}
                                                    />
                                                </Field>
                                                <Field label="Estimated Refund">
                                                    <div className={inputClass}>
                                                        ₹{Math.max(0, order.totalAmount - (order.walletAmountUsed || 0) - Number(cancellationCharge || 0)).toFixed(2)}
                                                    </div>
                                                </Field>
                                                <div className="md:col-span-2">
                                                    <Field label="Admin Note" optional>
                                                        <textarea
                                                            value={cancellationNote}
                                                            onChange={(event) => setCancellationNote(event.target.value)}
                                                            className={`${inputClass} min-h-16 normal-case`}
                                                        />
                                                    </Field>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    disabled={processingCancellation}
                                                    onClick={() => handleCancellationDecision("approve")}
                                                    className="bg-[#059669] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
                                                >
                                                    {processingCancellation ? "PROCESSING..." : "APPROVE & INITIATE REFUND"}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={processingCancellation}
                                                    onClick={() => handleCancellationDecision("reject")}
                                                    className="border border-red-300 text-red-700 px-5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                                                >
                                                    REJECT REQUEST
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Field label="Refund Status">
                                                <div className={inputClass}>{order.refund?.status || "N/A"}</div>
                                            </Field>
                                            <Field label="Cancellation Charge">
                                                <div className={inputClass}>₹{Number(order.refund?.cancellationCharge || 0).toFixed(2)}</div>
                                            </Field>
                                            <Field label="Refund Amount">
                                                <div className={inputClass}>₹{Number(order.refund?.amount || 0).toFixed(2)}</div>
                                            </Field>
                                        </div>
                                    )}
                                </Panel>
                            )}
                            
                            {/* Ordered Items */}
                            <Panel className="p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                                    <h2 className="text-sm font-bold uppercase flex items-center gap-2 text-[#059669]">
                                        Ordered Items
                                    </h2>
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-[#10b981] px-2 py-0.5 border border-emerald-200">
                                        {order.products.length} ITEM{order.products.length !== 1 ? 'S' : ''}
                                    </span>
                                </div>

                                <div className="overflow-hidden border border-gray-200 mb-6">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                                                <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
                                                <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                                                <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {order.products.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50/20 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 bg-gray-50 border border-gray-150 overflow-hidden shrink-0 flex items-center justify-center">
                                                                {item.image ? (
                                                                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <PhotoIcon className="w-4 h-4 text-gray-300" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-gray-900 uppercase">{item.name}</div>
                                                                {item.vendorId && (
                                                                    <div className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700 w-fit mt-1">
                                                                        Vendor: {item.vendorId.businessName || "Assigned"}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs text-gray-500 font-sans font-bold">
                                                        ₹{Number(item.price).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs text-gray-800 font-sans font-bold">
                                                        {item.quantity} {item.unit.toUpperCase()}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs text-gray-900 font-sans font-black">
                                                        ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals Grid */}
                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    <div className="w-full md:w-80 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold uppercase">Subtotal</span>
                                            <span className="text-gray-900 font-sans font-black">₹{order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold uppercase">Delivery</span>
                                            <span className="text-emerald-600 font-black uppercase">Free</span>
                                        </div>
                                        <div className="h-px w-full bg-gray-200 my-1"></div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-900 font-bold uppercase">Total Price</span>
                                            <span className="text-gray-900 font-sans font-black text-base">₹{order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className={`mt-4 py-2 px-3 border flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-wider ${
                                            isPaid ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-amber-50 border-amber-300 text-amber-700"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                            <span>{isPaid ? "Payment Verified" : "Payment Pending"}</span>
                                        </div>
                                    </div>
                                </div>

                            </Panel>

                            {/* Customer Information */}
                            <Panel className="p-6 shadow-sm">
                                <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669] border-b border-gray-100 pb-3">
                                    Customer Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Contact Name">
                                        <div className={inputClass}>{order.customer}</div>
                                        {order.contactPerson && (
                                            <div className="text-[9px] text-gray-450 font-bold uppercase mt-1">
                                                Contact: {order.contactPerson}
                                            </div>
                                        )}
                                    </Field>
                                    <Field label="Phone Number">
                                        <div className={inputClass}>
                                            <a href={`tel:${order.customerPhone}`} className="text-[#10b981] hover:underline">
                                                {order.customerPhone}
                                            </a>
                                        </div>
                                    </Field>
                                    <div className="md:col-span-2">
                                        <Field label="Shipping Address">
                                            <div className="w-full p-2.5 text-xs border border-gray-200 bg-gray-50/30 font-sans font-bold text-gray-700 leading-relaxed min-h-16">
                                                {order.customerAddress}
                                            </div>
                                        </Field>
                                    </div>
                                </div>
                            </Panel>

                            {/* Assigned Vendor Details */}
                            {order.vendorId && (
                                <Panel className="p-6 shadow-sm">
                                    <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669] border-b border-gray-100 pb-3">
                                        Assigned Vendor Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Business Name">
                                            <div className={inputClass}>{order.vendorId.businessName || "N/A"}</div>
                                        </Field>
                                        {order.vendorId.contactPerson && (
                                            <Field label="Contact Person">
                                                <div className={inputClass}>{order.vendorId.contactPerson}</div>
                                            </Field>
                                        )}
                                        {order.vendorId.phone && (
                                            <Field label="Phone Number">
                                                <div className={inputClass}>
                                                    <a href={`tel:${order.vendorId.phone}`} className="text-[#10b981] hover:underline">
                                                        {order.vendorId.phone}
                                                    </a>
                                                </div>
                                            </Field>
                                        )}
                                        {order.vendorId.address && (
                                            <div className="md:col-span-2">
                                                <Field label="Vendor Address">
                                                    <div className="w-full p-2.5 text-xs border border-gray-200 bg-gray-50/30 font-sans uppercase font-bold text-gray-700 leading-relaxed min-h-16">
                                                        {order.vendorId.address}
                                                    </div>
                                                </Field>
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
