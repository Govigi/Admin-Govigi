import React, { useState, useMemo } from "react";
import { PhotoIcon, PrinterIcon, ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SourcingItem {
    productId: string;
    productName: string;
    totalQuantity: number;
    unit: string;
    orderCount: number;
    image?: string;
    category?: string;
}

interface SourcingPanelProps {
    orders: any[];
    loading: boolean;
}

export default function SourcingPanel({ orders, loading }: SourcingPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const sourcingList = useMemo(() => {
        const aggregated: { [key: string]: SourcingItem } = {};

        orders.forEach((order: any) => {
            if (order.status === "Cancelled") return;

            const items = order.products || order.items || [];
            items.forEach((item: any) => {
                const key = item.productId || item.name;
                if (!key) return;

                if (!aggregated[key]) {
                    aggregated[key] = {
                        productId: key,
                        productName: item.name || item.productName || "Unknown",
                        totalQuantity: 0,
                        unit: item.unit || "kg",
                        orderCount: 0,
                        image: item.image || null,
                        category: item.category || "Uncategorized"
                    };
                }

                const qty = Number(item.quantity) || Number(item.qty) || 0;
                aggregated[key].totalQuantity += qty;
                aggregated[key].orderCount += 1;
            });
        });

        // Sort by product name
        return Object.values(aggregated).sort((a, b) =>
            a.productName.localeCompare(b.productName)
        );
    }, [orders]);

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) return;

        const dateStr = new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const htmlContent = `
            <html>
                <head>
                    <title>Sourcing List - ${dateStr}</title>
                    <style>
                        body { font-family: monospace; padding: 20px; }
                        h1 { font-size: 24px; text-transform: uppercase; margin-bottom: 5px; }
                        p { font-size: 12px; color: #666; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; font-size: 14px; }
                        th { text-align: left; border-bottom: 1px solid #ccc; padding: 8px 0; text-transform: uppercase; font-size: 12px; color: #666; }
                        td { border-bottom: 1px solid #eee; padding: 10px 0; }
                        .qty { text-align: right; font-weight: bold; }
                        .unit { font-size: 12px; color: #666; margin-left: 2px; }
                        .right { text-align: right; }
                        @media print {
                            @page { margin: 1cm; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Sourcing List</h1>
                    <p>Generated: ${dateStr}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th class="right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sourcingList.map(item => `
                                <tr>
                                    <td>${item.productName}</td>
                                    <td class="qty">
                                        ${item.totalQuantity}<span class="unit">${item.unit}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        // Delay to ensure content is loaded before print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-gray-400 font-mono text-sm animate-pulse">
                    LOADING SOURCING DATA...
                </div>
            </div>
        );
    }

    if (sourcingList.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-gray-400 font-mono text-sm text-center">
                    <div className="text-2xl mb-2">—</div>
                    <div>NO ITEMS TO SOURCE</div>
                </div>
            </div>
        );
    }

    const containerClass = isExpanded
        ? "fixed inset-0 z-50 bg-white p-6 overflow-hidden flex flex-col animate-in fade-in duration-200"
        : "h-full flex flex-col relative";

    return (
        <div className={containerClass}>
            <div className="border-b border-gray-200 pb-3 mb-4 flex justify-between items-center">
                <div>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-gray-500">
                        Sourcing Requirements
                    </h3>
                    <div className="font-mono text-2xl font-bold mt-1">
                        {sourcingList.length} <span className="text-sm font-normal text-gray-400">items</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 print:hidden bg-white">
                    <button
                        onClick={handlePrint}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"
                        title="Print List"
                    >
                        <PrinterIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"
                        title={isExpanded ? "Close" : "Expand"}
                    >
                        {isExpanded ? (
                            <XMarkIcon className="w-5 h-5" />
                        ) : (
                            <ArrowsPointingOutIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 ${isExpanded ? 'px-4' : ''}`}>
                <div className={`grid gap-3 ${isExpanded ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {sourcingList.map((item) => (
                        <div
                            key={item.productId}
                            className="border border-gray-200 rounded-lg p-3 hover:border-primary/50 hover:shadow-sm transition-all bg-white"
                        >
                            <div className="flex gap-3">
                                <div className="w-16 h-16 bg-gray-50 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.productName}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : (
                                        <PhotoIcon className="w-6 h-6 text-gray-300" />
                                    )}
                                    <div className={`hidden w-full h-full flex items-center justify-center ${item.image ? '' : 'hidden'}`}>
                                        <PhotoIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm truncate leading-tight" title={item.productName}>
                                            {item.productName}
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <div className="font-mono bg-gray-100 px-2 py-1 rounded">
                                            <span className="text-xl font-bold text-gray-900">{item.totalQuantity}</span>
                                            <span className="text-xs text-gray-600 ml-1 font-medium">{item.unit}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                            {item.orderCount} ord
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </div>
    );
}
