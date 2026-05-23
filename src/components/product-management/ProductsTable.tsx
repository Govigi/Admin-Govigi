"use client";

import React from "react";
import DataTable from "react-data-table-component";
import { useRouter } from "next/navigation";
import { PencilIcon } from "@heroicons/react/24/outline";

interface ProductsTableProps {
  products: any[];
  isLoading?: boolean;
  paginationTotalRows?: number;
  currentPage?: number;
  perPage?: number;
  totalPages?: number;
  onChangePage?: (page: number) => void;
  onSelectedRowsChange?: (selected: { allSelected: boolean; selectedCount: number; selectedRows: any[] }) => void;
}

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

export default function ProductsTable({
  products,
  isLoading = false,
  paginationTotalRows = 0,
  currentPage = 1,
  onChangePage,
  onSelectedRowsChange,
}: ProductsTableProps) {
  const router = useRouter();

  const columns = React.useMemo(
    () => [
      {
        name: "Product Information",
        selector: (row: any) => row.name,
        sortable: true,
        cell: (row: any) => (
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 bg-gray-50 border border-gray-100 flex-shrink-0 relative overflow-hidden">
              {row.image?.url ? (
                <img src={row.image.url} alt={row.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 font-bold text-xs uppercase bg-gray-50">
                  {String(row.name || "P").slice(0, 1)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold uppercase tracking-tight text-xs text-gray-800">{row.name || "Untitled"}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5 tracking-tighter">
                SKU: {row.sku || String(row.name || "PRD").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() + String(row._id || "").slice(-3).toUpperCase()}
              </p>
            </div>
          </div>
        ),
        width: "320px",
      },
      {
        name: "Category",
        selector: (row: any) => row.category,
        sortable: true,
        cell: (row: any) => (
          <span className="px-2.5 py-0.5 bg-emerald-50 text-[#10b981] text-[9px] font-mono font-extrabold border border-emerald-200 rounded uppercase tracking-widest">
            {typeof row.category === "object"
              ? row.category.categoryName || row.category.name || row.category._id || "General"
              : row.category || "General"}
          </span>
        ),
      },
      {
        name: "Price Point",
        selector: (row: any) => row.pricePerKg || row.price || 0,
        sortable: true,
        cell: (row: any) => (
          <div className="flex flex-col items-end py-1 w-full">
            <span className="text-xs font-black text-gray-900">₹{row.pricePerKg || row.price || 0}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">per {row.unit || "kg"}</span>
          </div>
        ),
      },
      {
        name: "Status",
        selector: (row: any) => row.status,
        sortable: true,
        cell: (row: any) => (
          <span className={`px-2 py-0.5 text-[9px] font-bold border uppercase tracking-widest ${
            row.status === "inactive" 
            ? "border-amber-200 text-amber-700 bg-amber-50" 
            : "border-green-200 text-green-700 bg-green-50"
          }`}>
            {row.status || "Active"}
          </span>
        ),
      },
      {
        name: "Actions",
        ignoreRowClick: true,
        cell: (row: any) => (
          <div className="flex items-center gap-2 w-full justify-end">
            <button 
              onClick={() => router.push(`/product-management/AddProduct?id=${row._id}`)}
              className="p-1.5 border border-gray-100 text-gray-400 hover:text-black hover:border-black transition-all"
            >
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
        width: "80px",
      },
    ],
    [router]
  );

  return (
    <DataTable
      columns={columns}
      data={products}
      keyField="_id"
      progressPending={isLoading}
      pagination
      paginationServer
      paginationTotalRows={paginationTotalRows}
      paginationDefaultPage={currentPage}
      onChangePage={onChangePage}
      customStyles={customStyles}
      highlightOnHover
      pointerOnHover
      responsive
      selectableRows
      onSelectedRowsChange={onSelectedRowsChange}
      onRowClicked={(row) => router.push(`/product-management/AddProduct?id=${row._id}`)}
    />
  );
}
