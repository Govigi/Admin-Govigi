"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProductsTable from "@/src/components/product-management/ProductsTable";
import {
  CategoryManagementUrl,
  OrderSummaryUrl,
  ProductManagementUrl,
} from "@/src/libs/utils/API/endpoints";
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export default function ProductManagementDetails() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [perPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, vendorFilter]);

  useEffect(() => {
    document.title = "Products - Admin | Govigi";
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["productStats"] });
  }, [queryClient]);

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products", currentPage, perPage, debouncedSearch, statusFilter, categoryFilter, vendorFilter],
    queryFn: async () => {
      const { data } = await axios.get(OrderSummaryUrl.getAllProducts, {
        params: { page: currentPage, perPage, search: debouncedSearch, status: statusFilter, category: categoryFilter, vendor: vendorFilter },
      });
      return data;
    },
    placeholderData: (prev) => prev,
  });

  const { data: productStats } = useQuery({
    queryKey: ["productStats"],
    queryFn: async () => {
      const { data } = await axios.get(ProductManagementUrl.getProductsStats);
      return data;
    },
    initialData: {
      totalProducts: 0,
      activeProducts: 0,
      outOfStockProducts: 0,
      lowStockProducts: 0,
      totalValue: 0,
    },
  });

  const { data: rawCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get(CategoryManagementUrl.getAllCategories);
      return Array.isArray(data) ? data : data.categories || [];
    },
  });

  const products = productsData?.products || [];
  const totalRows = productsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));

  const stats = useMemo(() => [
    { label: "TOTAL PRODUCTS", value: productStats.totalProducts || 0 },
    { label: "ACTIVE ITEMS", value: productStats.activeProducts || 0 },
    { label: "OUT OF STOCK", value: productStats.outOfStockProducts ?? 0 },
    { label: "LOW INVENTORY", value: productStats.lowStockProducts || 0 },
    { label: "ASSET VALUE", value: `₹${Number(productStats.totalValue || 0).toLocaleString("en-IN")}` },
  ], [productStats]);

  const vendorOptions = useMemo(() => {
    const values = products
      .map((p: any) => p.vendor)
      .filter((v: string | undefined) => Boolean(v));
    return Array.from(new Set(values)) as string[];
  }, [products]);

  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setVendorFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-inter text-gray-900 w-full overflow-x-hidden">
      
      {/* Stats Bar */}
      <div className="flex items-center gap-8 py-4 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        {stats.map((stat, index) => (
          <div key={index} className="shrink-0">
            <div className="text-[10px] text-gray-400 tracking-widest font-bold uppercase">{stat.label}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Header & Actions */}
      <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">
              Inventory Control
            </h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Catalogue & Stock Management</p>
          </div>
          <div className="flex gap-2">
            <button className="flex h-9 items-center gap-2 rounded-none border border-gray-200 bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all">
              <ArrowUpTrayIcon className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={() => router.push("/product-management/AddProduct")}
              className="flex h-9 items-center gap-2 rounded-none bg-black px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-black/5 hover:bg-emerald-600 transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              New Entry
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative group flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS, SKU, VENDORS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-[10px] uppercase font-bold tracking-wider focus:outline-none focus:border-black transition-colors bg-gray-50/30"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest bg-white focus:outline-none focus:border-black"
            >
              <option value="all">ALL CATEGORIES</option>
              {rawCategories.map((cat: any) => (
                <option key={cat._id} value={cat.categoryName || cat.name}>{String(cat.categoryName || cat.name).toUpperCase()}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest bg-white focus:outline-none focus:border-black"
            >
              <option value="all">ALL STATUS</option>
              <option value="active">ACTIVE</option>
              <option value="inactive">INACTIVE</option>
            </select>
            <button 
              onClick={resetFilters}
              className="p-2.5 border border-gray-200 text-gray-400 hover:text-black transition-colors"
              title="Reset Filters"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 relative overflow-hidden bg-white w-full">
        <ProductsTable
          products={products}
          isLoading={isProductsLoading}
          paginationTotalRows={totalRows}
          currentPage={currentPage}
          perPage={perPage}
          totalPages={totalPages}
          onChangePage={setCurrentPage}
        />
      </div>
    </div>
  );
}