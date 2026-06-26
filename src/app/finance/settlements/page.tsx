"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    MagnifyingGlassIcon,
    ArrowPathIcon,
    BanknotesIcon,
    ShieldExclamationIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownIcon,
    XMarkIcon,
    Cog6ToothIcon,
    ClockIcon,
    ListBulletIcon
} from "@heroicons/react/24/outline";
import DataTable from "react-data-table-component";
import {
    getVendorsPerformance,
    recordVendorPayout,
    processEmergencyPayout,
    updateVendorPayoutSettings
} from "../../../libs/vendorService";

interface VendorSettlement {
    _id: string;
    businessName: string;
    vendorCode: string;
    contactPerson: string;
    phone: string;
    email: string;
    payoutSchedule: "Manual" | "Weekly" | "Bi-Weekly" | "Monthly";
    emergencyPayoutEnabled: boolean;
    settledAmount: number;
    bankDetails?: {
        accountName: string;
        accountNumber: string;
        bankName: string;
        ifscCode: string;
    };
    performance: {
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
        rejectedOrders: number;
        totalEarnings: number;
        outstandingBalance: number;
        fulfillmentRate: number;
    };
    payoutHistory: {
        _id: string;
        amount: number;
        payoutType: "Standard" | "Emergency";
        paymentMethod?: string;
        referenceId?: string;
        status: "Pending" | "Paid" | "Rejected";
        remarks?: string;
        createdAt: string;
    }[];
}

const customStyles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },
    },
    headRow: {
        style: {
            backgroundColor: "#f9fafb",
            borderBottomWidth: "1px",
            borderBottomColor: "#e5e7eb",
            minHeight: "40px",
        },
    },
    headCells: {
        style: {
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase" as const,
            letterSpacing: "0.05em",
            color: "#6b7280",
            paddingLeft: "16px",
            paddingRight: "16px",
        },
    },
    rows: {
        style: {
            fontSize: "12px",
            fontFamily: "var(--font-inter), sans-serif",
            minHeight: "56px",
            borderBottomColor: "#f3f4f6",
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
            color: "#111827",
        },
    },
    pagination: {
        style: {
            borderTopWidth: "1px",
            borderTopColor: "#e5e7eb",
            fontSize: "11px",
            fontFamily: "var(--font-inter), sans-serif",
            color: "#6b7280",
        },
    },
};

