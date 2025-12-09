"use client";

import React from "react";
import { useEffect, useState } from "react";
import { CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import {
  Square2StackIcon,
  Square3Stack3DIcon,
  Squares2X2Icon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import StatCard from "@/src/components/statcard";
import { useRouter } from "next/navigation";
import CategoriesTable from "@/src/components/Categories/CategoriesTable";

export default function CategoriesDetails() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [catStats, setCatStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
  });

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
      console.log("API Response:", json);
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(json)) {
        data = json;
      } else if (json.categories && Array.isArray(json.categories)) {
        data = json.categories;
      } else if (json.data && Array.isArray(json.data)) {
        data = json.data;
      }
      
      // Map API fields to component fields
      const mappedData = data.map((item: any) => ({
        id: item._id,
        name: item.categoryName,
        description: item.categoryDescription,
        status: item.categoryStatus,
        image: item.categoryImage,
      }));
      
      console.log("Setting categories:", mappedData);
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
    document.title = "Categories - Admin | Govigi";
    fetchCategories();
    fetchCatStats();
  }, []);

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Categories Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Categories"
            value={catStats.totalCategories}
            color="bg-[#007e5d]"
            icon={<Square2StackIcon className="h-6 w-6 text-white" />}
          />
          <StatCard
            title="Active Categories"
            value={catStats.activeCategories}
            color="bg-green-500"
            icon={<Square3Stack3DIcon className="h-6 w-6 text-white" />}
          />
          <StatCard
            title="Inactive Categories"
            value={catStats.inactiveCategories}
            color="bg-red-500"
            icon={<Squares2X2Icon className="h-6 w-6 text-white" />}
          />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Categories List
            </h2>
            <button
              className="bg-[#007e5d] text-white p-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center cursor-pointer"
              onClick={() => {
                router.push("/Categories/AddCategory");
              }}
            >
              <PlusCircleIcon className="h-5 w-5 inline-block mr-2" />
              Add Category
            </button>
          </div>
        </div>

        <CategoriesTable categories={categories} />
      </div>
    </>
  );
}
