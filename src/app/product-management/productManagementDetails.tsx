"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProductsTable from "@/src/components/product-management/ProductsTable";
import BulkUpdateModal from "@/src/components/product-management/BulkUpdateModal";
import {
  CategoryManagementUrl,
  OrderSummaryUrl,
  ProductManagementUrl,
} from "@/src/libs/utils/API/endpoints";
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export default function ProductManagementDetails() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");

  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return "";
    let str = String(val);
    str = str.replace(/"/g, '""');
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str}"`;
    }
    return str;
  };

  const handleExportToCSV = async () => {
    try {
      setIsExporting(true);
      const { data } = await axios.get(OrderSummaryUrl.getAllProducts, {
        params: {
          page: 1,
          perPage: 100000,
          search: debouncedSearch,
          status: statusFilter,
          category: categoryFilter,
          vendor: vendorFilter
        },
      });

      const exportList = data?.products || [];
      if (exportList.length === 0) {
        alert("No products found to export.");
        setIsExporting(false);
        return;
      }

      const headers = [
        "Name",
        "SKU",
        "Category",
        "Sub Category",
        "Description",
        "Unit",
        "Price Per Kg",
        "MRP",
        "Cost Price",
        "Current Stock",
        "Stock Status",
        "Lifecycle Status",
        "Max Order Quantity",
        "Minimum Threshold",
        "Shelf Life (Days)",
        "Storage Instructions",
        "Tags",
        "Image URL"
      ];

      const rows = exportList.map((prod: any) => {
        const categoryId = typeof prod.category === 'object' ? prod.category?._id : prod.category;
        const categoryName = categoryMap[categoryId] || (typeof prod.category === 'object' ? prod.category?.categoryName || prod.category?.name : null) || prod.category || "General";
        
        return [
          prod.name || "",
          prod.sku || "",
          categoryName,
          typeof prod.subCategory === "object" ? prod.subCategory?.subCategoryName || prod.subCategory?.name || "" : prod.subCategory || "",
          prod.description || "",
          prod.unit || "",
          prod.pricePerKg !== undefined ? String(prod.pricePerKg) : "",
          prod.mrp !== undefined ? String(prod.mrp) : "",
          prod.costPrice !== undefined ? String(prod.costPrice) : "",
          prod.currentStock !== undefined ? String(prod.currentStock) : "",
          prod.stock || "Available",
          prod.status || "active",
          prod.maxOrderQuantity !== undefined ? String(prod.maxOrderQuantity) : "",
          prod.minimumThreshold !== undefined ? String(prod.minimumThreshold) : "",
          prod.shelfLife !== undefined ? String(prod.shelfLife) : "",
          prod.storageInstructions || "",
          Array.isArray(prod.tags) ? prod.tags.join(", ") : "",
          prod.image?.url || ""
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row: string[]) => row.map(escapeCSV).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `govigi_products_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export Error:", error);
      alert("Failed to export products.");
    } finally {
      setIsExporting(false);
    }
  };

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

  const categoryMap = useMemo(() => {
    return rawCategories.reduce((acc: Record<string, string>, cat: any) => {
      const name = cat.categoryName || cat.name;
      if (name) {
        if (cat._id) acc[cat._id] = name;
        acc[name] = name;
      }
      return acc;
    }, {});
  }, [rawCategories]);

  const products = (productsData?.products || []).map((product: any) => {
    const categoryId = typeof product.category === 'object' ? product.category?._id : product.category;
    const categoryName = categoryMap[categoryId] || (typeof product.category === 'object' ? product.category?.categoryName || product.category?.name : null);
    
    return {
      ...product,
      category: categoryName || product.category || 'General',
    };
  });
  const totalRows = productsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));

  const stats = useMemo(() => [
    { label: "TOTAL PRODUCTS", value: productStats.totalProducts || 0 },
    { label: "ACTIVE ITEMS", value: productStats.activeProducts || 0 },
    { label: "OUT OF STOCK", value: productStats.outOfStockProducts ?? 0 },
    { label: "LOW INVENTORY", value: productStats.lowStockProducts || 0 },
    { label: "ASSET VALUE", value: `₹${Number(productStats.totalValue || 0).toLocaleString("en-IN")}` },
  ], [productStats]);

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
            {selectedRows.length > 0 && (
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="flex h-9 items-center gap-2 rounded-none bg-[#10b981] px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-[#10b981]/5 hover:bg-emerald-600 transition-all"
              >
                Bulk Update ({selectedRows.length})
              </button>
            )}
            <button className="flex h-9 items-center gap-2 rounded-none border border-gray-200 bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all">
              <ArrowUpTrayIcon className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={handleExportToCSV}
              disabled={isExporting}
              className="flex h-9 items-center gap-2 rounded-none border border-gray-200 bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export"}
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
                <option key={cat._id} value={cat._id}>{String(cat.categoryName || cat.name).toUpperCase()}</option>
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
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest bg-white focus:outline-none focus:border-black"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
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

      <div className="border border-gray-200 rounded-none p-0">
        <ProductsTable
          products={products}
          isLoading={isProductsLoading}
          paginationTotalRows={totalRows}
          currentPage={currentPage}
          perPage={perPage}
          totalPages={totalPages}
          onChangePage={setCurrentPage}
          onSelectedRowsChange={(selected) => setSelectedRows(selected.selectedRows)}
        />
      </div>

      <BulkUpdateModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setSelectedRows([]);
        }}
        selectedCount={selectedRows.length}
        selectedIds={selectedRows.map((r) => r._id)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["productStats"] });
        }}
      />

    </div>
  );
}