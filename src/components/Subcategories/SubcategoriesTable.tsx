"use client";
import DataTable from "react-data-table-component";
import {
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useUI } from "@/src/libs/Hooks/UIContext";
import { SubCategoryManagementUrl } from "@/src/libs/utils/API/endpoints";

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

const getColumns = (onRefresh: () => void) => [
  {
    name: "Subcategory",
    selector: (row: any) => row.name,
    sortable: true,
    cell: (row: any) => (
      <div className="flex items-center gap-3 py-2">
        {row.image?.url ? (<img src={row.image.url} alt="" className="w-8 h-8 object-cover border border-gray-200" />) : (<div className="w-8 h-8 bg-gray-100 border border-gray-200"></div>)}
        <div className="flex flex-col">
          <span className="font-bold uppercase">{row.name}</span>
          <span className="text-[10px] text-gray-400 max-w-[200px] truncate">{row.description}</span>
        </div>
      </div>
    ),
    width: "300px",
  },
  {
    name: "Parent Category",
    selector: (row: any) => typeof row.category === 'object' ? row.category?.categoryName || row.category?.name : row.category,
    sortable: true,
    cell: (row: any) => {
      const parentName = typeof row.category === 'object'
        ? row.category?.categoryName || row.category?.name || "General"
        : row.category || "General";
      return (
        <span className="px-2.5 py-0.5 bg-emerald-55 text-[#10b981] text-[9px] font-mono font-extrabold border border-emerald-250 rounded uppercase tracking-widest">
          {parentName}
        </span>
      );
    },
    width: "220px",
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
        {row.status}
      </span>
    ),
  },
  {
    name: "Actions",
    cell: (row: any) => <ActionsMenu row={row} onRefresh={onRefresh} />,
    ignoreRowClick: true,
    width: "80px",
  },
];

function ActionsMenu({ row, onRefresh }: { row: any, onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { showModal, showToast } = useUI();

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

  const handleEdit = () => {
    sessionStorage.setItem("editSubCategoryData", JSON.stringify(row));
    router.push(`/Subcategories/AddSubcategory?id=${row.id}&mode=edit`);
    setOpen(false);
  };

  const handleDelete = () => {
    showModal(
      "Delete Subcategory",
      "Are you sure you want to delete this subcategory? This action cannot be undone.",
      "delete",
      () => {
        deleteSubCategory(row.id);
      }
    );
    setOpen(false);
  };

  const deleteSubCategory = async (subCatId: string) => {
    try {
      const res = await fetch(
        `${SubCategoryManagementUrl.deleteSubCategory}/${subCatId}`,
        {
          method: "DELETE",
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to delete subcategory");
      }

      showToast("Subcategory deleted successfully.", "success");
      if (onRefresh) onRefresh();

    } catch (err: any) {
      console.error("Error deleting subcategory:", err);
      showToast(err.message || "Failed to delete subcategory.", "error");
    }
  };

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
        onClick={handleDelete}
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

export default function SubcategoriesTable({ subcategories, onRefresh }: { subcategories: any[], onRefresh: () => void }) {
  const columns = React.useMemo(() => getColumns(onRefresh), [onRefresh]);
  const router = useRouter();

  return (
    <div className="border border-gray-200">
      <DataTable
        columns={columns}
        data={subcategories}
        pagination
        highlightOnHover
        pointerOnHover
        responsive
        paginationPerPage={10}
        customStyles={customStyles}
        onRowClicked={(row) => router.push(`/Subcategories/AddSubcategory?id=${row.id}&mode=edit`)}
      />
    </div>
  );
}
