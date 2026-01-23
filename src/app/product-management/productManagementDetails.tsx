"use client";

import React, { useState, useEffect } from "react";
import ProductsTable from "@/src/components/product-management/ProductsTable";

import {
  CategoryManagementUrl,
  OrderSummaryUrl,
  ProductManagementUrl,
} from "@/src/libs/utils/API/endpoints";
import {
  ArrowUpTrayIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyRupeeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function ProductManagementDetails() {
  const router = useRouter();

  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    document.title = "Product Management - Admin | Govigi";
  }, []);

  // --- QUERIES ---

  // 1. Fetch Products
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: [
      "products",
      currentPage,
      perPage,
      debouncedSearch,
      statusFilter,
      categoryFilter,
    ],
    queryFn: async () => {
      const { data } = await axios.get(OrderSummaryUrl.getAllProducts, {
        params: {
          page: currentPage,
          perPage: perPage,
          search: debouncedSearch,
          status: statusFilter,
          category: categoryFilter,
        },
      });
      return data;
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });

  const products = productsData?.products || [];
  const totalRows = productsData?.total || 0;

  // 2. Fetch Stats
  const { data: productStats } = useQuery({
    queryKey: ["productStats"],
    queryFn: async () => {
      const { data } = await axios.get(ProductManagementUrl.getProductsStats);
      return data;
    },
    initialData: {
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0,
    },
  });

  // 3. Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get(CategoryManagementUrl.getAllCategories);
      return data || [];
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const stats = [
    { label: "TOTAL PRODUCTS", value: productStats.totalProducts },
    { label: "ACTIVE", value: productStats.activeProducts },
    { label: "INACTIVE", value: productStats.inactiveProducts },
  ];

  return (
    <div className="min-h-screen bg-white p-2 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden pb-24">
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

            {/* Category Filter */}
            <div className="relative md:w-48">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer"
              >
                <option value="all">Category: All</option>
                {categories.map((category: any) => (
                  <option key={category._id} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>


          {/* Actions Row */}
          <div className="grid grid-cols-2 md:flex md:justify-end gap-2 mt-2 md:mt-0">
            <button
              onClick={() => router.push("/product-management/bulk-pricing")}
              className="col-span-1 md:col-auto border border-gray-200 hover:border-black text-xs px-4 py-2 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <CurrencyRupeeIcon className="w-4 h-4" />
              Price Change
            </button>

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
