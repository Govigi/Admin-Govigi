"use client";
import React, { useState, useEffect } from "react";
import PathShower from "@/src/components/pathShower";
import { ArrowDownIcon, ArrowUpIcon, FunnelIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

// Types
type Transaction = {
    _id: string;
    amount: number;
    type: "credit" | "debit";
    source: string;
    timestamp: string;
    referenceId?: string;
    customerId?: { customerName: string; customerPhone: string } | null;
};

export default function WalletTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<string>("all");

    useEffect(() => {
        setLoading(true);
        axios.get(AdminUrl.getTransactions)
            .then(res => setTransactions(res.data))
            .catch(err => console.error("Failed to fetch transactions", err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = transactions.filter(t => filterType === "all" || t.type === filterType);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PathShower
                pathList={[
                    ["finance", "Finance"],
                    ["transactions", "Wallet Transactions"],
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Wallet Transactions</h1>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-green-500 focus:border-green-500 appearance-none"
                            >
                                <option value="all">All Types</option>
                                <option value="credit">Credits Only</option>
                                <option value="debit">Debits Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading transactions...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filtered.map((t) => (
                                        <tr key={t._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(t.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {t.customerId ? `${t.customerId.customerName} (${t.customerId.customerPhone})` : "Guest / Unknown"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {t.referenceId || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {t.source}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${t.type === "credit" ? "text-green-600" : "text-red-600"
                                                }`}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {t.type === "credit" ? "+" : "-"} ₹{t.amount.toFixed(2)}
                                                    {t.type === "credit" ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
