"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface ProductsTableProps {
  products: any[];
  isLoading?: boolean;
  paginationTotalRows?: number;
  currentPage?: number;
  perPage?: number;
  totalPages?: number;
  onChangePage?: (page: number) => void;
}

function productSku(row: any) {
  if (row.sku) return row.sku;
  const name = String(row.name || "PRD").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "PRD";
  const id = String(row._id || "").slice(-3).toUpperCase() || "001";
  return `${name}${id}`;
}

export default function ProductsTable({
  products,
  isLoading = false,
  paginationTotalRows = 0,
  currentPage = 1,
  perPage = 10,
  totalPages = 1,
  onChangePage,
}: ProductsTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const safeProducts = products || [];
  const start = paginationTotalRows === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, paginationTotalRows);

  const toggleAll = () => {
    if (safeProducts.every(p => selectedRows.includes(p._id))) {
      setSelectedRows(prev => prev.filter(id => !safeProducts.some(p => p._id === id)));
    } else {
      setSelectedRows(prev => Array.from(new Set([...prev, ...safeProducts.map(p => p._id)])));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };

  const paginationItems = useMemo(() => {
    const total = totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, idx) => idx + 1);

    const pages: Array<number | string> = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(total - 1, currentPage + 1);

    if (left > 2) pages.push("left-ellipsis");
    for (let page = left; page <= right; page += 1) {
      pages.push(page);
    }
    if (right < total - 1) pages.push("right-ellipsis");
    pages.push(total);

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="w-full bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-black focus:ring-black"
                  checked={safeProducts.length > 0 && safeProducts.every(p => selectedRows.includes(p._id))}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Information</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Price Point</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fetching Catalogue...</span>
                  </div>
                </td>
              </tr>
            ) : safeProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  No products found
                </td>
              </tr>
            ) : (
              safeProducts.map((row) => (
                <tr key={row._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => router.push(`/product-management/AddProduct?id=${row._id}`)}>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-black focus:ring-black"
                      checked={selectedRows.includes(row._id)}
                      onChange={() => toggleRow(row._id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 flex-shrink-0 relative overflow-hidden rounded-sm">
                        {row.image?.url ? (
                          <img src={row.image.url} alt={row.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200 font-bold text-xs uppercase">
                            {String(row.name || "P").slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase text-gray-800 tracking-tight">{row.name || "Untitled"}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5 tracking-tighter">SKU: {productSku(row)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-gray-50 text-[9px] font-bold border border-gray-100 rounded uppercase tracking-wider text-gray-500">
                      {typeof row.category === "object"
                        ? row.category.categoryName || row.category.name || row.category._id || "General"
                        : row.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-gray-900">₹{row.pricePerKg || row.price || 0}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">per {row.unit || "kg"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold border uppercase tracking-widest ${
                      row.status === "inactive" 
                      ? "border-amber-200 text-amber-700 bg-amber-50" 
                      : "border-green-200 text-green-700 bg-green-50"
                    }`}>
                      {row.status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/product-management/AddProduct?id=${row._id}`)}
                        className="p-2 border border-gray-100 text-gray-400 hover:text-black hover:border-black transition-all"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 border border-gray-100 text-gray-400 hover:text-black hover:border-black transition-all">
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {start} - {end} of {paginationTotalRows} items
          </p>
          <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
              <span>Page</span>
              <span className="font-black text-gray-900">{currentPage}</span>
              <span>of</span>
              <span className="font-black text-gray-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                disabled={currentPage <= 1}
                onClick={() => onChangePage?.(1)}
                className="px-3 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:text-black transition-all"
              >
                First
              </button>
              <button
                disabled={currentPage <= 1}
                onClick={() => onChangePage?.(currentPage - 1)}
                className="px-3 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:text-black transition-all"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {paginationItems.map((item) => (
                typeof item === "string" ? (
                  <span key={item} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => onChangePage?.(item)}
                    className={`px-3 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest transition-all ${item === currentPage ? "bg-black text-white" : "text-gray-500 hover:border-black hover:text-black"}`}
                    disabled={item === currentPage}
                  >
                    {item}
                  </button>
                )
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => onChangePage?.(currentPage + 1)}
                className="px-3 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:text-black transition-all"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => onChangePage?.(totalPages)}
                className="px-3 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-black hover:text-black transition-all"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
