"use client";

import React from "react";
import { useEffect, useState } from "react";
import { CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import {
  Square2StackIcon,
  Square3Stack3DIcon,
  Squares2X2Icon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import StatCard from "@/src/components/statcard";

export default function CategoriesPage() {
  const [catStats, setCatStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
  });

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
        console.log("Category Stats Data:", data);
        setCatStats({
          totalCategories: data.totalCategories || 0,
          activeCategories: data.activeCategories || 0,
          inactiveCategories: data.inactiveCategories || 0,
        });
      } else {
        const errorData = await response.json();
      }
    } catch (error) {
      console.error("Error fetching category stats:", error);
    }
  };

  useEffect(() => {
    fetchCatStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Categories Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Categories"
          value={catStats.totalCategories}
          color="bg-blue-100"
          icon={<Square2StackIcon className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="Active Categories"
          value={catStats.activeCategories}
          color="bg-green-100"
          icon={<Square3Stack3DIcon className="h-6 w-6 text-green-600" />}
        />
        <StatCard
          title="Inactive Categories"
          value={catStats.inactiveCategories}
          color="bg-red-100"
          icon={<Squares2X2Icon className="h-6 w-6 text-red-600" />}
        />
      </div>
      {/* Add your categories management UI here */}
    </div>
  );
}
