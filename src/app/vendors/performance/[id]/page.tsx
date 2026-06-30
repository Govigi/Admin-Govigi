"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ArrowLeftIcon,
    StarIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    PlusIcon,
    BanknotesIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { getVendorsPerformance, recordVendorPayout } from "../../../../libs/vendorService";

interface Review {
    _id: string;
    customerId?: {
        customerName: string;
    };
    productId?: {
        name: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
}

interface SourcedOrder {
    _id: string;
    createdAt: string;
    sourcingStatus?: string;
    totalAmount?: number;
    items?: Array<{
        productId?: {
            name: string;
        };
        quantityKg?: number;
        price?: number;
        sourcingStatus?: string;
    }>;
}

interface Payout {
    _id: string;
    amount: number;
    paymentMethod: string;
    referenceId: string;
    remarks?: string;
    createdAt: string;
}

interface VendorPerformance {
    _id: string;
    businessName: string;
    vendorCode: string;
    contactPerson: string;
    phone: string;
    email: string;
    rating: number;
    joinedDate: string;
    address?: string | { formattedAddress?: string };
    supportedCategories: string[];
    performance: {
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
        rejectedOrders: number;
        totalEarnings: number;
        outstandingBalance: number;
        fulfillmentRate: number;
    };
    ratingDistribution?: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
        total: number;
    };
    reviews?: Review[];
    sourcedOrders?: SourcedOrder[];
    payoutHistory?: Payout[];
}

