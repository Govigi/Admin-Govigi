"use client";
import DataTable from "react-data-table-component";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EllipsisVerticalIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/solid";
import { useSidePanel } from "../../libs/Hooks/sidePanelContext";

const customStyles = {
  headCells: {
    style: {
      fontWeight: "600",
      fontSize: "14px",
    },
  },
  sortIcon: {
    style: {
      height: "20px",
      width: "20px",
      marginLeft: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
};

const columns = [
  {
    name: "Name",
    selector: (row) => row.customerName,
    sortable: true,
  },
  {
    name: "Email",
    selector: (row) => row.customerEmail,
    sortable: true,
  },
  {
    name: "Type",
    selector: (row) => row.customerType?.typeName || "N/A",
    sortable: true,
    cell: (row) => (
      <span className="text-blue-600 bg-blue-100 py-1 px-2 rounded-full capitalize">
        {row.customerType?.typeName || "N/A"}
      </span>
    ),
  },
  {
    name: "Status",
    selector: (row) => row.customerStatus,
    sortable: true,
    cell: (row) => (
      <span
        className={`${
          row.customerStatus === "active"
            ? "text-green-600 bg-green-100"
            : "text-red-600 bg-red-100"
        } px-2 py-1 rounded-full capitalize`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              row.customerStatus === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          {row.customerStatus}
        </div>
      </span>
    ),
  },
  {
    name: "Joined On",
    selector: (row) => {
      const date = new Date(row.createdAt);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    sortable: true,
  },
  {
    name: "Actions",
    cell: (row) => <ActionsMenu row={row} />,
    ignoreRowClick: true,
  },
];

function ActionsMenu({ row }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);
  const dropdownRef = useRef(null);
  const { openSidePanel } = useSidePanel();

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
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        (iconRef.current && iconRef.current.contains(target)) ||
        (dropdownRef.current && dropdownRef.current.contains(target))
      ) {
        return;
      }
      setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function tryOpenSidePanel(rowData) {
    try {
      openSidePanel(rowData);
    } catch (e) {
      console.warn("SidePanelProvider missing:", e);
    }
  }

  const Dropdown = (
    <div
      ref={dropdownRef}
      className="absolute w-32 text-gray-700 bg-white border border-gray-200 rounded shadow-lg z-[9999]"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
    >
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={() => {
          tryOpenSidePanel(row);
          setOpen(false);
        }}
      >
        View
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={() => setOpen(false)}
      >
        Edit
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
        onClick={() => setOpen(false)}
      >
        Delete
      </button>
    </div>
  );

  return (
    <div className="relative inline-block" ref={iconRef}>
      <EllipsisHorizontalIcon
        className="h-5 w-5 text-gray-500 cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && createPortal(Dropdown, document.body)}
    </div>
  );
}

export default function CustomersTable({ customers }) {
  return (
    <DataTable
      columns={columns}
      data={customers}
      defaultSortFieldId={1}
      sortIcon={<ArrowDownIcon className="ml-2 h-4 w-4 text-gray-500" />}
      // sortDirectionIcon={<ArrowUpIcon className="h-4 w-4 text-gray-500" />}
      pagination
      highlightOnHover
      pointerOnHover
      responsive
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 15]}
      customStyles={customStyles}
    />
  );
}
