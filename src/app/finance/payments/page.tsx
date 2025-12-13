"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { OrderSummaryUrl } from "@/src/libs/utils/API/endpoints";
import {
    MagnifyingGlassIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChevronDownIcon,
    ArrowPathIcon,
    ListBulletIcon,
    UserGroupIcon,
    MinusCircleIcon
} from "@heroicons/react/24/outline";

// --- Industrial Components ---

const IndustrialFilter = ({
    title,
    options,
    selected,
    onChange
}: {
    title: string,
    options: string[],
    selected: string[],
    onChange: (val: string[]) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (opt: string) => {
        if (selected.includes(opt)) onChange(selected.filter(s => s !== opt));
        else onChange([...selected, opt]);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase font-bold border rounded-none transition-colors 
                    ${selected.length > 0 ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300 hover:border-black'}`}
            >
                {title} {selected.length > 0 && `(${selected.length})`}
                <ChevronDownIcon className="w-3 h-3" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl z-20">
                    <div className="p-2 space-y-1">
                        {options.map(opt => (
                            <div
                                key={opt}
                                onClick={() => toggleOption(opt)}
                                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs font-mono uppercase hover:bg-gray-50
                                    ${selected.includes(opt) ? 'text-black font-bold' : 'text-gray-500'}`}
                            >
                                <div className={`w-3 h-3 border flex items-center justify-center ${selected.includes(opt) ? 'bg-black border-black' : 'border-gray-300'}`}>
                                    {selected.includes(opt) && <div className="w-1.5 h-1.5 bg-white"></div>}
                                </div>
                                <span>{opt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Modal Component ---
const PaymentModal = ({
    isOpen,
    onClose,
    onConfirm,
    count
}: {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: (type: 'Paid' | 'Partial') => void,
    count: number
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-8 w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-bold uppercase tracking-widest mb-4">Update Payment</h2>
                <p className="font-mono text-sm text-gray-600 mb-8">
                    You are updating payment status for <span className="font-bold">{count}</span> order(s).
                    <br /><br />
                    <span className="text-xs text-gray-500">* Full Payment will credit the user's wallet.</span>
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onConfirm('Paid')}
                        className="w-full py-3 bg-black text-white font-mono uppercase font-bold text-sm hover:bg-gray-800 transition-colors"
                    >
                        Mark as Fully Paid
                    </button>
                    <button
                        onClick={() => onConfirm('Partial')}
                        className="w-full py-3 border-2 border-black text-black font-mono uppercase font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Mark as Partially Paid
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-gray-500 text-xs font-mono uppercase underline mt-2 hover:text-black"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function PaymentsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'group'>('list');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [methodFilter, setMethodFilter] = useState<string[]>([]);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(OrderSummaryUrl.getOrderDetails || "/api/orders", {
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const rawOrders = Array.isArray(data) ? data : (data.orders || []);
                setOrders(rawOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
        } catch (error) { console.error("Failed to fetch orders", error); }
        finally { setLoading(false); }
    };

    // Filter Logic
    const filteredOrders = useMemo(() => orders.filter(order => {
        const pStatus = (order.paymentStatus || "pending").toLowerCase();
        const pMethod = (order.paymentMethod || "cod").toLowerCase();
        const searchTerms = searchQuery.toLowerCase().split(" ");
        const searchString = `${order.orderId || ""} ${order._id || ""} ${order.customerId?.customerName || order.customerName || ""} ${order.customerId?.customerPhone || order.customerPhone || ""}`.toLowerCase();

        if (!searchTerms.every(term => searchString.includes(term))) return false;
        if (statusFilter.length > 0) {
            const normalizedStatus = pStatus === 'completed' ? 'paid' : pStatus;
            if (!statusFilter.some(filter => filter.toLowerCase() === normalizedStatus)) return false;
        }
        if (methodFilter.length > 0) {
            if (!methodFilter.some(filter => pMethod.includes(filter.toLowerCase()))) return false;
        }
        return true;
    }), [orders, searchQuery, statusFilter, methodFilter]);

    // Grouping Logic
    const groupedOrders = useMemo(() => {
        if (viewMode === 'list') return [];
        const groups: Record<string, any> = {};

        filteredOrders.forEach(order => {
            const cId = order.customerId?._id || 'guest';
            if (!groups[cId]) {
                groups[cId] = {
                    id: cId,
                    customer: order.customerId || { customerName: order.customerName || 'Guest', customerPhone: order.customerPhone },
                    orders: [],
                    totalAmount: 0,
                    totalPending: 0
                };
            }
            groups[cId].orders.push(order);
            groups[cId].totalAmount += (order.totalAmount || 0);
            if ((order.paymentStatus || 'pending').toLowerCase() !== 'paid') {
                groups[cId].totalPending += (order.totalAmount || 0);
            }
        });
        return Object.values(groups);
    }, [filteredOrders, viewMode]);

    // Selection Logic
    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = (subsetIds?: string[]) => {
        const idsToToggle = subsetIds || filteredOrders.map(o => o._id);
        const allSelected = idsToToggle.every(id => selectedIds.has(id));

        const newSet = new Set(selectedIds);
        if (allSelected) {
            idsToToggle.forEach(id => newSet.delete(id));
        } else {
            idsToToggle.forEach(id => newSet.add(id));
        }
        setSelectedIds(newSet);
    };

    // Payment Logic
    const handleBulkPayment = async (status: 'Paid' | 'Partial') => {
        setIsModalOpen(false);
        if (selectedIds.size === 0) return;

        const token = localStorage.getItem("admin_token");
        const updates = Array.from(selectedIds).map(id =>
            fetch(OrderSummaryUrl.updatePaymentStatus(id), {
                method: 'PATCH',
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ paymentStatus: status })
            })
        );

        try {
            await Promise.all(updates);
            // Optimistic Update
            setOrders(prev => prev.map(o =>
                selectedIds.has(o._id) ? { ...o, paymentStatus: status } : o
            ));
            setSelectedIds(new Set()); // Clear selection
        } catch (error) {
            console.error("Bulk update failed", error);
            alert("Some updates may have failed.");
        }
    };

    // --- Render Helpers ---

    const StatsBar = () => {
        const pending = filteredOrders.filter(o => (o.paymentStatus || '').toLowerCase() !== 'paid').reduce((s, o) => s + (o.totalAmount || 0), 0);
        const collected = filteredOrders.filter(o => (o.paymentStatus || '').toLowerCase() === 'paid').reduce((s, o) => s + (o.totalAmount || 0), 0);
        return (
            <div className="flex gap-6 mt-4 md:mt-0 font-mono text-xs">
                <div className="text-right">
                    <span className="text-gray-400 block uppercase tracking-wider">Visible Pending</span>
                    <span className="text-lg font-bold text-orange-600">₹{pending.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                    <span className="text-gray-400 block uppercase tracking-wider">Visible Collected</span>
                    <span className="text-lg font-bold text-emerald-600">₹{collected.toLocaleString('en-IN')}</span>
                </div>
            </div>
        );
    };

    const OrderRow = ({ order, showCustomer = true }: { order: any, showCustomer?: boolean }) => {
        const isPaid = (order.paymentStatus || 'pending').toLowerCase() === 'paid';
        const isPartial = (order.paymentStatus || '').toLowerCase() === 'partial';

        return (
            <tr
                key={order._id}
                className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedIds.has(order._id) ? 'bg-blue-50/30' : ''}`}
                onClick={(e) => {
                    // Prevent toggling when clicking buttons/inputs inside the row
                    if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                        toggleSelect(order._id);
                    }
                }}
            >
                <td className="p-4 pl-4 w-4">
                    <input
                        type="checkbox"
                        checked={selectedIds.has(order._id)}
                        onChange={() => toggleSelect(order._id)}
                        className="rounded-none border-gray-400 text-black focus:ring-black cursor-pointer"
                    />
                </td>
                <td className="p-4 pl-2 font-bold text-gray-900 border-r border-gray-50">
                    <div className="flex flex-col">
                        <span>{order.orderId || order._id?.slice(-6).toUpperCase()}</span>
                        <span className="text-[10px] text-gray-400 font-normal">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                </td>
                {showCustomer && (
                    <td className="p-4 border-r border-gray-50">
                        <div className="font-bold text-gray-800 uppercase text-xs">{order.customerId?.customerName || order.customerName || "GUEST"}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-wider">{order.customerId?.customerPhone || order.customerPhone || "N/A"}</div>
                    </td>
                )}
                <td className="p-4 text-center uppercase text-xs font-bold text-gray-500 border-r border-gray-50">{order.paymentMethod || "COD"}</td>
                <td className="p-4 pr-6 text-right font-bold text-gray-900 border-r border-gray-50">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                <td className="p-4 text-center border-r border-gray-50">
                    <span className={`text-[10px] uppercase px-2 py-1 rounded-none font-bold border inline-flex items-center gap-1
                        ${isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            isPartial ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                'bg-orange-50 text-orange-600 border-orange-100'}
                    `}>
                        {isPaid ? <CheckCircleIcon className="w-3 h-3" /> : isPartial ? <MinusCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                        {order.paymentStatus || "PENDING"}
                    </span>
                </td>
            </tr>
        );
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-sans text-gray-900 pb-24">
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleBulkPayment}
                count={selectedIds.size}
            />

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest border-l-4 border-black pl-4">Order Payments</h1>
                    <p className="text-xs text-gray-400 mt-1 pl-5 font-mono">System Payment Tracking</p>
                </div>
                <StatsBar />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="SEARCH ORDER / CUSTOMER..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-none text-xs font-mono uppercase focus:border-black focus:ring-0 outline-none transition-colors"
                        />
                    </div>
                    <IndustrialFilter title="Status" options={['Pending', 'Partial', 'Paid', 'Failed']} selected={statusFilter} onChange={setStatusFilter} />
                    <IndustrialFilter title="Method" options={['COD', 'Online', 'Wallet']} selected={methodFilter} onChange={setMethodFilter} />
                </div>

                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex border border-gray-300 mr-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                            title="List View"
                        >
                            <ListBulletIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('group')}
                            className={`p-2 transition-colors ${viewMode === 'group' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                            title="Group by Customer"
                        >
                            <UserGroupIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button onClick={fetchOrders} title="REFRESH" className="p-2 border border-gray-300 hover:bg-gray-100 text-gray-500">
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="border border-gray-200 rounded-none overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm font-mono">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4 pl-4 w-4">
                                    <input
                                        type="checkbox"
                                        checked={filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.has(o._id))}
                                        onChange={() => toggleSelectAll()}
                                        className="rounded-none border-gray-400 text-black focus:ring-black cursor-pointer"
                                    />
                                </th>
                                <th className="p-4 pl-2">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4 text-center">Mode</th>
                                <th className="p-4 pr-6 text-right">Amount</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <OrderRow key={order._id} order={order} />
                            )) : (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-400 italic font-mono text-xs uppercase">No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Group View */}
            {viewMode === 'group' && (
                <div className="space-y-4">
                    {groupedOrders.length > 0 ? groupedOrders.map(group => (
                        <div key={group.id} className="border border-gray-200 bg-white">
                            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={group.orders.every((o: any) => selectedIds.has(o._id))}
                                        onChange={() => toggleSelectAll(group.orders.map((o: any) => o._id))}
                                        className="rounded-none border-gray-400 text-black focus:ring-black cursor-pointer"
                                    />
                                    <div>
                                        <h3 className="font-bold text-sm uppercase">{group.customer.customerName}</h3>
                                        <p className="text-xs text-gray-500 font-mono">{group.customer.customerPhone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 text-xs font-mono">
                                    <div className="text-right">
                                        <span className="text-gray-400 uppercase">Orders</span>
                                        <p className="font-bold">{group.orders.length}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-400 uppercase">Pending</span>
                                        <p className="font-bold text-orange-600">₹{group.totalPending.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-400 uppercase">Total</span>
                                        <p className="font-bold text-gray-900">₹{group.totalAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Inner List (Simplified) */}
                            <div className="divide-y divide-gray-100">
                                <table className="w-full text-left text-sm font-mono">
                                    <tbody className="divide-y divide-gray-100">
                                        {group.orders.map((order: any) => (
                                            <OrderRow key={order._id} order={order} showCustomer={false} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-gray-400 italic font-mono text-xs uppercase border border-gray-200">No customers found.</div>
                    )}
                </div>
            )}

            {/* Bulk Action Bar - Sticky Bottom */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 shadow-2xl flex items-center gap-8 rounded-none z-40 w-[90%] md:w-auto border border-gray-800">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Selection</span>
                        <span className="font-bold font-mono">{selectedIds.size} Orders Selected</span>
                    </div>
                    <div className="h-8 w-px bg-gray-700"></div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-black px-6 py-2 font-bold uppercase text-xs hover:bg-gray-200 transition-colors"
                    >
                        Update Payment Status
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="text-gray-400 hover:text-white"
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}