"use client";
import DataTable from "react-data-table-component";
import {
  ArrowDownIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

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
    name: "Name",
    selector: (row: any) => row.customerName,
    sortable: true,
    cell: (row: any) => (
      <div className="flex flex-col py-2">
        <span className="font-bold uppercase font-mono text-xs text-gray-900">{row.customerName}</span>
        <span className="text-[10px] text-gray-400 font-mono">Joined: {new Date(row.createdAt).toLocaleDateString("en-IN")}</span>
      </div>
    ),
    width: "200px",
  },
  {
    name: "Contact",
    selector: (row: any) => row.customerEmail,
    sortable: true,
    cell: (row: any) => (
      <div className="flex flex-col">
        <span className="font-mono text-[11px] text-gray-600 truncate max-w-[150px]">{row.customerEmail || "-"}</span>
        <span className="text-gray-400 text-[10px] font-mono">{row.customerPhone}</span>
      </div>
    ),
  },
  {
    name: "Type",
    selector: (row: any) => row.customerType?.typeName || "N/A",
    sortable: true,
    cell: (row: any) => (
      <span className="font-mono text-[10px] uppercase tracking-wide text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
        {row.customerType?.typeName || "N/A"}
      </span>
    ),
  },
  {
    name: "Status",
    selector: (row: any) => row.customerStatus,
    sortable: true,
    cell: (row: any) => (
      <span
        className={`border py-0.5 px-2 text-[10px] uppercase font-mono tracking-wide ${row.customerStatus === "active"
          ? "border-green-200 text-green-700 bg-green-50"
          : "border-red-200 text-red-700 bg-red-50"
          }`}
      >
        {row.customerStatus}
      </span>
    ),
  },
  {
    name: "Actions",
    cell: (row: any) => <ActionsMenu row={row} />,
    ignoreRowClick: true,
    width: "60px",
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



  function handleView() {
    router.push(`/Customers/AddCustomer?id=${row._id}&mode=view`);
    setOpen(false);
  }

  function handleEdit() {
    router.push(`/Customers/AddCustomer?id=${row._id}`);
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
        onClick={handleView}
      >
        View
      </button>
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

export default function CustomersTable({ customers }: { customers: any[] }) {
  return (
    <div className="border border-gray-200 overflow-x-auto w-full max-w-full">
      <DataTable
        columns={columns}
        data={customers}
        defaultSortFieldId={1}
        sortIcon={<ArrowDownIcon className="ml-2 h-3 w-3 text-gray-400" />}
        pagination
        highlightOnHover
        pointerOnHover
        responsive
        paginationPerPage={10}
        customStyles={customStyles}
      />
    </div>
  );
}
