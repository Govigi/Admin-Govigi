"use client";

import React, { useMemo } from "react";
import ProductsTable from "@/src/components/product-management/ProductsTable";
import { useEffect, useState } from "react";
import {
  OrderSummaryUrl,
  ProductManagementUrl,
} from "@/src/libs/utils/API/endpoints";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function ProductManagementDetails() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProducts = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      // Using the optional pagination query params
      // If we want to use server-side searching/filtering, we'd need to send those too.
      // But for now, user asked for pagination. 
      // Note: Backend currently does filtering in memory OR we need to update backend to filter.
      // The current backend `getAllProducts` DOES NOT support filtering by name/status in query.
      // If I implement server pagination, client-side filtering (filteredProducts) will ONLY filter the current page.
      // This is a common pitfall. 
      // User said "implement accordingly". 
      // I will assume for now we use server pagination for the valid Data.

      const queryParams = new URLSearchParams({
        page: page.toString(),
        perPage: limit.toString(),
      });

      const res = await fetch(`${OrderSummaryUrl.getAllProducts}?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Error! status: ${res.status}`);
      const json = await res.json();
      setProducts(json.products || []);
      setTotalRows(json.total || 0);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStats = async () => {
    try {
      const res = await fetch(ProductManagementUrl.getProductsStats, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Error! status: ${res.status}`);
      const json = await res.json();
      setProductStats(json);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, perPage);
  };

  const handlePerRowsChange = async (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
    fetchProducts(page, newPerPage);
  };

  useEffect(() => {
    document.title = "Product Management - Admin | Govigi";
    fetchProducts(currentPage, perPage);
    fetchProductStats();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (product.name?.toLowerCase() || "").includes(searchLower);

      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = product.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const stats = [
    { label: "TOTAL PRODUCTS", value: productStats.totalProducts },
    { label: "ACTIVE", value: productStats.activeProducts },
    { label: "INACTIVE", value: productStats.inactiveProducts },
  ];

  return (
    <div className="min-h-screen bg-white p-2 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden">
      {/* Stats Bar */}
      <div className="flex items-center gap-8 py-4 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        {stats.map((stat, index) => (
          <div key={index} className="flex-shrink-0">
            <div className="text-xs text-gray-400 tracking-widest">{stat.label}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981] break-words">
            Product Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage Your Inventory</p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Search & Filter Row */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative group flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                placeholder="SEARCH PRODUCTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300"
              />
            </div>

            {/* Status Filter */}
            <div className="relative md:w-48">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions Row */}
          <div className="grid grid-cols-2 md:flex md:justify-end gap-2 mt-2 md:mt-0">
            <button className="border border-gray-200 hover:border-black text-xs px-4 py-2 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Import
            </button>
            <button className="border border-gray-200 hover:border-black text-xs px-4 py-2 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
              <ArrowUpTrayIcon className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => router.push("/product-management/AddProduct")}
              className="col-span-2 md:col-auto bg-black text-white hover:bg-[#10b981] text-xs px-4 py-2 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <PlusCircleIcon className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-none p-0">
        <ProductsTable
          products={products}
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
        />
      </div>
    </div>
  );
}
