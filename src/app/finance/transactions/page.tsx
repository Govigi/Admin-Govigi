"use client";
import React, { useState, useEffect } from "react";
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

    const totalCredit = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-sans text-gray-900">

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest border-l-4 border-black pl-4">
                        Wallet Transactions
                    </h1>
                    <p className="text-xs text-gray-400 mt-1 pl-5 font-mono">
                        System Wallet Transactions
                    </p>
                </div>

                {/* Quick Stats Ticker */}
                <div className="flex gap-6 mt-4 md:mt-0 font-mono text-xs">
                    <div>
                        <span className="text-gray-400 block uppercase tracking-wider">Total Credits</span>
                        <span className="text-lg font-bold text-green-600">₹{totalCredit.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 block uppercase tracking-wider">Total Debits</span>
                        <span className="text-lg font-bold text-red-600">₹{totalDebit.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex mb-6">
                <div className="inline-flex border border-gray-300 rounded overflow-hidden">
                    {(['all', 'credit', 'debit'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 text-xs font-mono uppercase font-bold transition-colors
                                ${filterType === type
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border-r border-gray-200 last:border-r-0'
                                }`}
                        >
                            {type === 'all' ? 'All Logs' : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20 font-mono text-sm animate-pulse text-gray-400">
                    LOADING FINANCIAL DATA...
                </div>
            ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm font-mono">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4 pl-6">Timestamp</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Reference</th>
                                <th className="p-4">Source</th>
                                <th className="p-4 pr-6 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length > 0 ? filtered.map((t) => (
                                <tr key={t._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4 pl-6 text-gray-500">
                                        {new Date(t.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                        <span className="text-gray-400 ml-2">
                                            {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">
                                        {t.customerId ? (
                                            <div>
                                                <div>{t.customerId.customerName}</div>
                                                <div className="text-[10px] font-normal text-gray-400">{t.customerId.customerPhone}</div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Unknown</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500 text-xs">
                                        {t.referenceId || "—"}
                                    </td>
                                    <td className="p-4 uppercase text-xs font-bold tracking-wider text-gray-600">
                                        {t.source}
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className={`inline-flex items-center gap-1 font-bold ${t.type === "credit" ? "text-emerald-600" : "text-red-500"
                                            }`}>
                                            {t.type === "credit" ? "+" : "-"} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400 italic">
                                        No financial records found for this filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
