"use client";

import React from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import DataTable from "react-data-table-component";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useSidePanel } from "../../libs/Hooks/sidePanelContext";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  image?: {
    url: string;
  };
}

const columns = [
  {
    name: "Category",
    selector: (row: Category) => row.name,
    sortable: true,
  },
  {
    name: "Description",
    selector: (row: Category) => row.description,
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: Category) => (
      <span
        className={`px-3 py-1 rounded text-xs font-semibold ${
          row.status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {row.status === "active" ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    name: "Image",
    selector: (row: Category) => (
      <img
        src={row.image?.url}
        alt={row.name}
        className="h-10 w-10 object-contain rounded"
      />
    ),
  },
  {
    name: "Actions",
    cell: (row: Category) => <ActionsMenu row={row} />,
    ignoreRowClick: true,
  },
];

function ActionsMenu({ row }: { row: Category }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  let openSidePanel: ((data: Category) => void) | null = null;
  try {
    const context = useSidePanel();
    openSidePanel = (context as any).openSidePanel;
  } catch (e) {
    console.warn("SidePanelProvider missing");
  }

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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
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

  const handleView = () => {
    if (openSidePanel) {
      openSidePanel(row);
    }
    setOpen(false);
  };

  const handleEdit = () => {
    sessionStorage.setItem("editCategoryData", JSON.stringify(row));
    router.push(`/Categories/AddCategory?mode=edit`);
    setOpen(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this category?")) {
      // Add delete logic here
      console.log("Delete category:", row.id);
    }
    setOpen(false);
  };

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
        onClick={handleView}
      >
        View
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={handleEdit}
      >
        Edit
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
        onClick={handleDelete}
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

export default function CategoriesTable({ categories }: { categories: Category[] }) {
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setFilteredCategories([]);
      return;
    }

    let results = categories.filter((category: Category) => {
      if (!category || !category.name) return false;
      return category.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (statusFilter) {
      results = results.filter((category: Category) => category.status === statusFilter);
    }

    setFilteredCategories(results);
  }, [searchTerm, statusFilter, categories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
        <div className="relative">
          <input
            onChange={handleSearchChange}
            value={searchTerm}
            type="text"
            placeholder="Search by category name"
            className="border border-gray-300 h-10 pl-10 text-sm rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-400"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="relative w-full md:w-40">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="border border-gray-300 h-10 text-sm pl-3 pr-8 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-400 appearance-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDownIcon className="h-4 w-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
      <DataTable
        columns={columns as any}
        data={filteredCategories}
        pagination
        highlightOnHover
        pointerOnHover
      />
    </div>
  );
}
