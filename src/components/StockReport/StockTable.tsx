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

const columns = [
  {
    name: "Product",
    selector: (row) => row.name,
    sortable: true,
  },
  {
    name: "Category",
    selector: (row) => row.category,
    sortable: true,
  },
  {
    name: "Stock",
    selector: (row) => row.stock,
    sortable: true,
  },
  {
    name: "Image",
    selector: (row) => (
      <img
        src={row.image?.url}
        alt={row.name}
        className="h-10 w-10 object-contain rounded"
      />
    ),
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

export default function StockTable({ products }) {
  const [filteredProducts, setFilteredProducts] = useState(products);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const results = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
        <div className="relative">
          <input
            onChange={handleSearchChange}
            value={searchTerm}
            type="text"
            placeholder="Search by product name"
            className="border border-gray-300 h-10 pl-10 text-sm rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-400"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="flex space-x-2">
          <div className="relative w-full md:w-35">
            <select className="border border-gray-300 h-10 text-sm pl-3 pr-8 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-400 appearance-none">
              <option value="">All Categories</option>
            </select>
            <ChevronDownIcon className="h-4 w-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative w-full md:w-40">
            <select className="border border-gray-300 h-10 text-sm pl-3 pr-8 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-400 appearance-none">
              <option value="">All Stock Status</option>
              <option value="inStock">In Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
            <ChevronDownIcon className="h-4 w-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
      <DataTable
        columns={columns as any}
        data={filteredProducts}
        pagination
        highlightOnHover
        pointerOnHover
      />
    </div>
  );
}
