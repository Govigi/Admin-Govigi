import React from "react";
import { PrinterIcon } from "@heroicons/react/24/outline";

type Product = { _id?: string; name?: string; image?: { url?: string } | string; category?: string };
type SourcingData = { name: string; qty: number; count: number; productId: string; category: string; image?: { url?: string } | string; stock?: number };

interface SourcingTableProps {
    loading: boolean;
    totals: Record<string, { name: string; qty: number }>;
    orders: any[];
    products: Product[];
}

const safeImg = (img?: any) => (typeof img === "string" ? img : img?.url || "/placeholder-product.png");

export default function SourcingTable({ loading, totals, orders, products }: SourcingTableProps) {
    // Aggregate data and enrich with product details (category, image)
    const data: SourcingData[] = React.useMemo(() => {
        return Object.entries(totals).map(([key, val]) => {
            const product = products.find((p) => p._id === key);
            // Count how many orders order this item
            const count = orders.filter((o) =>
                o.items.some((it: any) => (it.productId === key) || (it.name === val.name))
            ).length;

            return {
                name: val.name,
                qty: val.qty,
                count: count,
                productId: key,
                category: product?.category || "Uncategorized",
                image: product?.image,
                stock: (product as any)?.currentStock || 0
            };
        });
    }, [totals, orders, products]);

    // Group by Category
    const groupedData = React.useMemo(() => {
        const groups: Record<string, SourcingData[]> = {};
        data.forEach((item) => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [data]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 mx-auto rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-2">No sourcing needs found</div>
                <div className="text-sm text-gray-500">There are no orders scheduled for this period.</div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-none">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 print:hidden">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Sourcing List</h2>
                    <p className="text-sm text-gray-500">Consolidated list of items to procure for tomorrow</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 shadow-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <PrinterIcon className="w-4 h-4" />
                    Print List
                </button>
            </div>

            {/* Printable Header (Visible only in print) */}
            <div className="hidden print:block p-6 border-b border-gray-200 mb-4">
                <h1 className="text-2xl font-bold text-black">Govigi Sourcing List</h1>
                <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-gray-600">For Delivery: Tomorrow</p>
            </div>

            {/* Table Content */}
            <div className="p-0">
                {Object.entries(groupedData).sort().map(([category, items]) => (
                    <div key={category} className="mb-0">
                        <div className="px-6 py-3 bg-gray-100/80 border-y border-gray-200 font-semibold text-gray-700 text-sm uppercase tracking-wider sticky top-0">
                            {category}
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase w-16 print:hidden">Image</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Total Qty (Kg)</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Orders</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase w-24">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 print:hidden">
                                            <img
                                                src={safeImg(item.image)}
                                                alt={item.name}
                                                className="w-10 h-10 rounded-md border border-gray-200 object-contain bg-white"
                                            />
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                                            <div className="text-xs text-gray-400 print:hidden">ID: {item.productId.slice(-6)}</div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-green-50 text-green-700 border border-green-100">
                                                {item.qty.toFixed(2)} kg
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className="text-sm text-gray-600">{item.count}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="w-4 h-4 border-2 border-gray-300 rounded-sm"></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}
