"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PhoneIcon } from "@heroicons/react/24/outline";

interface OrderDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
    onUpdateStatus: (orderId: string, status: string, type: 'order' | 'payment') => Promise<void>;
}

export default function OrderDetailsSheet({ isOpen, onClose, order, onUpdateStatus }: OrderDetailsSheetProps) {
    const [orderStatus, setOrderStatus] = useState(order?.status || "Pending");
    const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "Pending");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (order) {
            setOrderStatus(order.status);
            setPaymentStatus(order.paymentStatus);
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const handleSave = async () => {
        setUpdating(true);
        try {
            if (orderStatus !== order.status) {
                await onUpdateStatus(order.id, orderStatus, 'order');
            }
            if (paymentStatus !== order.paymentStatus) {
                await onUpdateStatus(order.id, paymentStatus, 'payment');
            }
            onClose();
        } catch (error) {
            console.error("Failed to update order", error);
        } finally {
            setUpdating(false);
        }
    };

    const statusColors: any = {
        "Pending": "bg-yellow-100 text-yellow-800",
        "Confirmed": "bg-blue-100 text-blue-800",
        "Shipped": "bg-indigo-100 text-indigo-800",
        "Delivered": "bg-green-100 text-green-800",
        "Cancelled": "bg-red-100 text-red-800",
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gray-400/75 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
                <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
                    <div className="w-screen max-w-md animate-in slide-in-from-right duration-300">
                        <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                            <div className="px-4 py-6 sm:px-6 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-start justify-between">
                                    <h2 className="text-lg font-medium text-gray-900" id="slide-over-title">
                                        Order Details <span className="font-mono text-gray-500">#{order.orderId}</span>
                                    </h2>
                                    <div className="ml-3 h-7 flex items-center">
                                        <button
                                            type="button"
                                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close panel</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <p className="text-sm text-gray-500">
                                        Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="relative flex-1 py-6 px-4 sm:px-6">
                                {/* Customer Info */}
                                <section aria-labelledby="customer-heading" className="mb-8">
                                    <h3 id="customer-heading" className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Customer Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <div className="text-base font-bold text-gray-900 mb-1">{order.customer}</div>
                                        <div className="text-sm text-gray-600 mb-2">{order.contactPerson}</div>
                                        <div className="flex items-center text-sm text-primary font-medium hover:underline cursor-pointer">
                                            <PhoneIcon className="w-4 h-4 mr-1" />
                                            <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-500 whitespace-pre-line border-t border-gray-100 pt-2">
                                            {/* Assuming Address object or string is available in order.address if separate, otherwise relying on fetched data */}
                                            {order.addressId?.street || "Address details not fully available"}
                                            {order.addressId?.city ? `, ${order.addressId.city}` : ""}
                                        </div>
                                    </div>
                                </section>

                                {/* Status Updates */}
                                <section aria-labelledby="status-heading" className="mb-8">
                                    <h3 id="status-heading" className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Update Status</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="order-status" className="block text-xs font-medium text-gray-700 mb-1">Order Status</label>
                                            <select
                                                id="order-status"
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md border"
                                                value={orderStatus}
                                                onChange={(e) => setOrderStatus(e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="payment-status" className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                                            <select
                                                id="payment-status"
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md border"
                                                value={paymentStatus}
                                                onChange={(e) => setPaymentStatus(e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Paid">Paid</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                {/* Order Items */}
                                <section aria-labelledby="items-heading">
                                    <h3 id="items-heading" className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                                    <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {order.products.map((item: any) => (
                                                    <tr key={item.productId || item._id}>
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-8 w-8 flex-shrink-0">
                                                                    {item.image ? (
                                                                        <img className="h-8 w-8 rounded object-cover" src={item.image} alt={item.name} />
                                                                    ) : (
                                                                        <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">IMG</div>
                                                                    )}
                                                                </div>
                                                                <div className="ml-3">
                                                                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={item.name}>{item.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-gray-500 font-mono">
                                                            {item.quantity}{item.unit}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-gray-900 font-mono">
                                                            ₹{item.price * item.quantity}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                                        <span className="text-base font-medium text-gray-900">Total Amount</span>
                                        <span className="text-xl font-bold text-gray-900 font-mono">₹{order.totalAmount}</span>
                                    </div>
                                </section>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
                                <button
                                    type="button"
                                    disabled={updating}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleSave}
                                >
                                    {updating ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
