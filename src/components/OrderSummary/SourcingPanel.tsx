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
                        body { font-family: monospace; padding: 40px; color: #111; }
                        h1 { font-size: 24px; font-weight: 800; tracking: -0.025em; margin-bottom: 5px; text-transform: uppercase; }
                        p { font-size: 12px; color: #666; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 15px; text-transform: uppercase; }
                        table { width: 100%; border-collapse: collapse; font-size: 13px; }
                        th { text-align: left; border-bottom: 2px solid #111; padding: 10px 0; text-transform: uppercase; font-size: 10px; font-weight: 700; color: #666; letter-spacing: 0.05em; }
                        td { border-bottom: 1px solid #eee; padding: 14px 0; text-transform: uppercase; }
                        .qty { text-align: right; font-weight: 800; font-size: 14px; }
                        .unit { font-size: 11px; color: #666; font-weight: 500; margin-left: 2px; }
                        .right { text-align: right; }
                        @media print {
                            @page { margin: 1cm; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Sourcing List</h1>
                    <p>Generated on ${dateStr}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th class="right">Quantity Needed</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sourcingList.map(item => `
                                <tr>
                                    <td style="font-weight: 600;">${item.productName.toUpperCase()}</td>
                                    <td class="qty">
                                        ${item.totalQuantity}<span class="unit">${item.unit.toUpperCase()}</span>
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
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center font-mono">
                <div className="text-gray-400 text-xs animate-pulse tracking-widest uppercase">
                    LOADING SOURCING DATA...
                </div>
            </div>
        );
    }

    if (sourcingList.length === 0) {
        return (
            <div className="h-full flex items-center justify-center font-mono">
                <div className="text-gray-400 text-xs text-center font-bold uppercase tracking-widest">
                    <div className="text-xl mb-2">—</div>
                    <div>NO ITEMS TO SOURCE</div>
                </div>
            </div>
        );
    }

    const containerClass = isExpanded
        ? "fixed inset-0 z-50 bg-white p-6 md:p-8 overflow-hidden flex flex-col animate-in fade-in duration-200 font-mono"
        : "h-full flex flex-col relative font-mono";

    return (
        <div className={containerClass}>
            {/* Header Area */}
            <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Sourcing Requirements
                    </h3>
                    <div className="text-2xl font-bold text-gray-950 mt-1 uppercase">
                        {sourcingList.length} <span className="text-xs font-bold text-gray-450 tracking-widest uppercase">Items</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 print:hidden bg-white">
                    <button
                        onClick={handlePrint}
                        className="p-2 hover:bg-gray-150 rounded-none text-gray-500 hover:text-black transition-colors"
                        title="Print List"
                    >
                        <PrinterIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-gray-150 rounded-none text-gray-500 hover:text-black transition-colors"
                        title={isExpanded ? "Close" : "Expand"}
                    >
                        {isExpanded ? (
                            <XMarkIcon className="w-4 h-4" />
                        ) : (
                            <ArrowsPointingOutIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className={`flex-1 overflow-y-auto pr-2 -mr-2 ${isExpanded ? 'px-2' : ''}`}>
                <div className={`grid gap-4 ${isExpanded
                    ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                    : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-2'
                    }`}>
                    {sourcingList.map((item) => (
                        <div
                            key={item.productId}
                            className="border border-gray-200 p-4 hover:border-gray-950 transition-all bg-white flex flex-col justify-between"
                        >
                            <div className="flex gap-3 items-start">
                                <div className="w-12 h-12 bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.productName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : (
                                        <PhotoIcon className="w-5 h-5 text-gray-300" />
                                    )}
                                    <div className={`hidden w-full h-full flex items-center justify-center ${item.image ? '' : 'hidden'}`}>
                                        <PhotoIcon className="w-5 h-5 text-gray-300" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-950 text-xs leading-snug line-clamp-2 uppercase" title={item.productName}>
                                        {item.productName}
                                    </div>
                                    <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                        {item.orderCount} order{item.orderCount !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-gray-950">
                                        {item.totalQuantity}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                        {item.unit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
