"use client";
import DataTable from "react-data-table-component";
import {
    ArrowDownIcon,
    EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import BulkUpdateModal from "./BulkUpdateModal";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

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
            fontSize: "11px",
            fontFamily: "monospace",
            color: "#6b7280",
        },
    },
};

const columns = [
    {
        name: "Product",
        selector: (row: any) => row.name,
        sortable: true,
        cell: (row: any) => (
            <div className="flex items-center gap-3 py-2">
                {row.image?.url ? (<img src={row.image.url} alt="" className="w-8 h-8 object-cover border border-gray-200" />) : (<div className="w-8 h-8 bg-gray-100 border border-gray-200"></div>)}
                <div className="flex flex-col">
                    <span className="font-bold uppercase">{row.name}</span>
                    <span className="text-[10px] text-gray-400">{row.subCategory?.name}</span>
                </div>
            </div>
        ),
        width: "250px",
    },
    {
        name: "Category",
        selector: (row: any) => row.category || "N/A",
        sortable: true,
        cell: (row: any) => (
            <span className="font-mono text-[10px] uppercase tracking-wide">
                {row.category || "N/A"}
            </span>
        ),
    },
    {
        name: "Price",
        selector: (row: any) => row.pricePerKg,
        sortable: true,
        cell: (row: any) => (
            <span className="font-mono font-bold">
                ₹{row.pricePerKg} <span className="text-gray-400 font-normal">/ {row.unit}</span>
            </span>
        ),
    },
    {
        name: "Stock",
        selector: (row: any) => row.stock,
        sortable: true,
        cell: (row: any) => (
            <div className="flex flex-col">
                <span className={`font-mono font-bold ${row.stock < 10 ? "text-red-500" : "text-black"}`}>{row.stock} {row.unit}</span>
                {row.stock < 10 && <span className="text-[10px] text-red-500 uppercase">Low Stock</span>}
            </div>
        ),
    },
    {
        name: "Status",
        selector: (row: any) => row.status,
        sortable: true,
        cell: (row: any) => (
            <span
                className={`border py-0.5 px-2 text-[10px] uppercase font-mono tracking-wide ${row.status === "active"
                    ? "border-green-200 text-green-700 bg-green-50"
                    : "border-gray-200 text-gray-500 bg-gray-50"
                    }`}
            >
                {row.status === "active" ? "Active" : "Inactive"}
            </span>
        ),
    },
    {
        name: "Last Updated",
        selector: (row: any) => row.updatedAt,
        sortable: true,
        cell: (row: any) => new Date(row.updatedAt).toLocaleDateString("en-IN"),
        right: true,
    },
    {
        name: "Actions",
        cell: (row: any) => <ActionsMenu row={row} />,
        ignoreRowClick: true,
        width: "80px",
        right: true,
    },
];

function ActionsMenu({ row }: { row: any }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const iconRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (open && iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX - 80,
            });
        }
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (
                (iconRef.current && iconRef.current.contains(event.target)) ||
                (dropdownRef.current && dropdownRef.current.contains(event.target))
            ) {
                return;
            }
            setOpen(false);
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    function handleEdit() {
        router.push(`/product-management/AddProduct?id=${row._id}`);
        setOpen(false);
    }

    const Dropdown = (
        <div
            ref={dropdownRef}
            className="fixed w-32 text-gray-700 bg-white border border-gray-200 shadow-xl z-[9999] font-mono text-xs uppercase"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <button
                className="block w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                onClick={handleEdit}
            >
                Edit
            </button>
            <button
                className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-600"
                onClick={() => setOpen(false)}
            >
                Delete
            </button>
        </div>
    );

    return (
        <div className="relative inline-block" ref={iconRef}>
            <EllipsisHorizontalIcon
                className="h-5 w-5 text-gray-400 hover:text-black cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
            />
            {open && createPortal(Dropdown, document.body)}
        </div>
    );
}

interface ProductsTableProps {
    products: any[];
    paginationServer?: boolean;
    paginationTotalRows?: number;
    onChangePage?: (page: number) => void;
    onChangeRowsPerPage?: (currentRowsPerPage: number, currentPage: number) => void;
}

export default function ProductsTable({
    products,
    paginationServer = false,
    paginationTotalRows = 0,
    onChangePage,
    onChangeRowsPerPage
}: ProductsTableProps) {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [toggledClearRows, setToggleClearRows] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const router = useRouter();

    const handleRowSelected = ({ selectedRows }: any) => {
        setSelectedRows(selectedRows);
    };

    const handleBulkUpdateSuccess = () => {
        setToggleClearRows(!toggledClearRows); // Clear selection in DataTable
        setSelectedRows([]);
        // Ideally we should refresh data. 
        // Since products are passed as prop, we might need to trigger parent refresh.
        // But for now, let's just reload page or router refresh.
        window.location.reload();
    };

    // contextActions logic removed in favor of custom bar

    return (
        <div className="border border-gray-200 relative rounded-lg overflow-hidden bg-white w-full max-w-full">
            <BulkUpdateModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                selectedCount={selectedRows.length}
                selectedIds={selectedRows.map(r => r._id)}
                onSuccess={handleBulkUpdateSuccess}
            />

            {/* Custom Bulk Action Bar */}
            {selectedRows.length > 0 && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-[#10b981] text-white h-[40px] flex items-center justify-between px-4 animate-in fade-in slide-in-from-top-2">
                    <div className="font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <span>{selectedRows.length} Selected</span>
                    </div>
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="bg-white text-black hover:bg-gray-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 flex items-center gap-2 transition-colors"
                    >
                        <ArrowPathIcon className="h-3 w-3" />
                        Update Batch
                    </button>
                </div>
            )}

            <div className="accent-[#10b981] overflow-x-auto w-full">
                <DataTable
                    columns={columns}
                    data={products}
                    pagination
                    paginationServer={paginationServer}
                    paginationTotalRows={paginationTotalRows}
                    onChangePage={onChangePage}
                    onChangeRowsPerPage={onChangeRowsPerPage}
                    highlightOnHover
                    pointerOnHover
                    responsive
                    paginationPerPage={10}
                    customStyles={customStyles}
                    selectableRows
                    onSelectedRowsChange={handleRowSelected}
                    clearSelectedRows={toggledClearRows}
                // contextActions removed, using custom bar
                />
            </div>
        </div>
    );
}
