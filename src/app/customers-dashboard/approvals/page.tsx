"use client";
import React, { useState, useEffect, useMemo } from "react";
import { CheckCircleIcon, XCircleIcon, EyeIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";
import DataTable from "react-data-table-component";
import { useRouter } from "next/navigation";

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

const customStyles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },
    },
    headRow: {
        style: {
            backgroundColor: "#f9fafb", // gray-50
            borderBottomWidth: "1px",
            borderBottomColor: "#e5e7eb", // gray-200
            minHeight: "40px",
        },
    },
    headCells: {
        style: {
            fontFamily: "monospace",
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase" as "uppercase",
            letterSpacing: "0.05em", // tracking-widest
            color: "#6b7280", // gray-500
            paddingLeft: "16px",
            paddingRight: "16px",
        },
    },
    rows: {
        style: {
            fontSize: "12px",
            fontFamily: "monospace",
            minHeight: "56px",
            borderBottomColor: "#f3f4f6", // gray-100
            "&:hover": {
                backgroundColor: "#f9fafb",
            },
            cursor: "pointer",
        },
    },
    cells: {
        style: {
            paddingLeft: "16px",
            paddingRight: "16px",
            color: "#111827", // gray-900
        },
    },
    pagination: {
        style: {
            borderTopWidth: "1px",
            borderTopColor: "#e5e7eb",
        },
    },
};

export default function CustomerApprovals() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const router = useRouter();

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
            // Optimistic update
            setCustomers(prev => prev.filter(c => c._id !== id));
            // alert(`Customer ${status} successfully.`); // Removed alert for cleaner UX
        } catch (error) {
            alert("Action failed.");
            console.error(error);
        }
    };

    const columns = useMemo(() => [
        {
            name: "Customer",
            selector: (row: Customer) => row.firstName,
            sortable: true,
            cell: (row: Customer) => (
                <div className="flex items-center gap-3 py-2">
                    {row.image ?
                        <img src={row.image} alt="" className="w-8 h-8 rounded bg-gray-100 object-cover border border-gray-200" />
                        : <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 border border-gray-200">IMG</div>
                    }
                    <div className="flex flex-col">
                        <span className="font-bold uppercase font-mono text-xs">{row.firstName} {row.lastName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{row.businessType || "N/A"}</span>
                    </div>
                </div>
            ),
            width: "250px",
        },
        {
            name: "Contact",
            selector: (row: Customer) => row.email,
            cell: (row: Customer) => (
                <div className="flex flex-col">
                    <span className="font-mono text-[11px] truncate max-w-[150px]">{row.email || "-"}</span>
                    <span className="text-gray-400 text-[10px] font-mono">{row.contact}</span>
                </div>
            ),
        },
        {
            name: "Date",
            selector: (row: Customer) => row.timestamp,
            sortable: true,
            cell: (row: Customer) => new Date(row.timestamp).toLocaleDateString("en-IN"),
            width: "120px",
        },
        {
            name: "Status",
            selector: (row: Customer) => row.customerStatus,
            cell: (row: Customer) => (
                <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] uppercase font-mono tracking-wide">
                    {row.customerStatus}
                </span>
            ),
            width: "100px",
        },
        {
            name: "Actions",
            cell: (row: Customer) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleStatusUpdate(row._id, "active")}
                        className="p-1 hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                        title="Approve"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleStatusUpdate(row._id, "rejected")}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Reject"
                    >
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setSelectedCustomer(row)}
                        className="p-1 hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                        title="View Details"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
            right: true,
            width: "140px",
        }
    ], []);

    return (
        <div className="min-h-screen bg-white p-2 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden">

            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">
                        Pending Approvals
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Review new customer registrations</p>
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">
                    {customers.length} Pending Requests
                </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 overflow-x-auto w-full max-w-full">
                <DataTable
                    columns={columns}
                    data={customers}
                    progressPending={loading}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                    customStyles={customStyles}
                    sortIcon={<ArrowDownIcon className="ml-2 h-3 w-3 text-gray-400" />}
                    noDataComponent={
                        <div className="p-8 text-center text-gray-400 text-xs uppercase tracking-widest">
                            No pending approvals found
                        </div>
                    }
                />
            </div>

            {/* Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white max-w-lg w-full p-6 relative shadow-2xl font-mono border border-gray-200">
                        <button
                            onClick={() => setSelectedCustomer(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>

                        <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
                            Request Details
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase block mb-1">Full Name</span>
                                    <span className="font-bold">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase block mb-1">Business Type</span>
                                    <span>{selectedCustomer.businessType || "N/A"}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] text-gray-400 uppercase block mb-1">Contact Info</span>
                                <div className="flex flex-col gap-1">
                                    <span>{selectedCustomer.email}</span>
                                    <span>{selectedCustomer.contact}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] text-gray-400 uppercase block mb-1">Registration Date</span>
                                <span>{new Date(selectedCustomer.timestamp).toLocaleString()}</span>
                            </div>

                            {selectedCustomer.image && (
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase block mb-2">Attached Image</span>
                                    <img src={selectedCustomer.image} alt="Proof" className="w-full h-48 object-cover border border-gray-200 bg-gray-50" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    handleStatusUpdate(selectedCustomer._id, "active");
                                    setSelectedCustomer(null);
                                }}
                                className="flex-1 bg-black text-white hover:bg-[#10b981] py-3 text-xs uppercase tracking-widest font-bold transition-colors"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => {
                                    handleStatusUpdate(selectedCustomer._id, "rejected");
                                    setSelectedCustomer(null);
                                }}
                                className="flex-1 bg-white border border-gray-200 text-red-500 hover:bg-red-50 py-3 text-xs uppercase tracking-widest font-bold transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
