"use client";

import React, { useEffect, useState, useMemo } from "react";
import { SubCategoryManagementUrl, CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import SubcategoriesTable from "@/src/components/Subcategories/SubcategoriesTable";
import axios from "axios";

export default function SubcategoriesDetails() {
  const router = useRouter();

  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCatStats, setSubCatStats] = useState({
    totalSubCategories: 0,
    activeSubCategories: 0,
    inactiveSubCategories: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchCategories = async () => {
    try {
      const res = await fetch(CategoryManagementUrl.getAllCategories);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : json.categories || [];
        setCategories(list);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await fetch(SubCategoryManagementUrl.getAllSubCategories);
      if (!res.ok) throw new Error(`Error! status: ${res.status}`);
      const json = await res.json();

      let data = [];
      if (Array.isArray(json)) {
        data = json;
      } else if (json.subCategories && Array.isArray(json.subCategories)) {
        data = json.subCategories;
      } else if (json.data && Array.isArray(json.data)) {
        data = json.data;
      }

      const mappedData = data.map((item: any) => ({
        id: item._id,
        name: item.subCategoryName,
        description: item.subCategoryDescription,
        status: item.subCategoryStatus,
        image: item.subCategoryImage,
        category: item.category,
      }));

      setSubCategories(mappedData);

      // Compute simple stats
      const total = mappedData.length;
      const active = mappedData.filter((s: any) => s.status === "active").length;
      const inactive = total - active;
      setSubCatStats({
        totalSubCategories: total,
        activeSubCategories: active,
        inactiveSubCategories: inactive,
      });

    } catch (err) {
      console.error("Failed to fetch subcategories:", err);
    }
  };

  useEffect(() => {
    document.title = "Subcategories - Admin | Govigi";
    fetchCategories();
    fetchSubCategories();
  }, []);

  const filteredSubCategories = useMemo(() => {
    return subCategories.filter((sub) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (sub.name?.toLowerCase() || "").includes(searchLower) ||
                            (sub.description?.toLowerCase() || "").includes(searchLower);

      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = sub.status === statusFilter;
      }

      let matchesCategory = true;
      if (categoryFilter !== "all") {
        const catId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
        matchesCategory = catId === categoryFilter;
      }

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [subCategories, searchQuery, statusFilter, categoryFilter]);

  const stats = [
    { label: "TOTAL SUBCATEGORIES", value: subCatStats.totalSubCategories },
    { label: "ACTIVE", value: subCatStats.activeSubCategories },
    { label: "INACTIVE", value: subCatStats.inactiveSubCategories },
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
            Subcategories Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage Product Sub-Classifications</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search Bar */}
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="SEARCH SUBCATEGORIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full md:w-64 focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full md:w-48 focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer"
            >
              <option value="all">Category: All</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {String(cat.categoryName || cat.name).toUpperCase()}
                </option>
              ))}
            </select>
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
            <button
              onClick={() => router.push("/Subcategories/AddSubcategory")}
              className="bg-black text-white hover:bg-[#10b981] text-xs px-4 py-2 uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <PlusCircleIcon className="w-4 h-4" />
              Add Subcategory
            </button>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-none p-0">
        <SubcategoriesTable subcategories={filteredSubCategories} onRefresh={fetchSubCategories} />
      </div>
    </div>
  );
}
