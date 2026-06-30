"use client";

import React, { useEffect, useState, useMemo } from "react";
import { CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import CategoriesTable from "@/src/components/Categories/CategoriesTable";

export default function CategoriesDetails() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [catStats, setCatStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCategories = async () => {
    try {
      const res = await fetch(CategoryManagementUrl.getAllCategories, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Error! status: ${res.status}`);
      const json = await res.json();

      let data = [];
      if (Array.isArray(json)) {
        data = json;
      } else if (json.categories && Array.isArray(json.categories)) {
        data = json.categories;
      } else if (json.data && Array.isArray(json.data)) {
        data = json.data;
      }

      const mappedData = data.map((item: any) => ({
        id: item._id,
        name: item.categoryName,
        description: item.categoryDescription,
        status: item.categoryStatus,
        image: item.categoryImage,
        subCategories: item.subCategories || [],
      }));

      setCategories(mappedData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const fetchCatStats = async () => {
    try {
      const response = await fetch(
        CategoryManagementUrl.getAllCategoriesStats,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCatStats({
          totalCategories: data.totalCategories || 0,
          activeCategories: data.activeCategories || 0,
          inactiveCategories: data.inactiveCategories || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching category stats:", error);
    }
  };

  useEffect(() => {
    document.title = "Categories - Admin | Govigi";
    fetchCategories();
    fetchCatStats();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (category.name?.toLowerCase() || "").includes(searchLower);

      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = category.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const stats = [
    { label: "TOTAL CATEGORIES", value: catStats.totalCategories },
    { label: "ACTIVE", value: catStats.activeCategories },
    { label: "INACTIVE", value: catStats.inactiveCategories },
  ];

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-mono text-gray-900 w-full overflow-x-hidden">
      {/* Stats Bar */}
      <div className="flex items-center gap-8 py-4 border-b border-gray-200 mb-8 overflow-x-auto">
        {stats.map((stat, index) => (
          <div key={index} className="flex-shrink-0">
            <div className="text-xs text-gray-400 tracking-widest">{stat.label}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">
            Categories Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage Product Categories</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search Bar */}
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="SEARCH CATEGORIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full md:w-64 focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full md:w-40 focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="border border-gray-200 hover:border-black text-xs px-4 py-2 uppercase tracking-widest flex items-center gap-2 transition-colors">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Import
            </button>
            <button className="border border-gray-200 hover:border-black text-xs px-4 py-2 uppercase tracking-widest flex items-center gap-2 transition-colors">
              <ArrowUpTrayIcon className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => router.push("/Categories/AddCategory")}
              className="bg-black text-white hover:bg-[#10b981] text-xs px-4 py-2 uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <PlusCircleIcon className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-none p-0">
        <CategoriesTable categories={filteredCategories} onRefresh={fetchCategories} />
      </div>
    </div>
  );
}