export default function VendorPerformanceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params?.id as string;

    const [vendor, setVendor] = useState<VendorPerformance | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "payouts" | "orders">("overview");

    // Payout modal state
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
    const [referenceId, setReferenceId] = useState("");
    const [remarks, setRemarks] = useState("");
    const [submittingPayout, setSubmittingPayout] = useState(false);

    useEffect(() => {
        if (vendorId) {
            fetchVendorData();
        }
    }, [vendorId]);

    const fetchVendorData = async () => {
        try {
            setLoading(true);
            const data = await getVendorsPerformance();
            if (Array.isArray(data)) {
                const found = data.find((v: any) => v._id === vendorId);
                setVendor(found || null);
            }
        } catch (error) {
            console.error("Failed to fetch vendor detail", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePayout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor || !payoutAmount || !referenceId) return;

        try {
            setSubmittingPayout(true);
            await recordVendorPayout({
                vendorId: vendor._id,
                amount: parseFloat(payoutAmount),
                paymentMethod,
                referenceId,
                remarks
            });
            setIsPayoutModalOpen(false);
            setPayoutAmount("");
            setReferenceId("");
            setRemarks("");
            fetchVendorData();
        } catch (error) {
            console.error("Failed to create payout", error);
        } finally {
            setSubmittingPayout(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 font-mono text-xs uppercase tracking-widest text-gray-400">
                <div className="w-6 h-6 border-2 border-gray-100 border-t-[#10b981] rounded-full animate-spin"></div>
                Loading Partner Scorecard...
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-white p-8 font-mono text-xs text-gray-500 uppercase tracking-widest flex flex-col items-center justify-center gap-4">
                Vendor Performance Profile Not Found
                <button onClick={() => router.push("/vendors/performance")} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-black font-bold uppercase">
                    Back to Performance
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 text-gray-900 w-full overflow-x-hidden pb-24">
            
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <button 
                        onClick={() => router.push("/vendors/performance")}
                        className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-none transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900">
                                {vendor.businessName}
                            </h1>
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-none font-mono font-bold uppercase">
                                Verified Partner
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wider font-mono">
                            Vendor Code: {vendor.vendorCode || "N/A"} • Joined: {new Date(vendor.joinedDate || Date.now()).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsPayoutModalOpen(true)}
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-xs font-bold uppercase rounded-none flex items-center gap-1.5 transition-colors font-mono"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        Record Payout
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-4 border border-gray-200 bg-gray-50/30 flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Sourced Earnings</span>
                    <span className="text-lg font-black mt-2 font-mono text-gray-900">₹{vendor.performance?.totalEarnings.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-4 border border-emerald-100 bg-emerald-50/20 flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Outstanding Balance</span>
                    <span className="text-lg font-black mt-2 font-mono text-emerald-700">₹{vendor.performance?.outstandingBalance.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-4 border border-gray-200 bg-gray-50/30 flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Fulfillment Rate</span>
                    <span className="text-lg font-black mt-2 font-mono text-gray-900">{vendor.performance?.fulfillmentRate}%</span>
                </div>
                <div className="p-4 border border-gray-200 bg-gray-50/30 flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Overall rating</span>
                    <div className="flex items-center gap-1 mt-2 text-amber-500 font-mono text-lg font-black">
                        <StarIcon className="w-4 h-4 fill-amber-500 text-amber-500" />
                        {(vendor.rating || 0).toFixed(1)}
                    </div>
                </div>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-gray-200 mb-6 font-mono text-xs uppercase font-bold">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-3 px-6 border-b-2 transition-all ${activeTab === "overview" ? "border-[#10b981] text-[#10b981]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                    Overview & Reviews
                </button>
                <button
                    onClick={() => setActiveTab("payouts")}
                    className={`pb-3 px-6 border-b-2 transition-all ${activeTab === "payouts" ? "border-[#10b981] text-[#10b981]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                    Payout Ledger ({vendor.payoutHistory?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab("orders")}
                    className={`pb-3 px-6 border-b-2 transition-all ${activeTab === "orders" ? "border-[#10b981] text-[#10b981]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                    Sourced Orders ({vendor.sourcedOrders?.length || 0})
                </button>
            </div>

            {/* Tab Body */}
            <div>
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="border border-gray-200 p-5 space-y-4">
                                <h3 className="font-bold uppercase tracking-wider text-gray-900 text-xs border-l-2 border-black pl-2 font-mono">
                                    Contact & Profile
                                </h3>
                                <div className="space-y-3 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold w-20 text-gray-400 uppercase font-mono">Owner:</span>
                                        <span className="font-bold text-gray-800 uppercase">{vendor.contactPerson}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-mono">{vendor.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-mono text-gray-800">{vendor.email}</span>
                                    </div>
                                    {vendor.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPinIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                                            <span>
                                                {typeof vendor.address === "string" 
                                                    ? vendor.address 
                                                    : vendor.address.formattedAddress || "N/A"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border border-gray-200 p-5 space-y-3">
                                <h3 className="font-bold uppercase tracking-wider text-gray-900 text-xs border-l-2 border-black pl-2 font-mono">
                                    Sourcing Scope
                                </h3>
                                <div className="flex gap-1.5 flex-wrap">
                                    {vendor.supportedCategories?.map((cat, idx) => (
                                        <span key={idx} className="px-2.5 py-1 bg-gray-50 text-[10px] font-bold border border-gray-200 rounded-none uppercase font-mono text-gray-600">
                                            {cat}
                                        </span>
                                    )) || <span className="text-gray-400 italic text-xs">No Categories registered</span>}
                                </div>
                            </div>
                        </div>

                        {/* Ratings & Comments */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Star breakdown progress bars */}
                            <div className="border border-gray-200 p-5">
                                <h3 className="font-bold uppercase tracking-wider text-gray-900 text-xs border-l-2 border-black pl-2 font-mono mb-4">
                                    Rating Distribution
                                </h3>
                                <div className="space-y-2.5 max-w-md bg-gray-50/50 p-4 border border-gray-100">
                                    {[5, 4, 3, 2, 1].map((stars) => {
                                        const dist = vendor.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
                                        const count = (dist as any)[stars] || 0;
                                        const pct = dist.total > 0 ? (count / dist.total) * 100 : 0;
                                        return (
                                            <div key={stars} className="flex items-center gap-3 text-xs">
                                                <span className="w-8 font-bold text-gray-600 font-mono text-right">{stars} ★</span>
                                                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="w-16 text-gray-500 font-mono text-right">{count} ({pct.toFixed(0)}%)</span>
                                            </div>
                                        );
                                    })}
                                    <div className="text-[10px] text-gray-400 text-right font-mono mt-1">
                                        Total Ratings: {vendor.ratingDistribution?.total || 0}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Review Comments */}
                            <div className="border border-gray-200 p-5">
                                <h3 className="font-bold uppercase tracking-wider text-gray-900 text-xs border-l-2 border-black pl-2 font-mono mb-4">
                                    Customer Reviews ({vendor.reviews?.length || 0})
                                </h3>
                                <div className="space-y-4">
                                    {vendor.reviews && vendor.reviews.length > 0 ? (
                                        vendor.reviews.map((rev) => (
                                            <div key={rev._id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs uppercase text-gray-800">
                                                            {rev.customerId?.customerName || "Customer"}
                                                        </span>
                                                        <div className="flex items-center text-amber-500 gap-0.5 text-[10px] font-mono">
                                                            <StarIcon className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                            {rev.rating}
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] text-gray-400 font-mono">
                                                        {new Date(rev.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {rev.productId && (
                                                    <div className="text-[9px] text-emerald-600 font-mono uppercase mb-1">
                                                        Product: {rev.productId.name}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-600 italic">
                                                    "{rev.comment || "No comment left"}"
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-xs text-gray-400 uppercase tracking-widest font-mono">
                                            No Reviews Received Yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "payouts" && (
                    <div className="border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 font-mono text-[10px] uppercase text-gray-400 font-bold">
                                        <th className="py-3.5 px-6">Date</th>
                                        <th className="py-3.5 px-6">Reference ID</th>
                                        <th className="py-3.5 px-6">Payment Method</th>
                                        <th className="py-3.5 px-6">Remarks</th>
                                        <th className="py-3.5 px-6 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs text-gray-700 divide-y divide-gray-100">
                                    {vendor.payoutHistory && vendor.payoutHistory.length > 0 ? (
                                        vendor.payoutHistory.map((p) => (
                                            <tr key={p._id} className="hover:bg-gray-50">
                                                <td className="py-4 px-6 font-mono">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                <td className="py-4 px-6 font-mono font-bold uppercase text-gray-900">{p.referenceId}</td>
                                                <td className="py-4 px-6 font-mono uppercase text-gray-500">{p.paymentMethod}</td>
                                                <td className="py-4 px-6 text-gray-400">{p.remarks || "—"}</td>
                                                <td className="py-4 px-6 text-right font-mono font-bold text-gray-900">₹{p.amount.toLocaleString("en-IN")}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-400 uppercase tracking-widest font-mono">
                                                No Payout Logs Recorded
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 font-mono text-[10px] uppercase text-gray-400 font-bold">
                                        <th className="py-3.5 px-6">Order ID</th>
                                        <th className="py-3.5 px-6">Date</th>
                                        <th className="py-3.5 px-6">Sourcing Status</th>
                                        <th className="py-3.5 px-6">Items Sourced</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs text-gray-700 divide-y divide-gray-100">
                                    {vendor.sourcedOrders && vendor.sourcedOrders.length > 0 ? (
                                        vendor.sourcedOrders.map((ord) => {
                                            const status = ord.sourcingStatus || "Pending";
                                            return (
                                                <tr key={ord._id} className="hover:bg-gray-50">
                                                    <td className="py-4 px-6 font-mono font-bold text-gray-900 uppercase">#{ord._id.slice(-6)}</td>
                                                    <td className="py-4 px-6 font-mono">{new Date(ord.createdAt).toLocaleDateString()}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2 py-0.5 rounded-none font-bold text-[9px] uppercase border font-mono
                                                            ${["Delivered", "Completed"].includes(status) ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                              ["Rejected", "Cancelled"].includes(status) ? "bg-red-50 text-red-600 border-red-100" :
                                                              "bg-amber-50 text-amber-600 border-amber-100"}
                                                        `}>
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 font-mono text-gray-500">
                                                        {(ord.items || [])
                                                            .filter((it) => it.productId)
                                                            .map((it) => `${it.productId?.name} (${it.quantityKg || 0} kg)`)
                                                            .join(", ") || "No items"}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-400 uppercase tracking-widest font-mono">
                                                No Sourced Orders Logged
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Record Payout Modal */}
            {isPayoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
                        
                        <div className="p-5 border-b-2 border-black flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-wider font-mono text-gray-500">Settlements</h3>
                                <h2 className="text-sm font-black uppercase text-gray-900 flex items-center gap-1.5">
                                    <BanknotesIcon className="w-4 h-4 text-emerald-500" />
                                    Record Vendor Payout
                                </h2>
                            </div>
                            <button onClick={() => setIsPayoutModalOpen(false)} className="text-gray-400 hover:text-black">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePayout} className="p-5 space-y-4 font-mono text-xs">
                            <div className="space-y-1.5">
                                <label className="block text-gray-500 uppercase tracking-wider text-[9px] font-bold">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    placeholder="ENTER PAYOUT AMOUNT..."
                                    className="w-full px-3 py-2 border border-gray-200 text-xs focus:outline-none focus:border-black rounded-none uppercase"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-gray-500 uppercase tracking-wider text-[9px] font-bold">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs focus:outline-none focus:border-black rounded-none bg-transparent uppercase cursor-pointer"
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Cash">Cash</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-gray-500 uppercase tracking-wider text-[9px] font-bold">Reference / Transaction ID</label>
                                <input
                                    type="text"
                                    required
                                    value={referenceId}
                                    onChange={(e) => setReferenceId(e.target.value)}
                                    placeholder="TXN ID OR REFERENCE NO..."
                                    className="w-full px-3 py-2 border border-gray-200 text-xs focus:outline-none focus:border-black rounded-none uppercase"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-gray-500 uppercase tracking-wider text-[9px] font-bold">Remarks (Optional)</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="ANY REMARKS OR NOTES..."
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs focus:outline-none focus:border-black rounded-none uppercase resize-none"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                                <button 
                                    type="button"
                                    onClick={() => setIsPayoutModalOpen(false)}
                                    className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-[10px] font-bold uppercase rounded-none"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submittingPayout}
                                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 text-[10px] font-bold uppercase rounded-none"
                                >
                                    {submittingPayout ? "SUBMITTING..." : "CONFIRM PAYOUT"}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}
