import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import {
    TruckIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";

import VendorAssignmentPanel from "./VendorAssignmentPanel";
import OrderDetailsPanel from "./OrderDetailsPanel";

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
            color: "#111827", // gray-900",
        },
    },
    pagination: {
        style: {
            borderTopWidth: "1px",
            borderTopColor: "#e5e7eb",
            fontSize: "11px",
            fontFamily: "monospace",
            color: "#6b7280",
        },
    },
};

interface SourcingGridProps {
    orders: any[];
    loading: boolean;
    onAssignVendor: (selectedOrders: any[]) => void;
    activeTab: 'pending' | 'assigned';
    onTabChange: (tab: 'pending' | 'assigned') => void;
}

export default function SourcingGrid({ orders, loading, onAssignVendor, activeTab, onTabChange }: SourcingGridProps) {
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [toggledClearRows, setToggleClearRows] = useState(false);
    const [detailOrderId, setDetailOrderId] = useState<string | null>(null); // For Side Panel

    // Vendor Assignment Panel State
    const [isAssignPanelOpen, setIsAssignPanelOpen] = useState(false);
    const [assignSelection, setAssignSelection] = useState<any[]>([]); // Orders being assigned

    // DataTable States
    const [searchTerm, setSearchTerm] = useState("");

    // --- Helpers ---
    const handleRowSelected = ({ selectedRows }: { selectedRows: any[] }) => {
        setSelectedOrderIds(selectedRows.map(r => r.id));
    };

    const handleRowClick = (row: any) => {
        setDetailOrderId(row.id);
    };

    const handleAssignClick = (ids: string[] = selectedOrderIds) => {
        const selected = orders.filter(o => ids.includes(o.id));
        setAssignSelection(selected);
        setIsAssignPanelOpen(true);
    };

    const handleAssignSuccess = () => {
        setToggleClearRows(!toggledClearRows);
        setSelectedOrderIds([]);
        setIsAssignPanelOpen(false);
        window.location.reload();
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchLower = searchTerm.toLowerCase();
            return (
                order.customer?.toLowerCase().includes(searchLower) ||
                order.orderId?.toLowerCase().includes(searchLower) ||
                (order.address?.formattedAddress || "").toLowerCase().includes(searchLower)
            );
        });
    }, [orders, searchTerm]);

    const columns = useMemo(() => [
        {
            name: "Customer",
            selector: (row: any) => row.customer,
            sortable: true,
            cell: (row: any) => (
                <div className="flex flex-col py-2">
                    <span className="text-sm font-semibold text-gray-900">{row.customer}</span>
                    {row.address?.formattedAddress && (
                        <span className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">
                            {row.address.formattedAddress}
                        </span>
                    )}
                </div>
            ),
            grow: 2,
        },
        {
            name: "Order ID",
            selector: (row: any) => row.orderId,
            sortable: true,
            cell: (row: any) => <span className="font-mono text-xs text-gray-500">#{row.orderId}</span>,
        },
        {
            name: "Items",
            selector: (row: any) => (row.products || []).length,
            sortable: true,
            cell: (row: any) => (
                <span className="text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {(row.products || []).length} Items
                </span>
            ),
        },
        {
            name: "Status",
            selector: (row: any) => row.sourcingStatus,
            sortable: true,
            cell: (row: any) => (
                row.sourcingStatus === 'Assigned' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Assigned
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div> Pending
                    </span>
                )
            ),
        },
        {
            name: "",
            button: true,
            cell: (row: any) => (
                <ArrowRightIcon className={`w-4 h-4 transition-colors ${detailOrderId === row.id ? "text-black" : "text-gray-300 group-hover:text-gray-500"}`} />
            ),
            width: "56px",
        }
    ], [detailOrderId]);

    // Side Panel Data
    const detailOrder = useMemo(() => orders.find(o => o.id === detailOrderId), [orders, detailOrderId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-400 animate-pulse font-mono uppercase tracking-widest">Loading Data...</div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-white relative overflow-hidden">

            {/* Main Table Area */}
            <div className={`flex flex-col h-full bg-white w-full transition-all duration-300 ${detailOrderId ? "blur-[2px] pointer-events-none select-none" : ""}`}>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-200 gap-4 bg-white shrink-0">
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => {
                                onTabChange('pending');
                                setSelectedOrderIds([]);
                                setToggleClearRows(!toggledClearRows);
                            }}
                            className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${activeTab === 'pending' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => {
                                onTabChange('assigned');
                                setSelectedOrderIds([]);
                                setToggleClearRows(!toggledClearRows);
                            }}
                            className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${activeTab === 'assigned' ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Assigned
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Bulk Action Overlay Bar */}
                {selectedOrderIds.length > 0 && activeTab === 'pending' && (
                    <div className="absolute top-[70px] left-0 right-0 z-10 bg-[#166534] text-white h-[40px] flex items-center justify-between px-4 animate-in fade-in slide-in-from-top-2 shadow-md mx-4 rounded-t-none rounded-b-md">
                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                className="h-3 w-3 rounded border-white/20 bg-white/20 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer accent-white"
                                checked={true}
                                onChange={() => {
                                    setToggleClearRows(!toggledClearRows);
                                    setSelectedOrderIds([]);
                                }}
                            />
                            <span className="font-mono text-xs font-bold uppercase tracking-widest">
                                {selectedOrderIds.length} Selected
                            </span>
                        </div>
                        <button
                            onClick={() => handleAssignClick()}
                            className="bg-white text-[#166534] hover:bg-gray-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 flex items-center gap-2 transition-colors rounded-sm"
                        >
                            <TruckIcon className="w-3 h-3" />
                            Assign Vendors
                        </button>
                    </div>
                )}

                {/* DataTable */}
                <div className="flex-1 overflow-hidden" >
                    <DataTable
                        columns={columns}
                        data={filteredOrders}
                        pagination
                        paginationPerPage={10}
                        selectableRows={activeTab === 'pending'}
                        onSelectedRowsChange={handleRowSelected}
                        clearSelectedRows={toggledClearRows}
                        onRowClicked={handleRowClick}
                        highlightOnHover
                        pointerOnHover
                        customStyles={customStyles}
                        responsive
                        keyField="id"
                        noDataComponent={
                            <div className="p-8 text-center text-gray-400 font-mono text-sm uppercase tracking-widest">
                                No orders found
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Side Panel (Slide Over - Level 1) */}
            <OrderDetailsPanel
                order={detailOrder}
                onClose={() => setDetailOrderId(null)}
                onAssign={(id) => handleAssignClick([id])}
            />

            {/* Vendor Assignment Side Panel (Level 2) */}
            <VendorAssignmentPanel
                isOpen={isAssignPanelOpen}
                onClose={() => setIsAssignPanelOpen(false)}
                selectedOrders={assignSelection}
                onAssignSuccess={handleAssignSuccess}
            />
        </div>
    );
}
