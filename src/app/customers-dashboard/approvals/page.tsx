"use client";
import React, { useState, useEffect } from "react";
import PathShower from "@/src/components/pathShower";
import { CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

// Types
type Customer = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    contact: string;
    businessType?: string;
    customerStatus: "pending" | "active" | "rejected";
    timestamp: string;
    image?: string; // Optional
};

export default function CustomerApprovals() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const response = await axios.get(AdminUrl.getPendingCustomers);
            setCustomers(response.data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleStatusUpdate = async (id: string, status: "active" | "rejected") => {
        if (!confirm(`Are you sure you want to ${status} this customer?`)) return;

        try {
            const url = AdminUrl.updateCustomerStatus.replace("{id}", id);
            await axios.put(url, { status });
            // Optimistic update or refetch
            setCustomers(prev => prev.filter(c => c._id !== id));
            alert(`Customer ${status} successfully.`);
        } catch (error) {
            alert("Action failed.");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PathShower
                pathList={[
                    ["customers-dashboard", "Customers"],
                    ["approvals", "Pending Approvals"],
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Approvals</h1>

                {loading ? (
                    <div className="text-center py-10">Loading pending customers...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {customers.map((customer) => (
                            <div key={customer._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="flex-shrink-0">
                                    {customer.image ?
                                        <img src={customer.image} alt="Business" className="w-24 h-24 rounded-lg object-cover bg-gray-100" />
                                        : <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">No Img</div>
                                    }
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">{customer.firstName} {customer.lastName}</h3>
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full uppercase">{customer.customerStatus}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                                        <p><span className="font-medium">Business:</span> {customer.businessType || "N/A"}</p>
                                        <p><span className="font-medium">Phone:</span> {customer.contact}</p>
                                        <p><span className="font-medium">Email:</span> {customer.email || "N/A"}</p>
                                        <p><span className="font-medium">Date:</span> {new Date(customer.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                                    <button
                                        onClick={() => handleStatusUpdate(customer._id, "active")}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full md:w-32"
                                    >
                                        <CheckCircleIcon className="w-5 h-5" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(customer._id, "rejected")}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 w-full md:w-32"
                                    >
                                        <XCircleIcon className="w-5 h-5" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => setSelectedCustomer(customer)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 w-full md:w-32"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                        Details
                                    </button>
                                </div>
                            </div>
                        ))}

                        {customers.length === 0 && (
                            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200">
                                No pending customers found. All caught up!
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detail Modal Placeholder - Can be expanded */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
                        <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Customer Details</h2>
                        <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-96">
                            {JSON.stringify(selectedCustomer, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
