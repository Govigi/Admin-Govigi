"use client";

import React from "react";
import StockTable from "@/src/components/StockReport/StockTable";
import { useEffect, useState } from "react";
import {
  OrderSummaryUrl,
  ProductManagementUrl,
} from "@/src/libs/utils/API/endpoints";
import StatCard from "@/src/components/statcard";
import {
  ShoppingBagIcon,
  Squares2X2Icon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function StockDetails() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch(OrderSummaryUrl.getAllProducts, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Error! status: ${res.status}`);
      const json = await res.json();
      setProducts(json.products);
    } catch (err) {
      console.error("Failed to fetch data:", err);
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

  useEffect(() => {
    document.title = "Stock Report - Admin | Govigi";
    fetchProducts();
    fetchProductStats();
  }, []);

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Products Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={productStats.totalProducts}
            color="bg-[#007e5d]"
            icon={<Squares2X2Icon className="h-6 w-6 text-white" />}
          />
          <StatCard
            title="Active Products"
            value={productStats.activeProducts}
            color="bg-green-500"
            icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
          />
          <StatCard
            title="Inactive Products"
            value={productStats.inactiveProducts}
            color="bg-red-500"
            icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
          />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Product List
            </h2>
            <div className="flex flex-row gap-4">
              <button className="border border-gray-300 text-black p-2 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center cursor-pointer">
                <ArrowDownTrayIcon className="h-4 w-4 inline-block mr-2" />
                Import
              </button>
              <div>
                <button className="border border-gray-300 text-black p-2 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center cursor-pointer">
                  <ArrowUpTrayIcon className="h-4 w-4 inline-block mr-2" />
                  Export
                </button>
              </div>
              <button
                className="bg-[#007e5d] text-white p-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center cursor-pointer"
                onClick={() => {
                  router.push("/Products/AddProduct");
                }}
              >
                <PlusCircleIcon className="h-5 w-5 inline-block mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        <StockTable products={products} />
      </div>
    </>
  );
}