export default function VendorSettlementsPage() {
    const [vendors, setVendors] = useState<VendorSettlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"ledger" | "emergency" | "history">("ledger");

    // Modal states
    const [payoutModalVendor, setPayoutModalVendor] = useState<VendorSettlement | null>(null);
    const [settingsModalVendor, setSettingsModalVendor] = useState<VendorSettlement | null>(null);
    const [processModalPayout, setProcessModalPayout] = useState<{ vendor: VendorSettlement; payout: any } | null>(null);

    // Form states
    const [payoutAmount, setPayoutAmount] = useState("");
    const [payoutMethod, setPayoutMethod] = useState("Bank Transfer");
    const [payoutRef, setPayoutRef] = useState("");
    const [payoutRemarks, setPayoutRemarks] = useState("");
    const [payoutType, setPayoutType] = useState<"Standard" | "Emergency">("Standard");

    const [scheduleSetting, setScheduleSetting] = useState<"Manual" | "Weekly" | "Bi-Weekly" | "Monthly">("Weekly");
    const [emergencySetting, setEmergencySetting] = useState(false);

    const [procMethod, setProcMethod] = useState("Bank Transfer");
    const [procRef, setProcRef] = useState("");
    const [procRemarks, setProcRemarks] = useState("");

    useEffect(() => {
        fetchSettlementData();
    }, []);

    const fetchSettlementData = async () => {
        try {
            setLoading(true);
            const data = await getVendorsPerformance();
            setVendors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch settlement data", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVendors = useMemo(() => {
        return vendors.filter(v =>
            v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.vendorCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.phone?.includes(searchQuery)
        );
    }, [vendors, searchQuery]);

    const stats = useMemo(() => {
        const totalEarnings = vendors.reduce((acc, curr) => acc + (curr.performance?.totalEarnings || 0), 0);
        const totalSettled = vendors.reduce((acc, curr) => acc + (curr.settledAmount || 0), 0);
        const outstanding = vendors.reduce((acc, curr) => acc + (curr.performance?.outstandingBalance || 0), 0);

        let pendingRequestsCount = 0;
        vendors.forEach(v => {
            v.payoutHistory?.forEach(p => {
                if (p.payoutType === "Emergency" && p.status === "Pending") {
                    pendingRequestsCount++;
                }
            });
        });

        return [
            { label: "Total Sourced Cost", value: `₹${totalEarnings.toLocaleString("en-IN")}`, icon: BanknotesIcon, color: "text-gray-900 border-gray-200" },
            { label: "Settled Payouts", value: `₹${totalSettled.toLocaleString("en-IN")}`, icon: CheckCircleIcon, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            { label: "Net Outstanding", value: `₹${outstanding.toLocaleString("en-IN")}`, icon: ClockIcon, color: "text-orange-600 bg-orange-50 border-orange-100" },
            { label: "Emergency Requests", value: pendingRequestsCount, icon: ShieldExclamationIcon, color: pendingRequestsCount > 0 ? "text-red-600 bg-red-50 border-red-200 animate-pulse font-bold" : "text-gray-400 bg-gray-50 border-gray-100" }
        ];
    }, [vendors]);

    // Aggregate lists
    const pendingEmergencyRequests = useMemo(() => {
        const list: { vendor: VendorSettlement; payout: any }[] = [];
        vendors.forEach(v => {
            v.payoutHistory?.forEach(p => {
                if (p.payoutType === "Emergency" && p.status === "Pending") {
                    list.push({ vendor: v, payout: p });
                }
            });
        });
        return list;
    }, [vendors]);

    const globalPayoutHistory = useMemo(() => {
        const list: { vendorName: string; vendorCode: string; payout: any }[] = [];
        vendors.forEach(v => {
            v.payoutHistory?.forEach(p => {
                list.push({ vendorName: v.businessName, vendorCode: v.vendorCode, payout: p });
            });
        });
        return list.sort((a, b) => new Date(b.payout.createdAt).getTime() - new Date(a.payout.createdAt).getTime());
    }, [vendors]);

    // Action Handlers
    const handleOpenPayout = (vendor: VendorSettlement) => {
        setPayoutModalVendor(vendor);
        setPayoutAmount(vendor.performance?.outstandingBalance.toString() || "0");
        setPayoutMethod("Bank Transfer");
        setPayoutRef("");
        setPayoutRemarks("");
        setPayoutType("Standard");
    };

    const handleOpenSettings = (vendor: VendorSettlement) => {
        setSettingsModalVendor(vendor);
        setScheduleSetting(vendor.payoutSchedule || "Weekly");
        setEmergencySetting(vendor.emergencyPayoutEnabled || false);
    };

    const handleOpenProcess = (vendor: VendorSettlement, payout: any) => {
        setProcessModalPayout({ vendor, payout });
        setProcMethod("Bank Transfer");
        setProcRef("");
        setProcRemarks("");
    };

    const handleRecordPayoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payoutModalVendor) return;

        try {
            await recordVendorPayout({
                vendorId: payoutModalVendor._id,
                amount: parseFloat(payoutAmount),
                paymentMethod: payoutMethod,
                referenceId: payoutRef,
                remarks: payoutRemarks,
                payoutType: payoutType
            });
            setPayoutModalVendor(null);
            fetchSettlementData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to record payout");
        }
    };

    const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settingsModalVendor) return;

        try {
            await updateVendorPayoutSettings({
                vendorId: settingsModalVendor._id,
                payoutSchedule: scheduleSetting,
                emergencyPayoutEnabled: emergencySetting
            });
            setSettingsModalVendor(null);
            fetchSettlementData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update payout settings");
        }
    };

    const handleProcessRequest = async (status: "Paid" | "Rejected") => {
        if (!processModalPayout) return;

        try {
            await processEmergencyPayout(processModalPayout.payout._id, {
                status,
                paymentMethod: status === "Paid" ? procMethod : undefined,
                referenceId: status === "Paid" ? procRef : undefined,
                remarks: procRemarks
            });
            setProcessModalPayout(null);
            fetchSettlementData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to process request");
        }
    };

    const columns = [
        {
            name: "Business / Code",
            selector: (row: VendorSettlement) => row.businessName,
            sortable: true,
            cell: (row: VendorSettlement) => (
                <div className="flex flex-col py-2">
                    <span className="font-bold uppercase tracking-tight text-gray-900">{row.businessName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{row.vendorCode || "N/A"}</span>
                </div>
            ),
            width: "200px",
        },
        {
            name: "Schedule / Priority",
            selector: (row: VendorSettlement) => row.payoutSchedule,
            sortable: true,
            cell: (row: VendorSettlement) => (
                <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-none inline-block w-fit">
                        {row.payoutSchedule || "Weekly"}
                    </span>
                    {row.emergencyPayoutEnabled && (
                        <span className="text-[9px] font-bold text-red-600 tracking-wider uppercase">
                            Emergency Allowed
                        </span>
                    )}
                </div>
            ),
            width: "140px",
        },
        {
            name: "Bank Details",
            cell: (row: VendorSettlement) => {
                const bd = row.bankDetails;
                if (!bd || !bd.accountNumber) return <span className="text-gray-400 italic text-[10px]">No Account Info</span>;
                return (
                    <div className="flex flex-col font-mono text-[10px] text-gray-500 uppercase">
                        <span className="font-bold text-gray-700 leading-tight">{bd.bankName}</span>
                        <span className="leading-tight">A/C: {bd.accountNumber}</span>
                        <span className="text-[9px] text-gray-400 leading-tight">IFSC: {bd.ifscCode}</span>
                    </div>
                );
            },
            width: "200px",
        },
        {
            name: "Earnings",
            selector: (row: VendorSettlement) => row.performance?.totalEarnings || 0,
            sortable: true,
            cell: (row: VendorSettlement) => (
                <span className="font-mono font-bold text-gray-800">₹{(row.performance?.totalEarnings || 0).toLocaleString("en-IN")}</span>
            ),
            right: "true" as any,
        },
        {
            name: "Settled",
            selector: (row: VendorSettlement) => row.settledAmount || 0,
            sortable: true,
            cell: (row: VendorSettlement) => (
                <span className="font-mono font-bold text-emerald-600">₹{(row.settledAmount || 0).toLocaleString("en-IN")}</span>
            ),
            right: "true" as any,
        },
        {
            name: "Outstanding",
            selector: (row: VendorSettlement) => row.performance?.outstandingBalance || 0,
            sortable: true,
            cell: (row: VendorSettlement) => (
                <span className="font-mono font-bold text-orange-600">₹{(row.performance?.outstandingBalance || 0).toLocaleString("en-IN")}</span>
            ),
            right: "true" as any,
        },
        {
            name: "Actions",
            cell: (row: VendorSettlement) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenPayout(row)}
                        className="px-3 py-1 bg-black text-white hover:bg-emerald-600 text-[10px] font-bold uppercase transition-all rounded-none"
                    >
                        Settle
                    </button>
                    <button
                        onClick={() => handleOpenSettings(row)}
                        className="p-1 border border-gray-200 hover:border-black text-gray-500 hover:text-black rounded-none"
                        title="Configure Payout Settings"
                    >
                        <Cog6ToothIcon className="w-4 h-4" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            width: "110px",
        }
    ];

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-inter text-gray-900 w-full overflow-x-hidden pb-24">

            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981] border-l-4 border-[#10b981] pl-4">
                    Vendor Settlements
                </h1>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider pl-5 font-mono">
                    Financial payouts and settlement controls
                </p>
            </div>

            {/* Financial aggregates */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className={`p-4 border shadow-none flex flex-col justify-between ${stat.color} transition-all`}>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</span>
                                <Icon className="w-4 h-4 opacity-75" />
                            </div>
                            <span className="text-lg md:text-xl font-black mt-2 font-mono">{stat.value}</span>
                        </div>
                    );
                })}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab("ledger")}
                    className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all ${activeTab === "ledger" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
                        }`}
                >
                    Settlement Ledger
                </button>
                <button
                    onClick={() => setActiveTab("emergency")}
                    className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all flex items-center gap-1.5 ${activeTab === "emergency" ? "border-red-600 text-red-600" : "border-transparent text-gray-400 hover:text-red-500"
                        }`}
                >
                    Emergency Requests {pendingEmergencyRequests.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all ${activeTab === "history" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
                        }`}
                >
                    Payout History
                </button>
            </div>

            {/* Tab Content: Ledger */}
            {activeTab === "ledger" && (
                <>
                    {/* Toolbar */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-gray-200">
                        <div className="relative group w-full md:w-80">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH BUSINESS, CODE, PHONES..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black uppercase placeholder-gray-300 rounded-none font-mono"
                            />
                        </div>

                        <button onClick={fetchSettlementData} className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-none flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase">
                            <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Table Area */}
                    <div className="border border-gray-200 relative overflow-hidden bg-white w-full">
                        <DataTable
                            columns={columns}
                            data={filteredVendors}
                            progressPending={loading}
                            progressComponent={
                                <div className="py-20 text-gray-400 text-xs uppercase tracking-widest animate-pulse flex flex-col items-center gap-3 font-mono">
                                    <div className="w-5 h-5 border-2 border-gray-100 border-t-[#10b981] rounded-full animate-spin"></div>
                                    Loading settlement logs...
                                </div>
                            }
                            pagination
                            paginationPerPage={10}
                            highlightOnHover
                            pointerOnHover
                            responsive
                            customStyles={customStyles}
                            sortIcon={<ArrowDownIcon className="ml-1 w-3 h-3 text-gray-400" />}
                        />
                    </div>
                </>
            )}

            {/* Tab Content: Emergency Requests */}
            {activeTab === "emergency" && (
                <div className="space-y-4">
                    {pendingEmergencyRequests.length > 0 ? (
                        pendingEmergencyRequests.map(({ vendor, payout }) => (
                            <div key={payout._id} className="border border-red-200 bg-red-50/20 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2 font-mono">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider animate-pulse">
                                            Emergency Request
                                        </span>
                                        <span className="text-gray-400 text-[10px]">Requested: {new Date(payout.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase">{vendor.businessName}</h3>
                                        <p className="text-[10px] text-gray-400 uppercase">Code: {vendor.vendorCode} | Outstanding: ₹{vendor.performance?.outstandingBalance.toLocaleString("en-IN")}</p>
                                    </div>
                                    {payout.remarks && (
                                        <p className="text-[11px] text-gray-600 bg-white/60 border border-gray-100 p-2 italic">
                                            "{payout.remarks}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                    <div className="text-left md:text-right">
                                        <span className="text-gray-400 block uppercase text-[10px] font-mono">Requested Amount</span>
                                        <span className="text-xl font-black text-red-600 font-mono">₹{payout.amount.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenProcess(vendor, payout)}
                                            className="px-4 py-2 bg-black text-white hover:bg-emerald-600 text-xs font-bold uppercase transition-all rounded-none"
                                        >
                                            Process Payout
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Reject this emergency payout request?")) {
                                                    setProcessModalPayout({ vendor, payout });
                                                    handleProcessRequest("Rejected");
                                                }
                                            }}
                                            className="px-4 py-2 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-xs font-bold uppercase transition-all rounded-none text-gray-500"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-400 border border-gray-100 bg-gray-50/30 italic font-mono text-xs uppercase">
                            No pending emergency requests found.
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content: Payout History */}
            {activeTab === "history" && (
                <div className="border border-gray-200 overflow-hidden bg-white w-full">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-200">
                            <tr>
                                <th className="p-4 pl-6">Timestamp</th>
                                <th className="p-4">Vendor</th>
                                <th className="p-4">Reference</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Method</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 pr-6 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {globalPayoutHistory.length > 0 ? (
                                globalPayoutHistory.map(({ vendorName, vendorCode, payout }) => {
                                    const isEmergency = payout.payoutType === "Emergency";
                                    return (
                                        <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 pl-6 text-gray-500">
                                                {new Date(payout.createdAt).toLocaleDateString()}
                                                <span className="text-gray-400 ml-1.5">{new Date(payout.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                            </td>
                                            <td className="p-4 font-bold text-gray-900 uppercase">
                                                <div>{vendorName}</div>
                                                <div className="text-[9px] text-gray-400 font-normal">{vendorCode}</div>
                                            </td>
                                            <td className="p-4 text-gray-500">{payout.referenceId || "—"}</td>
                                            <td className="p-4">
                                                <span className={`px-1.5 py-0.5 text-[9px] font-bold border
                                                    ${isEmergency ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-50 text-gray-600 border-gray-100"}
                                                `}>
                                                    {payout.payoutType}
                                                </span>
                                            </td>
                                            <td className="p-4 uppercase text-[10px] text-gray-500">{payout.paymentMethod || "—"}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-1.5 py-0.5 text-[9px] font-bold border uppercase
                                                    ${payout.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        payout.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                            "bg-red-50 text-red-600 border-red-100"}
                                                `}>
                                                    {payout.status}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right font-bold text-gray-900">
                                                ₹{payout.amount.toLocaleString("en-IN")}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-400 italic uppercase">
                                        No payout transaction ledger records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal: Record Payout */}
            {payoutModalVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <form onSubmit={handleRecordPayoutSubmit} className="bg-white w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">

                        <div className="p-6 border-b-2 border-black bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-bold uppercase font-mono text-gray-500">Record Payout</h3>
                                <h2 className="text-base font-black uppercase text-gray-900">{payoutModalVendor.businessName}</h2>
                            </div>
                            <button type="button" onClick={() => setPayoutModalVendor(null)} className="p-1 text-gray-400 hover:text-black">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 font-mono text-xs text-gray-600">

                            <div className="p-3 bg-orange-50 border border-orange-100 flex justify-between items-center text-orange-800">
                                <span>NET OUTSTANDING AMOUNT:</span>
                                <span className="font-bold text-sm">₹{payoutModalVendor.performance?.outstandingBalance.toLocaleString("en-IN")}</span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold uppercase text-[10px] text-gray-700">Payout Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    className="p-2 border border-gray-200 focus:outline-none focus:border-black rounded-none text-xs text-gray-900 font-bold"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold uppercase text-[10px] text-gray-700">Payment Method</label>
                                <select
                                    value={payoutMethod}
                                    onChange={(e) => setPayoutMethod(e.target.value)}
                                    className="p-2 border border-gray-200 focus:outline-none focus:border-black rounded-none bg-white text-xs text-gray-900 uppercase cursor-pointer"
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Cash">Cash</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold uppercase text-[10px] text-gray-700">Reference / Txn ID</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="E.G. BANK TRANSFER REF NO..."
                                    value={payoutRef}
                                    onChange={(e) => setPayoutRef(e.target.value)}
                                    className="p-2 border border-gray-200 focus:outline-none focus:border-black rounded-none text-xs text-gray-900 uppercase placeholder-gray-300"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold uppercase text-[10px] text-gray-700">Remarks (Optional)</label>
                                <textarea
                                    value={payoutRemarks}
                                    onChange={(e) => setPayoutRemarks(e.target.value)}
                                    className="p-2 border border-gray-200 focus:outline-none focus:border-black rounded-none text-xs text-gray-900 h-16 resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                                <input
                                    type="checkbox"
                                    id="isEmergency"
                                    checked={payoutType === "Emergency"}
                                    onChange={(e) => setPayoutType(e.target.checked ? "Emergency" : "Standard")}
                                    className="rounded-none border-gray-400 text-black focus:ring-black cursor-pointer"
                                />
                                <label htmlFor="isEmergency" className="font-bold uppercase text-[10px] text-red-600 cursor-pointer select-none">
                                    Flag as Priority / Emergency Payout
                                </label>
                            </div>

                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                            <button type="button" onClick={() => setPayoutModalVendor(null)} className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase hover:bg-white text-gray-500 rounded-none">
                                Cancel
                            </button>
                            <button type="submit" className="px-6 py-2 bg-black text-white hover:bg-emerald-600 text-xs font-bold uppercase transition-all rounded-none">
                                Finalize Settlement
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* Modal: Payout Settings */}
            {settingsModalVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <form onSubmit={handleSaveSettingsSubmit} className="bg-white w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">

                        <div className="p-6 border-b-2 border-black bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-bold uppercase font-mono text-gray-500">Configure Payouts</h3>
                                <h2 className="text-base font-black uppercase text-gray-900">{settingsModalVendor.businessName}</h2>
                            </div>
                            <button type="button" onClick={() => setSettingsModalVendor(null)} className="p-1 text-gray-400 hover:text-black">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 font-mono text-xs text-gray-600">

                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold uppercase text-[10px] text-gray-700">Preferred Payout Frequency</label>
                                <select
                                    value={scheduleSetting}
                                    onChange={(e) => setScheduleSetting(e.target.value as any)}
                                    className="p-2 border border-gray-200 focus:outline-none focus:border-black rounded-none bg-white text-xs text-gray-900 uppercase cursor-pointer"
                                >
                                    <option value="Manual">Manual Settlement</option>
                                    <option value="Weekly">Weekly Cycle</option>
                                    <option value="Bi-Weekly">Bi-Weekly Cycle</option>
                                    <option value="Monthly">Monthly Cycle</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                                <input
                                    type="checkbox"
                                    id="emergencyAllowed"
                                    checked={emergencySetting}
                                    onChange={(e) => setEmergencySetting(e.target.checked)}
                                    className="rounded-none border-gray-400 text-black focus:ring-black cursor-pointer"
                                />
                                <label htmlFor="emergencyAllowed" className="font-bold uppercase text-[10px] text-gray-700 cursor-pointer select-none">
                                    Authorize Instant Emergency Requests
                                </label>
                            </div>

                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                            <button type="button" onClick={() => setSettingsModalVendor(null)} className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase hover:bg-white text-gray-500 rounded-none">
                                Cancel
                            </button>
                            <button type="submit" className="px-6 py-2 bg-black text-white hover:bg-emerald-600 text-xs font-bold uppercase transition-all rounded-none">
                                Save Config
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* Modal: Process Emergency Request */}
            {processModalPayout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">

                        <div className="p-6 border-b-2 border-black bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-bold uppercase font-mono text-gray-500 text-red-600 animate-pulse">Settle Emergency Payout</h3>
                                <h2 className="text-base font-black uppercase text-gray-900">{processModalPayout.vendor.businessName}</h2>
                            </div>
                            <button type="button" onClick={() => setProcessModalPayout(null)} className="p-1 text-gray-400 hover:text-black">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 font-mono text-xs text-gray-600">

                            <div className="p-4 bg-red-50 border border-red-200 text-red-800 space-y-1">
                                <div className="flex justify-between items-center font-bold">
                                    <span>REQUESTED PRIORITY PAYOUT:</span>
                                    <span className="text-sm font-black">₹{processModalPayout.payout.amount.toLocaleString("en-IN")}</span>
                                </div>
                                <p className="text-[10px] text-red-600 uppercase font-bold tracking-wider leading-none">
                                    Instant Priority Settlement Authorization
                                </p>
                            </div>

                            {/* Bank details quick reference */}
                            <div className="p-3 bg-gray-50 border border-gray-200 space-y-1">
                                <span className="font-bold text-gray-900 block text-[9px] uppercase tracking-wider">Vendor Bank Info</span>
                                {processModalPayout.vendor.bankDetails?.accountNumber ? (
                                    <div className="text-[10px] text-gray-600 uppercase">
                                        <div><span className="text-gray-400">BANK:</span> {processModalPayout.vendor.bankDetails.bankName}</div>
                                        <div><span className="text-gray-400">A/C NAME:</span> {processModalPayout.vendor.bankDetails.accountName}</div>
                                        <div><span className="text-gray-400">A/C NO:</span> {processModalPayout.vendor.bankDetails.accountNumber}</div>
                                        <div><span className="text-gray-400">IFSC:</span> {processModalPayout.vendor.bankDetails.ifscCode}</div>
                                    </div>
                                ) : (
                                    <span className="text-red-500 font-bold uppercase text-[9px]">No bank details registered!</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold uppercase text-[10px] text-gray-700">Payment Method</label>
                                <select
                                    value={procMethod}
                                    onChange={(e) => setProcMethod(e.target.value)}
                                    className="p-2 border border-gray-200 focus:outline-none focus:border-black rounded-none bg-white text-xs text-gray-900 uppercase cursor-pointer"
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Cash">Cash</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold uppercase text-[10px] text-gray-700">Reference / Txn ID</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ENTER BANK TRANSACTION ID..."
                                    value={procRef}
                                    onChange={(e) => setProcRef(e.target.value)}
                                    className="p-2 border border-gray-200 focus:outline-none focus:border-black rounded-none text-xs text-gray-900 uppercase placeholder-gray-300 font-bold"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="font-bold uppercase text-[10px] text-gray-700">Processing Comments</label>
                                <textarea
                                    value={procRemarks}
                                    onChange={(e) => setProcRemarks(e.target.value)}
                                    className="p-2 border border-gray-200 focus:outline-none focus:border-black rounded-none text-xs text-gray-900 h-16 resize-none"
                                />
                            </div>

                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                            <button type="button" onClick={() => setProcessModalPayout(null)} className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase hover:bg-white text-gray-500 rounded-none">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleProcessRequest("Paid")}
                                className="px-6 py-2 bg-black text-white hover:bg-emerald-600 text-xs font-bold uppercase transition-all rounded-none"
                            >
                                Confirm & Pay
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
